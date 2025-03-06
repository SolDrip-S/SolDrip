import React from 'react';

interface TokenStatsProps {
  price: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  totalDistributed: number;
}

const TokenStats: React.FC<TokenStatsProps> = ({
  price,
  marketCap,
  totalSupply,
  circulatingSupply,
  holders,
  totalDistributed,
}) => {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">Token Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400">Price</p>
          <p className="text-xl font-bold">${price.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-gray-400">Market Cap</p>
          <p className="text-xl font-bold">${marketCap.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Total Supply</p>
          <p className="text-xl font-bold">{totalSupply.toLocaleString()} DRIP</p>
        </div>
        <div>
          <p className="text-gray-400">Circulating Supply</p>
          <p className="text-xl font-bold">{circulatingSupply.toLocaleString()} DRIP</p>
        </div>
        <div>
          <p className="text-gray-400">Holders</p>
          <p className="text-xl font-bold">{holders.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Total Distributed</p>
          <p className="text-xl font-bold">{totalDistributed.toFixed(2)} SOL</p>
        </div>
      </div>
    </div>
  );
};

export default TokenStats; 