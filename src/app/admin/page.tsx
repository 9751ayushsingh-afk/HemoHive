
import React from 'react';
import Link from 'next/link';
import { UserPlus, Users, Truck, Activity } from 'lucide-react';
import dbConnect from '../../lib/dbConnect';
import Driver from '../../models/Driver';
import User from '../../models/User';

export default async function AdminDashboard() {
    await dbConnect();

    // Basic Stats (Can be real in future)
    const totalDrivers = await Driver.countDocuments();
    const onlineDrivers = await Driver.countDocuments({ status: 'ONLINE' });
    const totalUsers = await User.countDocuments({ role: 'donor' });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Drivers</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalDrivers}</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                            <Truck size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Online Now</p>
                            <h3 className="text-3xl font-bold text-green-600 mt-2">{onlineDrivers}</h3>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-green-600">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Donors</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalUsers}</h3>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-red-600">
                            <Users size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <Link href="/admin/drivers/add" className="group">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <UserPlus className="mb-4 text-green-400 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-lg font-bold">Register New Driver</h3>
                        <p className="text-slate-400 text-sm mt-2">Create credentials for a new delivery partner.</p>
                    </div>
                </Link>

                {/* Add more actions here */}
            </div>
        </div>
    );
}
