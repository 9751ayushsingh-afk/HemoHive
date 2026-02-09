import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Inventory from '@/models/Inventory';
import HospitalHomeClient from './HospitalHomeClient';

const HospitalHomePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const user = session.user;
  // @ts-ignore
  const hospitalId = user.id;

  let inventoryData = [];
  if (hospitalId) {
    try {
      await dbConnect();
      const dataFromDB = await Inventory.find({ hospital: hospitalId }).lean();
      inventoryData = dataFromDB.map(item => ({
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

  return <HospitalHomeClient user={user} inventory={inventoryData} />;
};

export default HospitalHomePage;