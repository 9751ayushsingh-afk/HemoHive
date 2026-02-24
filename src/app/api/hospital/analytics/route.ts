import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAuth } from '@/lib/auth';
import BloodBag from '@/models/BloodBag';
import InventoryChangeLog from '@/models/InventoryChangeLog';
import Inventory from '@/models/Inventory';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { user, error } = await getAuth(req);
        if (error || !user || user.role !== 'hospital' || !user.hospitalId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const hospitalId = new mongoose.Types.ObjectId(user.hospitalId);

        // Parse timeframe from query params
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '30d';

        let startDate = new Date();
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case '15d':
                startDate.setDate(startDate.getDate() - 15);
                break;
            case '6m':
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date(0); // Beginning of time
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        // 1. Current Stock by Blood Group
        const stockRecords = await Inventory.find({ hospital: hospitalId }).lean();
        const stock = stockRecords.map(s => ({ _id: s.bloodGroup, quantity: s.quantity }));

        // 2. Recent Inventory Movements (Transactions)
        const recentMovements = await InventoryChangeLog.find({ hospitalId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // 3. Trends - Aggregated by day and action
        const trends = await InventoryChangeLog.aggregate([
            {
                $match: {
                    hospitalId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        action: "$action"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.day": 1 }
            }
        ]);

        // 4. Distribution (Total count of bags per status/group)
        const distribution = await BloodBag.aggregate([
            { $match: { currentOwnerId: hospitalId, createdAt: { $gte: startDate } } },
            { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
        ]);

        // 5. Expiry Check (Units expiring in next 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringSoon = await BloodBag.countDocuments({
            currentOwnerId: hospitalId,
            status: 'AVAILABLE',
            expiryDate: { $lte: sevenDaysFromNow, $gt: new Date() }
        });

        return NextResponse.json({
            stock,
            recentMovements,
            trends,
            distribution,
            expiringSoon,
            totalBags: await BloodBag.countDocuments({ currentOwnerId: hospitalId })
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
