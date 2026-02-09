"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const MyDonations = () => {
  const donations = [
    { date: '2024-10-15', hospital: 'City Hospital', bloodGroup: 'A+', status: 'Completed', certificate: 'View' },
    { date: '2024-07-10', hospital: 'General Hospital', bloodGroup: 'A+', status: 'Completed', certificate: 'View' },
    { date: '2024-04-05', hospital: 'Red Cross Center', bloodGroup: 'A+', status: 'Completed', certificate: 'View' },
  ];

  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!tbodyRef.current) return;

    gsap.from(tbodyRef.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div className="my-donations card">
      <div className="card-header">
        <h2 className="card-title">My Donations</h2>
      </div>
      <div className="card-content">
        <table className="donations-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Hospital</th>
              <th>Blood Group</th>
              <th>Status</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {donations.map((donation, index) => (
              <tr key={index}>
                <td>{donation.date}</td>
                <td>{donation.hospital}</td>
                <td>{donation.bloodGroup}</td>
                <td>{donation.status}</td>
                <td><a href="#" className="certificate-link">{donation.certificate}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="cta-button">Schedule Next Donation</button>
      </div>
    </div>
  );
};

export default MyDonations;
