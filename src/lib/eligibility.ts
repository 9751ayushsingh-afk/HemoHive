
import { IUser } from '../models/User'; // Assuming IUser is exported from your User model

export function checkEligibility(user: IUser): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const today = new Date();

  // Age and weight checks removed/updated based on schema changes

  // 1. Weight check
  if (user.weight && user.weight <= 50) {
    reasons.push('Weight must be above 50 kg.');
  } else if (!user.weight) {
    reasons.push('User weight is not provided.');
  }


  // 3. Hemoglobin check
  if (user.hemoglobin && user.hemoglobin < 12.5) {
    reasons.push('Hemoglobin must be at least 12.5 g/dL.');
  } else if (!user.hemoglobin) {
    reasons.push('User hemoglobin is not provided.');
  }

  // 4. Last donation date check
  if (user.lastDonationDate) {
    const lastDonation = new Date(user.lastDonationDate);
    const diffTime = Math.abs(today.getTime() - lastDonation.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      reasons.push(`Minimum 90 days gap required. Last donation was ${diffDays} days ago.`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}
