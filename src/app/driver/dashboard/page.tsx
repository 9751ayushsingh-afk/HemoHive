import type { Viewport } from 'next';
import DriverDashboard from '../../../components/delivery/DriverDashboard';

export const viewport: Viewport = {
    width: 1280,
    initialScale: 0.3,
    // maximumScale removed to allow zooming
    // userScalable removed to allow zooming
};

export default function DriverPage() {
    return (
        <div className="min-h-screen bg-gray-900">
            <DriverDashboard />
        </div>
    );
}
