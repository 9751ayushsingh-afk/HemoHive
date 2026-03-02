
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import dbConnect from '../../../lib/dbConnect';
import Inventory from '../../../models/Inventory';
import HospitalHomeClient from './HospitalHomeClient';
import HemoFlux from '../../../lib/hemofluxEngine';

const HospitalHomePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const user = session.user;
  // @ts-ignore
  const hospitalId = user.id;

  let inventoryData: any[] = [];
  if (hospitalId) {
    try {
      await dbConnect();
      const dataFromDB = await Inventory.find({ hospital: hospitalId }).lean();
      inventoryData = dataFromDB.map((item: any) => ({
        // @ts-ignore
        ...item,
        // @ts-ignore
        _id: item._id.toString(),
        // @ts-ignore
        hospital: item.hospital.toString(),
      }));
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  }

  let metrics = null;
  if (hospitalId) {
    try {
      metrics = await HemoFlux.calculateMetrics(hospitalId);
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  }

  return <HospitalHomeClient user={user as any} inventory={inventoryData} metrics={metrics} />;
};

export default HospitalHomePage;