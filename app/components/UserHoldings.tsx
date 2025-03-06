import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface UserHoldingsProps {
  balance: number | null;
  value: number | null;
  nextDividend: number | null;
  holdingTime: number | null; // in days
}

const UserHoldings: React.FC<UserHoldingsProps> = ({
  balance,
  value,
  nextDividend,
  holdingTime,
}) => {
  const { publicKey } = useWallet();
  
  // Format wallet address for display
  const formattedAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';
  
  // Calculate holding time bonus
  const hasBonus = holdingTime !== null && holdingTime >= 7;
  
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Your Holdings</h2>
      
      {publicKey ? (
        <>
          <div className="mb-4 p-2 bg-gray-700 rounded text-sm text-center">
            {formattedAddress}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Balance</span>
              <span className="text-xl font-bold">
                {balance?.toLocaleString() || '0'} DRIP
              </span>
            </div>
            
            {value !== null && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Value</span>
                <span className="text-xl font-bold">${value.toFixed(2)}</span>
              </div>
            )}
            
            {nextDividend !== null && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Dividend</span>
                <span className="text-xl font-bold text-soldrip-secondary">
                  {nextDividend.toFixed(4)} SOL
                </span>
              </div>
            )}
            
            {holdingTime !== null && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Holding Time</span>
                <span className={`font-bold ${hasBonus ? 'text-soldrip-accent' : ''}`}>
                  {holdingTime} days {hasBonus && '(+10% bonus)'}
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="btn-primary">Buy</button>
            <button className="btn-secondary">Sell</button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-400">
          Connect your wallet to view your holdings
        </p>
      )}
    </div>
  );
};

export default UserHoldings; 