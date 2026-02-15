
import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import dbConnect from '../../../lib/dbConnect';
import Inventory from '../../../models/Inventory';
import OverviewCards from './components/OverviewCards';
import LiveBloodRequests from './components/LiveBloodRequests';
import PendingReturnsBoard from './components/PendingReturnsBoard';
import InventoryByGroup from './components/InventoryByGroup';
import FleetAndDeliveries from './components/FleetAndDeliveries';
import QuickActions from './components/QuickActions';
import HospitalAnalytics from './components/HospitalAnalytics';



const HospitalDashboardPage = async () => {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const hospitalId = session?.user?.id;

  let inventoryData: any[] = [];
  if (hospitalId) {
    try {
      await dbConnect();
      const dataFromDB = await Inventory.find({ hospital: hospitalId }).lean();
      // Ensure _id is converted to string for client component
      inventoryData = dataFromDB.map((item: any) => ({
        ...item,
        _id: item._id.toString(),
        hospital: item.hospital.toString(),
      }));
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      inventoryData = []; // Ensure it's an array on error
    }
  }

  console.log('FINAL INVENTORY DATA:', inventoryData);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-7">
        <OverviewCards />
        <div className="mt-6">
          <LiveBloodRequests inventory={inventoryData} hospitalId={hospitalId || ''} />
        </div>
        <div className="mt-6">
          <PendingReturnsBoard hospitalId={hospitalId || ''} />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-5">
        <InventoryByGroup />
        <div className="mt-6">
          <FleetAndDeliveries />
        </div>
        <div className="mt-6">
          <QuickActions />
        </div>
        <div className="mt-6">
          <HospitalAnalytics />
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboardPage;
