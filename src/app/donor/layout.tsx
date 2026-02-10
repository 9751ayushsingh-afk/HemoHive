'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/donor/Sidebar';

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
