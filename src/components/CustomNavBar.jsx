'use client';
import React, { useState, useEffect } from 'react';
import './CustomNavBar.css';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { useMobile } from '@/hooks/use-mobile';
import { AnimatedLogo } from '@/components/atoms/AnimatedLogo';

const MobileMenu = ({ items, isOpen, onClose, session, status }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
          />

          {/* Menu Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 w-full h-full bg-black/95 backdrop-blur-xl z-[2000] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <AnimatedLogo className="h-10" />
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                <X size={32} />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-3xl font-bold text-white/80 hover:text-white transition-colors block"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="h-px bg-white/10 my-4" />

              {status === 'authenticated' ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: items.length * 0.1 }}
                  >
                    <Link href={`/${session.user.role}`} onClick={onClose} className="text-2xl font-bold text-accent block">
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (items.length + 1) * 0.1 }}
                  >
                    <button onClick={() => { signOut(); onClose(); }} className="text-xl text-white/60 hover:text-white text-left">
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link href="/login" onClick={onClose} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-center text-white font-bold text-xl hover:bg-white/10 transition-colors">
                    Login
                  </Link>
                  <Link href="/register" onClick={onClose} className="w-full py-4 rounded-xl bg-accent text-center text-white font-bold text-xl hover:bg-red-700 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CustomNavBar = ({ items, theme = 'light' }) => {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const pathname = usePathname();

  // Force light theme (dark text) on specific pages like /our-mission
  const isLightPage = pathname === '/our-mission';
  const themeClass = isLightPage ? 'light-theme' : (theme === 'dark' ? 'dark-theme' : '');

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <>
      <header className={`custom-nav-header ${scrolled ? 'scrolled' : ''} ${themeClass}`}>
        <div className="custom-nav-logo">
          <Link href="/">
            <AnimatedLogo className="h-10" />
          </Link>
        </div>

        {isMobile ? (
          <button onClick={() => setIsMenuOpen(true)} className={`${isLightPage ? 'text-black' : 'text-white'} p-2`}>
            <Menu size={32} />
          </button>
        ) : (
          <nav className="custom-nav">
            {items.map((item, index) => (
              <Link key={index} href={item.href} className="custom-nav-item">
                {item.label}
              </Link>
            ))}
            {status === 'authenticated' ? (
              <>
                <Link href={`/${session.user.role}`} className="custom-nav-item">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="custom-nav-item">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="custom-nav-item">
                  Login
                </Link>
                <Link href="/register" className="custom-nav-item">
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <MobileMenu
        items={items}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        session={session}
        status={status}
      />
    </>
  );
};

export default CustomNavBar;
