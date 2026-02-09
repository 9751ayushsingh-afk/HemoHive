
import DeliveryTracking from '../../../../components/delivery/DeliveryTracking';
import dbConnect from '../../../../lib/dbConnect';
import Delivery from '../../../../models/Delivery';
import Driver from '../../../../models/Driver';

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
