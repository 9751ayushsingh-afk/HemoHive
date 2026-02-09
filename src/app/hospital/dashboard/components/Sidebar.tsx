import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <ul>
        <li>Overview</li>
        <li>Inventory</li>
        <li>Credit Requests</li>
        <li>Pending Returns</li>
        <li>Fleet & Deliveries</li>
        <li>Analytics</li>
        <li>Staff & Access</li>
        <li>Audit Logs</li>
        <li>Settings</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
