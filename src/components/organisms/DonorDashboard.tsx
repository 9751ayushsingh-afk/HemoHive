import React from 'react';
import CustomNavBar from '../CustomNavBar';
import DonorSidebar from './DonorSidebar';
import ProfileSection from '../molecules/ProfileSection';
import CreditWalletSystem from './CreditWalletSystem';
import MyDonations from '../molecules/MyDonations';
import BloodDetails from '../molecules/BloodDetails';
import HealthInsights from '../molecules/HealthInsights';
import AwarenessRewards from '../molecules/AwarenessRewards';
import BloodRequestModule from '../donor/BloodRequestModule'; // Import the new module
import './CreditWalletSystem.css';

const DonorDashboard = () => {
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="donor-dashboard-theme">
      <CustomNavBar items={navItems} theme="dark" />
      <div className="donor-dashboard-layout">
        <DonorSidebar />
        <main className="donor-dashboard-main">
          <ProfileSection />
          <div className="donor-dashboard-content">
            <CreditWalletSystem />
            <BloodRequestModule />
            <MyDonations />
            <BloodDetails />
            <HealthInsights />
            <AwarenessRewards />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
