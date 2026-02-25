import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAuth } from '@/lib/auth';
import Hospital from '@/models/Hospital';
import User from '@/models/User';
import SettingsChangeLog from '@/models/SettingsChangeLog';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        const { user, error } = await getAuth(req);
        if (error || !user || user.role !== 'hospital' || !user.hospitalId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let hospital = await Hospital.findById(user.hospitalId).select('-password').lean();

        if (!hospital) {
            // Auto-create hospital profile from User data if it doesn't exist yet
            const dbUser = await User.findById(user.hospitalId).lean() as any;
            if (!dbUser) {
                return NextResponse.json({ message: 'Associated User not found' }, { status: 404 });
            }

            const newHospitalDoc = await Hospital.create({
                _id: user.hospitalId,
                name: dbUser.fullName || 'Untitled Hospital',
                email: dbUser.email || 'no-email@hemohive.demo',
                contact: dbUser.mobile || '',
                location: dbUser.address || '',
                gps: { lat: 0, lng: 0 }
            });
            hospital = newHospitalDoc.toObject() as any;
        }

        // Fetch logs
        const logs = await SettingsChangeLog.find({ hospitalId: user.hospitalId })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({ hospital, logs }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    await dbConnect();
    try {
        const { user, error } = await getAuth(req);
        if (error || !user || user.role !== 'hospital' || !user.hospitalId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const currentHospital = await Hospital.findById(user.hospitalId).lean() as any;

        // Define allowed fields to update and sync to User
        const updateData: any = {};
        const userUpdateData: any = {};
        const changes: any[] = [];

        if (data.name && data.name !== currentHospital?.name) {
            updateData.name = data.name;
            userUpdateData.fullName = data.name;
            changes.push({ field: 'Hospital Name', oldValue: currentHospital?.name || 'N/A', newValue: data.name });
        }
        if (data.contact && data.contact !== currentHospital?.contact) {
            updateData.contact = data.contact;
            userUpdateData.mobile = data.contact;
            changes.push({ field: 'Contact Number', oldValue: currentHospital?.contact || 'N/A', newValue: data.contact });
        }
        if (data.location && data.location !== currentHospital?.location) {
            updateData.location = data.location;
            userUpdateData.address = data.location;
            changes.push({ field: 'Address', oldValue: currentHospital?.location || 'N/A', newValue: data.location });
        }

        if (changes.length === 0) {
            return NextResponse.json({ message: 'No changes detected' }, { status: 200 });
        }

        // 1. Update Hospital document
        const updatedHospital = await Hospital.findByIdAndUpdate(
            user.hospitalId,
            { $set: updateData },
            { new: true, runValidators: true, upsert: true }
        ).select('-password').lean();

        // 2. Sync to User document
        await User.findByIdAndUpdate(user.hospitalId, { $set: userUpdateData });

        // 3. Log changes
        const logEntries = changes.map(change => ({
            hospitalId: user.hospitalId,
            field: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            timestamp: new Date()
        }));
        await SettingsChangeLog.insertMany(logEntries);

        return NextResponse.json({
            message: 'Settings updated successfully and synced to user database',
            hospital: updatedHospital
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
