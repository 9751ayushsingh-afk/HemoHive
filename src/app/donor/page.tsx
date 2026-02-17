'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import UserProfileCard from '../../components/donor/UserProfileCard';
import DonateBloodCard from '../../components/donor/DonateBloodCard';
import BloodRequestModule from '../../components/donor/BloodRequestModule';
import CreditWallet from '../../components/donor/CreditWallet';
import BloodRequestHistory from '../../components/donor/BloodRequestHistory';
import LockedFeature from '../../components/donor/LockedFeature';
import PosterKiosk from '../../components/donor/PosterKiosk';

const DonorDashboardPage = () => {
  const { data: session } = useSession();
  const [donorData, setDonorData] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/donors/me')
        .then((res) => res.json())
        .then((data) => {
          setDonorData({ ...session.user, ...data });
        })
        .catch(() => {
          setDonorData(session.user);
        });
    }
  }, [session]);

  const isLocked = !donorData?.total_donations || donorData.total_donations === 0;

  return (
    <div className="p-8 scroll-smooth">
      <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="profile" className="lg:col-span-1">
          <UserProfileCard
            fullName={donorData?.fullName || donorData?.name}
            profilePicture={donorData?.profilePicture || donorData?.image}
            email={donorData?.email}
            mobile={donorData?.mobile}
            address={donorData?.address}
            joinedAt={donorData?.joinedAt}
            bloodGroup={donorData?.blood_group}
            totalDonations={donorData?.total_donations}
            credits={donorData?.credit}
            status={donorData?.status}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
          <DonateBloodCard
            bloodGroup={donorData?.blood_group}
            lastDonationDate={donorData?.last_donation_date}
            eligibilityStatus={donorData?.eligibility}
            nextEligibleDate={donorData?.next_eligible_date}
            totalDonationsDone={donorData?.total_donations}
          />

          <PosterKiosk />
        </div>

        {/* Locked Features for New Donors */}
        <div id="wallet" className="lg:col-span-3">
          {isLocked ? <LockedFeature title="Credit Wallet" /> : <CreditWallet />}
        </div>
        <div id="request" className="lg:col-span-3">
          {isLocked ? <LockedFeature title="Blood Requests" /> : <BloodRequestModule />}
        </div>
        <div id="history" className="lg:col-span-3">
          {isLocked ? <LockedFeature title="Request History" /> : <BloodRequestHistory />}
        </div>
      </div>
    </div>
  );
};


export default DonorDashboardPage;
