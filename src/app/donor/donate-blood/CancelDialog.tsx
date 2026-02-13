import React from 'react';
import { X, Heart, AlertTriangle } from 'lucide-react';

interface CancelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    userStats?: {
        totalDonations: number;
        bloodGroup: string;
    };
}

const HINDI_QUOTES = [
    "“किसी की नसों में बहती ज़िंदगी बनो, रक्तदान कर के हीरो बनो।”",
    "“एक बूंद ख़ून की किसी की पूरी दुनिया बचा सकती है।”",
    "“रक्तदान जीवनदान है — क्योंकि हर सांस की अपनी एक कीमत होती है।”",
    "“आपका दिया खून किसी माँ की मुस्कान, किसी बच्चे की धड़कन बन जाता है।”",
    "“जहाँ इंसानियत जिंदा है, वहाँ रक्तदान कभी बंद नहीं होता।”",
    "“रंगों से नहीं, खून से जुड़ी है इंसानियत की पहचान।”",
    "“तुम्हारा थोड़ा-सा खून, किसी की पूरी ज़िन्दगी।”",
    "“वीर वही, जो रक्तदान करे सही।”",
    "“अपना खून दो, उम्मीद नहीं — ज़िंदगी दो।”",
    "“दिल बड़ा करो, रक्तदान करो — क्योंकि ज़िंदगी का कोई रिप्लेसमेंट नहीं।”"
];

const CancelDialog: React.FC<CancelDialogProps> = ({ isOpen, onClose, onConfirm, userStats }) => {
    const [reason, setReason] = React.useState('');

    // Select a random quote only once when the dialog opens
    const randomQuote = React.useMemo(() => {
        return HINDI_QUOTES[Math.floor(Math.random() * HINDI_QUOTES.length)];
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            {/* Depth Layer - Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-blue-500/10 pointer-events-none" />

            <div className="bg-white/90 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden relative animate-scale-in border border-white/50 ring-1 ring-white/60">
                {/* Inner Depth Highlight */}
                <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-full bg-slate-100/50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all backdrop-blur-sm z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pb-6 text-center relative z-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100/50 transform rotate-3">
                        <Heart className="text-red-500 fill-red-500 animate-pulse drop-shadow-lg" size={42} />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Wait! Lives depend on you.</h3>

                    <p className="text-slate-600 mb-6 leading-relaxed font-medium">
                        Your donation of <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">{userStats?.bloodGroup || 'Blood'}</span> is critically needed.
                        There are patients hoping for a match right now.
                    </p>

                    {/* Innovative Input Area with 'Niche' Depth Design */}
                    <div className="mb-6 relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-200 to-orange-200 rounded-2xl opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
                        <div className="relative bg-white rounded-xl p-1">
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please share why you need to cancel..."
                                className="w-full bg-slate-50 border-none rounded-lg p-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all resize-none font-medium"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-5 mb-6 text-left border border-amber-100/50 flex gap-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-bl-[3rem] -mr-4 -mt-4" />
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 relative z-10" size={22} />
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-amber-800 mb-1">Impact Fact:</p>
                            <p className="text-xs text-amber-700/80 font-medium leading-relaxed">
                                A single donation can save up to <span className="font-black text-amber-800">3 lives</span>.
                                Cancelling might delay life-saving treatment.
                            </p>
                        </div>
                    </div>

                    {/* Hindi Quote Section - Elegant Typography */}
                    <div className="mb-8 relative">
                        <span className="absolute -top-3 -left-2 text-4xl text-red-100 font-serif">“</span>
                        <p className="text-slate-800 font-medium italic text-lg font-serif px-6 relative z-10 tracking-wide">
                            {randomQuote}
                        </p>
                        <span className="absolute -bottom-6 -right-2 text-4xl text-red-100 font-serif transform rotate-180">“</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all transform hover:scale-[1.02] hover:shadow-xl active:scale-95"
                        >
                            Keep My Appointment
                        </button>
                        <button
                            onClick={() => onConfirm(reason)}
                            disabled={!reason.trim()}
                            className="w-full py-4 bg-white/50 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-red-500 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
                        >
                            Cancel Anyway
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelDialog;
