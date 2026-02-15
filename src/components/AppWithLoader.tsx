'use client';

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import { Providers } from '../app/providers';
import CustomNavBar from './CustomNavBar';
import SessionGuard from './auth/SessionGuard';

const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/our-mission", label: "Our Mission" },
    { href: "/contact", label: "Contact" },
    { href: "/blood-literacy", label: "Blood Literacy" },
];


export default function AppWithLoader({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionStorage.getItem('splashScreenShown')) {
            setLoading(false);
        }
    }, []);

    const handleAnimationComplete = () => {
        setLoading(false);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('splashScreenShown', 'true');
        }
    };

    return (
        <>
            {loading ? (
                <SplashScreen onAnimationComplete={handleAnimationComplete} />
            ) : (
                <SessionGuard>
                    <CustomNavBar items={navItems} />
                    {children}
                </SessionGuard>
            )}
        </>
    );
}
