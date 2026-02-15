export interface UserProfile {
  name: string;
  bloodGroup: string;
  lastDonationDate: string;
  nextEligibleDate: string;
  totalDonations: number;
  amount?: number;
  credit?: number;
}

export interface DonationHistoryItem {
  id: string;
  type: string;
  center: string;
  date: string;
  amount: string;
  status?: 'pending' | 'confirmed' | 'scheduled' | 'rejected' | 'completed' | 'cancelled';
}

export interface Appointment {
  id: string;
  status: 'scheduled' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  donationType: string;
  centerId: string;
  centerName?: string;
  centerAddress?: string;
  date: string;
  timeSlot: string;
  pickupRequired?: boolean;
}
