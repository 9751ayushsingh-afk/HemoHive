'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lottie from 'lottie-react';
import confettiAnimation from '../../../public/confetti.json';
import AIAssistant from './AIAssistant';
import CreditHealthMeter from '../molecules/CreditHealthMeter';
import CreditStatusCard from '../molecules/CreditStatusCard';
import { useQuery } from '@tanstack/react-query';
import { CreditObligation, CreditLifeCycleState, ITransaction } from '../../types/CreditTypes';
import './CreditWalletSystem.css';

gsap.registerPlugin(ScrollTrigger);

const fetchTransactions = async (): Promise<ITransaction[]> => {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const data = await res.json();
  return data.data;
};

// Helper to simulate backend logic for the frontend demo
const calculateObligation = (obligation: Partial<CreditObligation>): CreditObligation => {
  // For demo purposes, we trust the input date and force the status based on day logic if we want,
  // or we just trust the hardcoded status.
  // Let's dynamically calculate based on the issueDate provided to showcase the logic.

  const today = new Date();
  // IF we want to force specific states for the demo, we should set the issueDate appropriately.
  const issueDate = new Date(obligation.issueDate!);
  const diffTime = Math.abs(today.getTime() - issueDate.getTime());
  const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status: CreditLifeCycleState = 'GRACE';
  let multiplier = 1;
  let refund = 75;

  if (daysElapsed > 21) {
    status = 'BLOCKED';
    multiplier = 1.75;
    refund = 0;
  } else if (daysElapsed > 14) {
    status = 'PENALTY_L2';
    multiplier = 1.50;
    refund = 25;
  } else if (daysElapsed > 7) {
    status = 'PENALTY_L1';
    multiplier = 1.25;
    refund = 50;
  }

  return {
    id: obligation.id || '0',
    issueDate: obligation.issueDate!,
    hospitalName: obligation.hospitalName || 'Unknown Hospital',
    originalUnits: obligation.originalUnits || 1,
    currentObligationUnits: Number(((obligation.originalUnits || 1) * multiplier).toFixed(2)),
    depositAmount: obligation.depositAmount || 0,
    daysElapsed,
    refundEligiblePercentage: refund,
    status
  } as CreditObligation;
};

