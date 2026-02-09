export interface UserProfile {
  name: string;
  bloodGroup: string;
  lastDonationDate: string;
  nextEligibleDate: string;
  totalDonations: number;
}

export interface DonationHistoryItem {
  id: string;
  type: string;
  center: string;
  date: string;
  amount: string;
}

export interface Appointment {
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  donationType: string;
  centerId: string;
  centerName?: string;
  centerAddress?: string;
  date: string;
  timeSlot: string;
  pickupRequired?: boolean;
}
