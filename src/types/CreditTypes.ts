export type CreditLifeCycleState = 'GRACE' | 'PENALTY_L1' | 'PENALTY_L2' | 'FINAL' | 'BLOCKED';

export interface CreditObligation {
  id: string;
  issueDate: string; // ISO Date String
  hospitalName: string; // Issuing Bank
  originalUnits: number; // Initial units assigned upon successful delivery
  currentObligationUnits: number; // Calculated based on elapsed time (e.g. +25%, +50%)
  depositAmount: number; // PRD (Platform Responsibility Deposit)
  status: CreditLifeCycleState;
  deadline?: string;
  refundEligiblePercentage?: number;
}
