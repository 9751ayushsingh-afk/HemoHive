'use client';

import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { User as UserIcon } from 'lucide-react';
import { type DefaultSession } from 'next-auth';

interface UserProfileCardProps {
    fullName?: string;
    profilePicture?: string;
    createdAt?: string;
    bloodGroup?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
    fullName,
    profilePicture,
    createdAt,
    bloodGroup
}) => {
    const { data: session } = useSession();
    // Use props if available, otherwise fallback to session
    // But page.tsx is passing merged data, so props are preferred.

    // Construct a user object merging props and session defaults
    const user = {
        fullName: fullName || session?.user?.name,
        profilePicture: profilePicture || session?.user?.image,
        createdAt: createdAt, // Session usually doesn't have this unless customized
        bloodGroup: bloodGroup // Session doesn't have this by default
    };

    const cardRef = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLHeadingElement>(null);
    const badgeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card || !user) return;

        // GSAP Animations
        const tl = gsap.timeline({ delay: 0.5 });
        if (nameRef.current) {
            const chars = Array.from(nameRef.current.children);
            tl.from(chars, { y: 20, opacity: 0, stagger: 0.05, ease: 'power3.out', duration: 0.5 });
        }
        if (badgeRef.current) {
            gsap.to(badgeRef.current, { y: -5, repeat: -1, yoyo: true, duration: 1.5, ease: 'sine.inOut' });
            gsap.to(badgeRef.current, { boxShadow: '0 0 20px 5px rgba(255, 215, 0, 0.7)', repeat: -1, yoyo: true, duration: 1.5, ease: 'sine.inOut' });
        }

        // 3D Tilt Effect
        const handleMouseMove = (e: MouseEvent) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            const rotateX = gsap.utils.mapRange(0, height, -10, 10)(y);
            const rotateY = gsap.utils.mapRange(0, width, 10, -10)(x);

            gsap.to(card, {
                duration: 0.7,
                rotationX: rotateX,
                rotationY: rotateY,
                ease: 'power3.out',
                transformPerspective: 900,
            });

            // Glow Effect
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                duration: 1,
                rotationX: 0,
                rotationY: 0,
                ease: 'elastic.out(1, 0.3)',
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };

    }, [user.fullName, user.bloodGroup, user.profilePicture, user.createdAt]);

    if (!user) {
        return (
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center h-full min-h-[350px]">
                <p className="text-white/70">Loading Profile...</p>
            </div>
        );
    }

    return (
        <motion.div
            ref={cardRef}
            className="profile-card bg-white/5 p-6 rounded-2xl backdrop-blur-lg border border-white/10 text-center flex flex-col items-center h-full cursor-pointer min-h-[350px] relative overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute top-0 left-0 w-full h-full card-glow" />
            <motion.div
                className="relative w-32 h-32 rounded-full mb-4 border-4 border-white/20"
                style={{ transform: 'translateZ(50px)' }}
                whileHover={{ scale: 1.1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'backOut' }}
            >
                {user.profilePicture ? (
                    <Image
                        src={user.profilePicture}
                        alt={user.fullName || 'User'}
                        layout="fill"
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="rounded-full bg-gray-700 flex items-center justify-center w-full h-full">
                        <UserIcon className="w-16 h-16 text-gray-400" />
                    </div>
                )}
            </motion.div>

            <h2 ref={nameRef} className="text-3xl font-bold text-white mb-1" style={{ transform: 'translateZ(40px)' }}>
                {(user.fullName || 'Hemo User').split('').map((char, index) => (
                    <span key={index} style={{ display: 'inline-block' }}>{char === ' ' ? '\u00A0' : char}</span>
                ))}
            </h2>

            <motion.p
                className="text-sm text-white/60 mb-4"
                style={{ transform: 'translateZ(30px)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                {user.createdAt ? `Joined ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : ''}
            </motion.p>

            <div ref={badgeRef} className="mt-auto bg-accent/20 border font-bold py-2 px-4 rounded-full text-lg"
                style={{ color: '#FFD700', borderColor: '#FFD700', background: 'rgba(255, 215, 0, 0.1)', transform: 'translateZ(60px)' }}>
                {user.bloodGroup || 'A+'}
            </div>
        </motion.div>
    );
};

export default UserProfileCard;
