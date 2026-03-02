import BloodBag, { IBloodBag } from '../models/BloodBag';
import Inventory from '../models/Inventory';
import User from '../models/User';
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
        // Removed transaction logic to support standalone MongoDB instances (local dev).
        await dbConnect();

        try {
            const bag = await BloodBag.findOne({ bagId });

            if (!bag) throw new HemoFluxError('Bag not found');

            // Re-Check Eligibility (Race condition protection is weaker without a session, but needed for standalone instances)
            if (bag.exchangeStatus !== 'LISTED') throw new HemoFluxError('Bag is not listed for exchange');
            if (bag.transferCount >= 1) throw new HemoFluxError('Security Lock: Transfer limit exceeded');
            if (new Date(bag.expiryDate) < new Date()) throw new HemoFluxError('Security Lock: Unit expired');

            // Update Ownership logic
            const previousOwner = bag.currentOwnerId;

            bag.currentOwnerId = requestingHospitalId;
            // The bag is physically moving, so it is IN_TRANSIT
            bag.status = 'IN_TRANSIT';

            bag.exchangeStatus = 'IN_TRANSIT';
            // Increment Lock
            bag.transferCount += 1;

            // Save the bag
            await bag.save();

            // DECREMENT Previous Owner's Inventory Summary
            await Inventory.findOneAndUpdate(
                { hospital: previousOwner, bloodGroup: bag.bloodGroup },
                { $inc: { quantity: -1 }, $set: { lastUpdated: new Date() } }
            );

            return { success: true, bagId: bag.bagId, newOwner: requestingHospitalId };

        } catch (error) {
            throw error;
        }
    },

    /**
     * Finalize the transfer when the receiving hospital physically gets the bag.
     * Checks cold chain integrity.
     */
    confirmReceipt: async (bagId: string, receivingHospitalId: string, coldChainIntact: boolean) => {
        await dbConnect();
        const bag = await BloodBag.findOne({ bagId });

        if (!bag) throw new HemoFluxError('Bag not found');

        // Ensure the person confirming is the person who claimed it
        if (bag.currentOwnerId.toString() !== receivingHospitalId) {
            throw new HemoFluxError('Unauthorized: You are not the claimer of this unit');
        }

        if (bag.exchangeStatus !== 'IN_TRANSIT') {
            throw new HemoFluxError('Bag is not currently in transit');
        }

        bag.exchangeStatus = 'TRANSFERRED';
        bag.coldChainIntegrity = coldChainIntact;

        if (coldChainIntact) {
            bag.status = 'AVAILABLE';

            // INCREMENT Receiver's Inventory Summary
            await Inventory.findOneAndUpdate(
                { hospital: receivingHospitalId, bloodGroup: bag.bloodGroup },
                { $inc: { quantity: 1 }, $set: { lastUpdated: new Date() } },
                { upsert: true }
            );
        } else {
            // UNIT IS MEDICALLY UNFIT - Return liability to Origin Hospital
            bag.status = 'DISCARDED';
            bag.currentOwnerId = bag.originHospitalId; // Sender takes the hit
            bag.notes = (bag.notes ? bag.notes + ' | ' : '') + 'CRITICAL: Cold chain integrity breach during transit. Unit rejected and returned to sender liability as DISCARDED.';

            // Note: We do NOT increment the receiver's Inventory because it should never be used.
        }

        await bag.save();
        return bag;
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

        if (totalUnits === 0) return { score: 100, wastagePercentage: '0.0', savedviaExchange: 0, grade: 'Green' };

        const expiredUnits = await BloodBag.countDocuments({
            currentOwnerId: hospitalId,
            status: { $in: ['EXPIRED', 'DISCARDED'] }
        });

        const exchangedUnits = await BloodBag.countDocuments({
            originHospitalId: hospitalId,
            status: 'AVAILABLE', // Only count units that are still active/available at the destination
            currentOwnerId: { $ne: hospitalId }
        }) + await BloodBag.countDocuments({
            originHospitalId: hospitalId,
            status: 'TRANSFERRED', // Successfully used/transferred units
            currentOwnerId: { $ne: hospitalId }
        });

        const rejectionUnits = await BloodBag.countDocuments({
            originHospitalId: hospitalId,
            status: 'DISCARDED',
            coldChainIntegrity: false
        });

        // Standard Wastage (Expired / Discarded without transit failure)
        let wastageRate = (expiredUnits / totalUnits) * 100;

        // Strict Medical Penalty: 
        // We add a flat +2.5% penalty to the wastage rate for every unit rejected due to cold chain failure, 
        // to ensure the impact is immediately visible even for hospitals with thousands of units in inventory.
        wastageRate += (rejectionUnits * 2.5);

        const score = Math.max(0, 100 - wastageRate);

        // Grade
        let grade = 'Green';
        if (score < 80) grade = 'Yellow';
        if (score < 50) grade = 'Red';

        return {
            score: Math.round(score),
            wastagePercentage: wastageRate.toFixed(1),
            savedviaExchange: exchangedUnits,
            rejections: rejectionUnits,
            grade
        };
    }
};

export default HemoFlux;
