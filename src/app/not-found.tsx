'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import './not-found.css';

export default function NotFound() {
    useEffect(() => {
        // Add class to body to signal 404 state for global elements like Navbar
        document.body.classList.add('is-404-page');
        return () => {
            document.body.classList.remove('is-404-page');
        };
    }, []);

    return (
        <div className="not-found-wrapper">
            <div className="nf-card">
                <div className="nf-orb nf-orb--1" />
                <div className="nf-orb nf-orb--2" />
                <div className="nf-orb nf-orb--3" />
                <div className="nf-orb nf-orb--4" />
                <div className="nf-orb nf-orb--5" />
                <div className="nf-orb nf-orb--6" />
                <div className="nf-orb nf-orb--7" />
                <div className="nf-orb nf-orb--8" />

                <div className="nf-error-container">
                    <div className="nf-error-code">404</div>
                    <div className="nf-error-msg">Nothing to see here.</div>
                    <Link href="/" className="nf-home-btn">Go Home</Link>
                </div>

                <div className="nf-duck__wrapper">
                    <div className="nf-duck">
                        <div className="nf-duck__inner">
                            <div className="nf-duck__mouth" />
                            <div className="nf-duck__head">
                                <div className="nf-duck__eye" />
                                <div className="nf-duck__white" />
                            </div>
                            <div className="nf-duck__body" />
                            <div className="nf-duck__wing" />
                        </div>
                        <div className="nf-duck__foot nf-duck__foot--1" />
                        <div className="nf-duck__foot nf-duck__foot--2" />
                        <div className="nf-surface" />
                    </div>
                </div>
            </div>
        </div>
    );
}
