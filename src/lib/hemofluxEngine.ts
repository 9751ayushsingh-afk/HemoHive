import BloodBag, { IBloodBag } from '@/models/BloodBag';
import User from '@/models/User';
import mongoose from 'mongoose';
import dbConnect from './dbConnect';

// Error Types
class HemoFluxError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "HemoFluxError";
    }
}

/**
 * HemoFlux Engine
 * Core logic for the Inter-Hospital Blood Exchange System
 */
const HemoFlux = {

    /**
     * Check if a Blood Bag is eligible for listing in the HemoFlux Exchange.
     * Rules:
     * 1. Must be AVAILABLE.
     * 2. Must not be expired.
     * 3. Must have transferCount == 0 (One-Hop Rule).
     * 4. Cold Chain must be intact.
     */
    checkEligibility: async (bagId: string): Promise<{ eligible: boolean; reason?: string }> => {
        await dbConnect();
        const bag = await BloodBag.findOne({ bagId });

        if (!bag) return { eligible: false, reason: 'Bag not found' };

        // Rule 1: Status
        if (bag.status !== 'AVAILABLE') return { eligible: false, reason: `Status is ${bag.status}, must be AVAILABLE` };

        // Rule 2: Expiry
        if (new Date(bag.expiryDate) < new Date()) return { eligible: false, reason: 'Bag is expired' };

        // Rule 3: One-Hop Limit
        if (bag.transferCount >= 1) return { eligible: false, reason: 'One-Time Transfer limit reached' };

        // Rule 4: Listing Window (Must be nearing expiry, e.g., <= 15 days)
        const daysToExpiry = (new Date(bag.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysToExpiry > 15) return { eligible: false, reason: `Too early to list. Can only list units expiring in <= 15 days. (${Math.ceil(daysToExpiry)} days left)` };

        // Rule 5: Cold Chain
        if (!bag.coldChainIntegrity) return { eligible: false, reason: 'Cold Chain integrity breach detected' };

        return { eligible: true };
    },

    /**
     * List a unit on the HemoFlux Exchange.
     */
    listUnit: async (bagId: string, hospitalId: string) => {
        await dbConnect();
        const eligibility = await HemoFlux.checkEligibility(bagId);

        if (!eligibility.eligible) {
            throw new HemoFluxError(eligibility.reason || 'Unit ineligible for exchange');
        }

        // Verify ownership
        const bag = await BloodBag.findOne({ bagId });
        if (bag.currentOwnerId.toString() !== hospitalId) {
            throw new HemoFluxError('Unauthorized: You do not own this unit');
        }

        bag.exchangeStatus = 'LISTED';
        await bag.save();
        return bag;
    },

    /**
     * Execute the One-Time Transfer from Hospital A to Hospital B.
     * This logic MUST be atomic.
     */
    executeTransfer: async (bagId: string, requestingHospitalId: string) => {
        // Note: Transaction support requires MongoDB Replica Set. 
        // If running standalone, transactions might fail. We use a session pattern here.
        await dbConnect();
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const bag = await BloodBag.findOne({ bagId }).session(session);

            if (!bag) throw new HemoFluxError('Bag not found');

            // Re-Check Eligibility inside transaction (Race condition protection)
            if (bag.exchangeStatus !== 'LISTED') throw new HemoFluxError('Bag is not listed for exchange');
            if (bag.transferCount >= 1) throw new HemoFluxError('Security Lock: Transfer limit exceeded');
            if (new Date(bag.expiryDate) < new Date()) throw new HemoFluxError('Security Lock: Unit expired during transaction');

            // Update Ownership logic
            const previousOwner = bag.currentOwnerId;

            bag.currentOwnerId = requestingHospitalId;
            bag.status = 'TRANSFERRED'; // It is now in 'Transferred' state until received/verified? Or effectively transferred.
            // Let's assume 'TRANSFERRED' implies it's leaving origin. 
            // Ideally, we'd have a 'IN_TRANSIT' state, but for this simplified engine, we move ownership immediately.

            bag.exchangeStatus = 'TRANSFERRED';
            bag.transferCount += 1; // INCREMENT LOCK

            // Save
            await bag.save({ session });

            // Note: We are NOT modifying the 'Inventory' aggregate collection here.
            // The frontend should derive 'Available Stock' from counting BloodBag documents, 
            // OR we need to sync the aggregates. 
            // For HemoFlux to verify granular precision, we stick to BloodBag as source of truth.

            await session.commitTransaction();
            session.endSession();

            return { success: true, bagId: bag.bagId, newOwner: requestingHospitalId };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },

    /**
     * Calculate Wastage Metrics for the Dashboard Gauge.
     * Returns a score 0-100 (100 = No Wastage).
     */
    calculateMetrics: async (hospitalId: string) => {
        await dbConnect();
        const totalUnits = await BloodBag.countDocuments({
            $or: [{ currentOwnerId: hospitalId }, { originHospitalId: hospitalId }]
        });

        if (totalUnits === 0) return { score: 100, wastageRate: 0, savedCount: 0 };

        const expiredUnits = await BloodBag.countDocuments({
            currentOwnerId: hospitalId,
            status: 'EXPIRED'
        });

        const exchangedUnits = await BloodBag.countDocuments({
            originHospitalId: hospitalId,
            status: 'TRANSFERRED', // Successfully moved to someone else
        });

        const wastageRate = (expiredUnits / totalUnits) * 100;
        const score = Math.max(0, 100 - wastageRate);

        // Grade
        let grade = 'Green';
        if (score < 80) grade = 'Yellow';
        if (score < 50) grade = 'Red';

        return {
            score: Math.round(score),
            wastagePercentage: wastageRate.toFixed(1),
            savedviaExchange: exchangedUnits,
            grade
        };
    }
};

export default HemoFlux;
