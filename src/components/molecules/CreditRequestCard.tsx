"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CreditRequestAction {
  label: string;
  [key: string]: any;
}

interface CreditRequest {
  status: string;
  hospital: string;
  dateIssued: string;
  deadline: string;
  amount: string;
  creditValue: string;
  penaltyStatus: string;
  actions: CreditRequestAction[];
}

interface CreditRequestCardProps {
  request: CreditRequest;
}

const CreditRequestCard: React.FC<CreditRequestCardProps> = ({ request }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    if (request.status === 'Penalty Warning') {
      gsap.from(cardRef.current, { x: -10, repeat: -1, yoyo: true, duration: 0.1, ease: 'power1.inOut' });
      gsap.to(cardRef.current, { background: 'rgba(255, 209, 102, 0.2)', repeat: -1, yoyo: true, duration: 1, ease: 'power1.inOut' });
    } else {
      gsap.from(cardRef.current, { rotationY: -90, duration: 1, ease: 'power3.out' });
    }
  }, [request.status]);

  return (
    <div ref={cardRef} className={`credit-request-card ${request.status === 'Penalty Warning' ? 'penalty-warning' : ''} hover-lift`}>
      <h4>{request.hospital}</h4>
      <p>Status: {request.status}</p>
      <p>Date Issued: {request.dateIssued}</p>
      <p>Deadline: {request.deadline}</p>
      <p>Amount: {request.amount}</p>
      <p>Credit Value: {request.creditValue}</p>
      <p>Penalty Status: {request.penaltyStatus}</p>
      <button className={`cta-button ${request.status === 'Penalty Warning' ? 'warning' : 'success'}`}>
        {request.actions[0]?.label || 'Action'}
      </button>
    </div>
  );
};

export default CreditRequestCard;
