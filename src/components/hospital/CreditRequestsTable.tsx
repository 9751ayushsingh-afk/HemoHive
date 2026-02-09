import React from 'react';

const CreditRequestsTable = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Credit Requests</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Request ID</th>
            <th className="text-left">Donor</th>
            <th className="text-left">Blood Group</th>
            <th className="text-left">Qty</th>
            <th className="text-left">Credit</th>
            <th className="text-left">Amount</th>
            <th className="text-left">Status</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Add table rows here */}
        </tbody>
      </table>
    </div>
  );
};

export default CreditRequestsTable;