const CreditWalletSystem = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [creditHealthScore, setCreditHealthScore] = useState(88);

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['user-transactions'],
    queryFn: fetchTransactions
  });

  // Generate dates relative to today for accurate demo states
  const today = new Date();

  const dateGrace = new Date(today);
  dateGrace.setDate(today.getDate() - 3); // 3 days ago

  const datePenalty1 = new Date(today);
  datePenalty1.setDate(today.getDate() - 10); // 10 days ago

  const datePenalty2 = new Date(today);
  datePenalty2.setDate(today.getDate() - 18); // 18 days ago

  const dateBlocked = new Date(today);
  dateBlocked.setDate(today.getDate() - 25); // 25 days ago


  const rawObligations = [
    {
      id: 'obl-1',
      issueDate: dateGrace.toISOString(),
      hospitalName: 'Apollo Hospital',
      originalUnits: 1,
      depositAmount: 1500
    },
    {
      id: 'obl-2',
      issueDate: datePenalty1.toISOString(),
      hospitalName: 'City Blood Centre',
      originalUnits: 2,
      depositAmount: 3000
    },
    {
      id: 'obl-3',
      issueDate: datePenalty2.toISOString(),
      hospitalName: 'Red Cross Bank',
      originalUnits: 1,
      depositAmount: 1500
    },
    {
      id: 'obl-4',
      issueDate: dateBlocked.toISOString(),
      hospitalName: 'Central District Hospital',
      originalUnits: 1.5,
      depositAmount: 2250
    }
  ];

  const obligations: CreditObligation[] = rawObligations.map(calculateObligation);

  const creditWalletData = {
    profile: {
      userName: "Ayush",
      role: "Registered Blood Donor",
      credits: 2,
      status: "Good",
    },
    creditWallet: {
      totalCredits: 2,
      deadlineDays: 8,
    },
    transactionHistory: [
      {
        date: "2025-09-01",
        event: "Blood Request Approved (Apollo Hospital)",
        details: "Received 1 Credit - Grace Period Started",
      },
      {
        date: "2025-09-10",
        event: "Donation Completed",
        details: "Credit Released + ₹1500 Refunded",
      },
      {
        date: "2025-09-20",
        event: "Penalty Alert",
        details: "Level 1 Penalty Applied (Week 2)",
      },
    ],
    penaltyAlerts: {
      message: "You have obligations in Penalty State. Fulfill them to avoid account blocking.",
    },
    gamification: {
      badges: [
        {
          name: "HemoHero",
          criteria: "3 on-time donations",
        },
        {
          name: "Lifesaver",
          criteria: "10 successful donations",
        },
      ]
    }
  };

  const balanceCardRef = useRef<HTMLDivElement>(null);
  const responsibilityMeterRef = useRef<HTMLDivElement>(null);
  const alertSectionRef = useRef<HTMLDivElement>(null);
  const transactionHistoryRefs = useRef<(HTMLLIElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!balanceCardRef.current || !responsibilityMeterRef.current || !alertSectionRef.current) return;

    gsap.fromTo(balanceCardRef.current, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' });
    gsap.fromTo(responsibilityMeterRef.current, { rotation: -180, opacity: 0 }, { rotation: 0, opacity: 1, duration: 1.5, ease: 'elastic.out(1, 0.75)' });

    // Note: Request cards now animate themselves via Framer Motion, removed GSAP loop for them.

    const pulseGlow = gsap.to(responsibilityMeterRef.current, {
      boxShadow: '0 0 20px 5px rgba(255, 209, 102, 0.7)',
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: 'power1.inOut'
    });
    gsap.fromTo(alertSectionRef.current, { opacity: 0, y: 50 }, {
      opacity: 1, y: 0, duration: 1, scrollTrigger: {
        trigger: alertSectionRef.current,
        start: 'top 80%',
      }
    });
    const glowWarning = gsap.to(alertSectionRef.current, {
      boxShadow: '0 0 20px 10px rgba(239, 35, 60, 0.5)',
      repeat: -1,
      yoyo: true,
      duration: 1,
      ease: 'power1.inOut'
    });

    // Animate badges on scroll
    badgeRefs.current.forEach((badge, index) => {
      if (!badge) return;
      gsap.fromTo(badge, { scale: 0, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 1, delay: 0.2 * index, ease: 'elastic.out(1, 0.75)', scrollTrigger: {
          trigger: badge,
          start: 'top 90%',
        }
      });
    });

    return () => {
      pulseGlow.kill();
      glowWarning.kill();
    }

  }, []);

  const handleBalanceCardHover = () => {
    if (balanceCardRef.current) gsap.to(balanceCardRef.current, { scale: 1.05, boxShadow: '0 10px 30px rgba(230, 57, 70, 0.5)', duration: 0.3 });
  };

  const handleBalanceCardLeave = () => {
    if (balanceCardRef.current) gsap.to(balanceCardRef.current, { scale: 1, boxShadow: '0 8px 20px rgba(0,0,0,0.1)', duration: 0.3 });
  };

  const onCreditDischarge = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const onOverdueAlert = (index: number) => {
    if (transactionHistoryRefs.current[index]) {
      gsap.fromTo(transactionHistoryRefs.current[index], { x: -10 }, { x: 10, repeat: 5, yoyo: true, duration: 0.1, ease: 'power1.inOut' });
    }
  };

  const handleObligationAction = (id: string) => {
    console.log("Action on obligation:", id);
    // Logic to open fulfillment modal would go here
  };

  return (
    <div className="credit-wallet-system-theme">
      {showConfetti && <Lottie animationData={confettiAnimation} loop={false} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999 }} />}
      <div className="donor-dashboard-container">
        <h1 className="dashboard-title">HemoHive Donor Dashboard</h1>

        {/* Profile & Overview Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Profile & Overview</h2>
            </div>
            <div className="profile-overview">
              <div className="profile-card">
                <p><strong>User:</strong> {creditWalletData.profile.userName}</p>
                <p><strong>Role:</strong> {creditWalletData.profile.role}</p>
                <p><strong>Credits:</strong> {creditWalletData.profile.credits}</p>
                <p><strong>Credit Health:</strong> {creditHealthScore}</p>
                <p><strong>Status:</strong> {creditWalletData.profile.status}</p>
                <input type="range" min="0" max="100" value={creditHealthScore} onChange={(e) => setCreditHealthScore(parseInt(e.target.value))} />
              </div>
              <CreditHealthMeter value={creditHealthScore} />
            </div>
          </div>
        </motion.div>

        {/* Credit Wallet Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Credit Wallet</h2>
            </div>
            <div className="credit-wallet-overview">
              <div
                className="balance-card"
                ref={balanceCardRef}
                onMouseEnter={handleBalanceCardHover}
                onMouseLeave={handleBalanceCardLeave}
              >
                <h3>Total Credits</h3>
                <p className="balance">{creditWalletData.creditWallet.totalCredits}</p>
              </div>
              <div className="responsibility-meter" ref={responsibilityMeterRef}>
                <h3>Return Deadline</h3>
                <p className="deadline">{creditWalletData.creditWallet.deadlineDays} Days Left</p>
              </div>
            </div>
            <button className="cta-button" onClick={onCreditDischarge}>Discharge Credit</button>
          </div>
        </motion.div>

        {/* Active Credit Requests Section - UPDATED */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Active Obligations</h2>
            </div>
            <div className="flex flex-col gap-4">
              {obligations.map((obligation) => (
                <CreditStatusCard
                  key={obligation.id}
                  obligation={obligation}
                  onAction={handleObligationAction}
                />
              ))}
            </div>
          </div>
        </motion.div>





        {/* Gamification Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Gamification Badges</h2>
            </div>
            <div className="badge-grid">
              {creditWalletData.gamification.badges.map((badge, index) => (
                <div key={index} className="badge" ref={el => { badgeRefs.current[index] = el }}>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-criteria">{badge.criteria}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Penalty & Alerts Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
          <div className="card alert-section" ref={alertSectionRef}>
            <div className="card-header">
              <h2 className="card-title">Penalty & Alerts</h2>
            </div>
            <p>{creditWalletData.penaltyAlerts.message}</p>
            <button className="cta-button">Resolve Now</button>
          </div>
        </motion.div>

        <AIAssistant />
      </div>
    </div>
  );
};

export default CreditWalletSystem;