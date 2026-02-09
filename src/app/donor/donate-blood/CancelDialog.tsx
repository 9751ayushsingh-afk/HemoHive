import React from 'react';
import { X, Heart, AlertTriangle } from 'lucide-react';

interface CancelDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
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

    // Select a random quote only once when the dialog opens
    const randomQuote = React.useMemo(() => {
        return HINDI_QUOTES[Math.floor(Math.random() * HINDI_QUOTES.length)];
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="text-red-500 fill-red-500 animate-pulse" size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Wait! Lives depend on you.</h3>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Your donation of <span className="font-bold text-red-600">{userStats?.bloodGroup || 'Blood'}</span> is critically needed.
                        There are patients hoping for a match right now.
                    </p>

                    <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-100 flex gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">Impact Fact:</p>
                            <p className="text-sm text-amber-700">
                                Did you know? A single donation can save up to <span className="font-bold">3 lives</span>.
                                Cancelling might delay life-saving treatment for someone in need.
                            </p>
                        </div>
                    </div>

                    {/* Hindi Quote Section */}
                    <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-800 font-medium italic text-lg font-serif">
                            {randomQuote}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all transform hover:scale-[1.02]"
                        >
                            Keep My Appointment
                        </button>
                        <button
                            onClick={onConfirm}
                            className="w-full py-3.5 bg-white border-2 border-slate-100 text-slate-400 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-colors"
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
