import dynamic from 'next/dynamic';
import dbConnect from '../../../../lib/dbConnect';
import Delivery from '../../../../models/Delivery';
import Driver from '../../../../models/Driver';

// Dynamically import the DeliveryTracking component with SSR disabled
// This is critical because Leaflet relies on the browser's `window` object
const DeliveryTracking = dynamic(
    () => import('../../../../components/delivery/DeliveryTracking'),
    { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading tracking map...</div> }
);

export default async function TrackDeliveryPage({ params }: { params: { deliveryId: string } }) {
    await dbConnect();

    // Fetch initial data server-side for SEO and hydration
    const delivery = await Delivery.findById(params.deliveryId)
        .populate({
            path: 'driverId',
            populate: { path: 'userId', model: 'User', select: 'fullName email' }
        })
        .lean();
    const deliveryParams = {
        deliveryId: params.deliveryId,
        initialData: delivery ? JSON.parse(JSON.stringify(delivery)) : null
    };

    return (
        <div className="h-screen w-full bg-gray-100 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto h-[80vh]">
                <DeliveryTracking {...deliveryParams} />
            </div>
        </div>
    );
}
