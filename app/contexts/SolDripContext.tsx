import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchTokenData, fetchUserHoldings, calculateDividendShare } from '@/utils/solana';

// Define types for our context data
interface TokenStats {
  price: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  holders: number;
  totalDistributed: number;
  poolBalance: number;
  nextDistribution: number;
  lastDistribution: string;
}

interface UserHoldings {
  balance: number | null;
  value: number | null;
  nextDividend: number | null;
  holdingTime: number | null;
}

interface SolDripContextType {
  tokenStats: TokenStats | null;
  userHoldings: UserHoldings;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

// Create the context
const SolDripContext = createContext<SolDripContextType | undefined>(undefined);

// Context provider component
export const SolDripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [userHoldings, setUserHoldings] = useState<UserHoldings>({
    balance: null,
    value: null,
    nextDividend: null,
    holdingTime: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch token stats
      const tokenData = await fetchTokenData();
      setTokenStats(tokenData);
      
      // Fetch user holdings if wallet is connected
      if (connected && publicKey) {
        const holdingsData = await fetchUserHoldings(publicKey.toString());
        
        // Calculate next dividend based on holdings and pool balance
        const nextDividend = calculateDividendShare(
          holdingsData.balance,
          tokenData.totalSupply,
          tokenData.poolBalance,
          holdingsData.holdingTime
        );
        
        setUserHoldings({
          ...holdingsData,
          nextDividend,
        });
      } else {
        // Reset user holdings if wallet is disconnected
        setUserHoldings({
          balance: null,
          value: null,
          nextDividend: null,
          holdingTime: null,
        });
      }
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial load and when wallet connection changes
  useEffect(() => {
    refreshData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(refreshData, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [connected, publicKey]);

  // Context value
  const value = {
    tokenStats,
    userHoldings,
    isLoading,
    error,
    refreshData,
  };

  return <SolDripContext.Provider value={value}>{children}</SolDripContext.Provider>;
};

// Custom hook to use the SolDrip context
export const useSolDrip = () => {
  const context = useContext(SolDripContext);
  if (context === undefined) {
    throw new Error('useSolDrip must be used within a SolDripProvider');
  }
  return context;
}; 