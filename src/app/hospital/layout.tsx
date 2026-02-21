import React from 'react';
import Sidebar from '@/components/hospital/Sidebar';
import HospitalNavbar from '@/components/hospital/HospitalNavbar';

const HospitalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
      {/* Noise Texture Overlay */}
      <div className="noise-bg"></div>

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Sidebar />

      <main className="relative z-10 flex-1 ml-80 p-8 pt-32 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          {/* Custom Navbar with spacing from Sidebar */}
          <HospitalNavbar />

          {/* Page content with spacing from Navbar */}
          <div className="text-white">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalLayout;
