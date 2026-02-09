import React from 'react';

const DonorSidebar = () => {
  const menuItems = [
    'Dashboard',
    'My Donations',
    'Blood Requests',
    'Health Insights',
    'Rewards',
    'Profile'
  ];

  return (
    <aside className="donor-sidebar">
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}><a href="#">{item}</a></li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DonorSidebar;
