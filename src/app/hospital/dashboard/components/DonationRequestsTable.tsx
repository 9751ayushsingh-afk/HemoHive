'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Droplet } from 'lucide-react';
// @ts-ignore
import QrReader from 'react-qr-scanner';

const DonationRequestsTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyId, setVerifyId] = useState<string | null>(null);
    const [dpnInput, setDpnInput] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/hospital/appointments');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/hospital/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            if (res.ok) {
                fetchRequests();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
    };

    const handleVerify = () => {
        const appointment: any = requests.find((r: any) => r._id === verifyId);
        if (!appointment) return;

        if (dpnInput.trim() !== appointment.qr_code) {
            alert('Invalid Donation Pass Number! Please check the donor\'s ticket.');
            return;
        }
        setIsVerified(true);
    };

    const handleComplete = async () => {
        await handleStatusUpdate(verifyId!, 'completed');
        setVerifyId(null);
        setDpnInput('');
        setIsVerified(false);
        setIsScanning(false);
    };

    if (loading) return <div className="p-4 bg-white rounded-2xl shadow-sm text-center">Loading requests...</div>;

    const sortedRequests = [...requests].sort((a: any, b: any) => {
        const priority: any = { pending: 1, confirmed: 2, completed: 3, cancelled: 4 };
        return priority[a.status] - priority[b.status];
    });

    if (sortedRequests.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Droplet className="text-red-600" size={20} />
                    RaktSeva
                </h3>
                <p className="text-slate-500 text-sm">No donation requests found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 font-sans relative">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Droplet className="text-red-600" size={20} />
                RaktSeva
                <span className="text-slate-400 text-sm font-normal ml-2">(Donation Requests)</span>
            </h3>

            {/* Verification Modal */}
            {verifyId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-96 animate-fade-in z-50 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">Verify Donor</h3>

                        {!isVerified ? (
                            <>
                                <p className="text-sm text-slate-500 mb-4">Enter DPN or scan QR code from ticket.</p>

                                {isScanning ? (
                                    <div className="mb-4 bg-black rounded-lg overflow-hidden relative">
                                        <QrReader
                                            delay={300}
                                            onError={(err: any) => console.error(err)}
                                            onScan={(data: any) => {
                                                if (data) {
                                                    const text = data.text || data;
                                                    setDpnInput(text.trim());
                                                    setIsScanning(false);
                                                }
                                            }}
                                            style={{ width: '100%' }}
                                        />
                                        <button
                                            onClick={() => setIsScanning(false)}
                                            className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white p-1 rounded-full backdrop-blur-sm"
                                        >
                                            <X size={16} />
                                        </button>
                                        <p className="text-white text-xs text-center p-2 absolute bottom-0 w-full bg-black/50 backdrop-blur-sm">Point camera at QR Code</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsScanning(true)}
                                        className="w-full py-3 mb-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Droplet size={20} />
                                        <span className="font-semibold">Scan QR Code</span>
                                    </button>
                                )}

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={dpnInput}
                                        onChange={(e) => setDpnInput(e.target.value)}
                                        placeholder="DPN-XXXXXX..."
                                        className="w-full border border-slate-300 rounded-lg p-3 mb-4 font-mono text-sm uppercase text-slate-900 bg-white"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setVerifyId(null); setDpnInput(''); setIsVerified(false); setIsScanning(false); }}
                                        className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        className="flex-1 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                                    >
                                        Verify Ticket
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center animate-fade-in">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">Verified Successfully!</h4>
                                <p className="text-slate-600 mt-2 mb-6">
                                    Donor: <span className="font-semibold">{requests.find((r: any) => r._id === verifyId)?.user?.fullName}</span>
                                    <br />
                                    <span className="text-sm text-slate-400">ID: {dpnInput}</span>
                                </p>
                                <button
                                    onClick={handleComplete}
                                    className="w-full py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200"
                                >
                                    Confirm & Mark Completed
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-semibold text-slate-500 border-b border-slate-100">
                            <th className="py-3 px-2">Donor</th>
                            <th className="py-3 px-2">Type & Time</th>
                            <th className="py-3 px-2">Contact</th>
                            <th className="py-3 px-2 text-center">Status</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {sortedRequests.map((request: any) => (
                            <tr key={request._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs">
                                            {request.user?.bloodGroup || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{request.user?.fullName || 'Unknown'}</p>
                                            <p className="text-xs text-slate-400">ID: {request._id.substring(request._id.length - 6)}</p>
                                            <p className="text-[10px] text-slate-300 font-mono mt-0.5">{request.qr_code}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-2">
                                    <p className="font-medium text-slate-800">{request.donation_type}</p>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <Clock size={12} />
                                        {new Date(request.scheduled_at).toLocaleDateString()} • {new Date(request.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="py-4 px-2 text-slate-600 text-xs">
                                    <p>{request.user?.mobile || 'N/A'}</p>
                                    <p className="truncate max-w-[120px]">{request.user?.email}</p>
                                </td>
                                <td className="py-4 px-2 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${request.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                        request.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            request.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </td>
                                <td className="py-4 px-2 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {request.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => setVerifyId(request._id)}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                                                    title="Verify & Complete"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                                    title="Reject"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        )}
                                        {request.status === 'confirmed' && (
                                            <button
                                                onClick={() => setVerifyId(request._id)}
                                                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm"
                                            >
                                                Verify & Complete
                                            </button>
                                        )}
                                        {(request.status === 'completed' || request.status === 'cancelled') && (
                                            <span className="text-xs text-slate-400 font-medium">No actions</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DonationRequestsTable;
