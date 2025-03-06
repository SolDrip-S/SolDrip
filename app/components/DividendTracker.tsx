import React from 'react';

interface DividendTrackerProps {
  poolBalance: number;
  nextDistribution: number;
  lastDistribution: string;
  totalDistributed: number;
  userNextDividend: number | null;
}

const DividendTracker: React.FC<DividendTrackerProps> = ({
  poolBalance,
  nextDistribution,
  lastDistribution,
  totalDistributed,
  userNextDividend,
}) => {
  // Calculate progress percentage
  const progressPercentage = (poolBalance / nextDistribution) * 100;
  
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Dividend Tracker</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Current Pool</span>
          <span className="text-xl font-bold">{poolBalance.toFixed(4)} SOL</span>
        </div>
        <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-soldrip-primary h-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Next distribution at {nextDistribution} SOL ({progressPercentage.toFixed(0)}% complete)
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Last Distribution</span>
          <span>{lastDistribution}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Distributed</span>
          <span className="text-xl font-bold">{totalDistributed.toFixed(2)} SOL</span>
        </div>
        {userNextDividend !== null && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Your Next Dividend</span>
            <span className="text-xl font-bold text-soldrip-secondary">
              {userNextDividend.toFixed(4)} SOL
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="font-bold mb-2">How Dividends Work</h3>
        <p className="text-sm text-gray-300">
          5% of each transaction is converted to SOL and distributed to all holders.
          Distributions occur every time the pool reaches {nextDistribution} SOL (approximately every 5 minutes).
        </p>
      </div>
    </div>
  );
};

export default DividendTracker; 