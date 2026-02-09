
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../lib/auth';

const RedirectPage = async () => {
  const session = await getServerSession(authOptions);

  const role = session?.user?.role;

  if (role === 'hospital') {
    redirect('/hospital/home');
  } else if (role === 'donor') {
    // Assuming a donor dashboard exists or will exist
    redirect('/donor');
  } else if (role === 'admin') {
    redirect('/admin'); // Updated to point to main admin page
  } else if (role === 'driver') {
    redirect('/driver/dashboard');
  } else {
    // Default redirect if role is not found or other
    redirect('/');
  }

  // This component will not render anything as it always redirects.
  return null;
};

export default RedirectPage;
