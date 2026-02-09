import React from 'react';

const OverviewCards = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Available Units (by Group)</h3>
        <p className="text-2xl font-bold">See Inventory</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Pending Requests</h3>
        <p className="text-2xl font-bold">7</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Pending Returns</h3>
        <p className="text-2xl font-bold">3</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Blocked Donors</h3>
        <p className="text-2xl font-bold">1</p>
      </div>
    </div>
  );
};

export default OverviewCards;
