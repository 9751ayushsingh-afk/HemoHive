
import React from 'react';
import Link from 'next/link';

// Placeholder for a profile photo
const ProfilePhoto = () => (
  <div className="w-10 h-10 bg-gray-700 rounded-full border-2 border-blue-400 hover:animate-pulse"></div>
);

const HospitalLayout = ({ children }: { children: React.ReactNode }) => {
  const sidebarItems = [
    { name: '🏠', label: 'Home', route: '/hospital/home' },
    { name: '🩸', label: 'Inventory', route: '/hospital/inventory' },
    { name: '📊', label: 'Analytics', route: '/hospital/analytics' },
    { name: '💳', label: 'Credit', route: '/hospital/credit' },
    { name: '🧾', label: 'Logs', route: '/hospital/logs' },
    { name: '⚙️', label: 'Settings', route: '/hospital/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-20 flex flex-col items-center py-4 bg-black bg-opacity-20 backdrop-blur-lg border-r border-gray-700/50">
        <div className="my-4">
          <ProfilePhoto />
        </div>
        <nav className="flex flex-col items-center gap-6 mt-8">
          {sidebarItems.map((item) => (
            <Link href={item.route} key={item.label} className="group relative">
              <span className="text-2xl transition-transform duration-300 group-hover:scale-125 group-hover:text-blue-400">{item.name}</span>
              <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default HospitalLayout;
