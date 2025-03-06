import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Program ID for the SolDrip token (placeholder)
export const SOLDRIP_PROGRAM_ID = new PublicKey('SoLDripTokenProgramID111111111111111111111111');

// Get Solana connection based on network
export const getConnection = (network: WalletAdapterNetwork = WalletAdapterNetwork.Devnet) => {
  return new Connection(clusterApiUrl(network), 'confirmed');
};

// Format SOL amount with proper decimals
export const formatSol = (lamports: number): string => {
  return (lamports / 1000000000).toFixed(4);
};

// Format wallet address for display
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Calculate user's dividend share based on holdings
export const calculateDividendShare = (
  userBalance: number,
  totalSupply: number,
  poolBalance: number,
  holdingDays: number | null
): number => {
  if (!userBalance || !totalSupply || !poolBalance) return 0;
  
  // Apply holding time bonus if applicable (1.1x for 7+ days)
  const holdingBonus = holdingDays && holdingDays >= 7 ? 1.1 : 1;
  
  // Calculate share: (userBalance / totalSupply) * poolBalance * 0.98 * holdingBonus
  // 2% is reserved for gas costs
  return (userBalance / totalSupply) * poolBalance * 0.98 * holdingBonus;
};

// Mock function to simulate fetching token data from the blockchain
export const fetchTokenData = async (): Promise<any> => {
  // In a real implementation, we would fetch this data from the blockchain
  // using the Solana connection and program ID
  
  // For MVP, we'll return mock data
  return {
    price: 0.000123,
    marketCap: 123000,
    totalSupply: 1000000000,
    circulatingSupply: 750000000,
    holders: 523,
    totalDistributed: 125.75,
    poolBalance: 0.08,
    nextDistribution: 0.1,
    lastDistribution: '10 minutes ago',
  };
};

// Mock function to simulate fetching user holdings from the blockchain
export const fetchUserHoldings = async (walletAddress: string): Promise<any> => {
  // In a real implementation, we would fetch this data from the blockchain
  // using the Solana connection, program ID, and wallet address
  
  // For MVP, we'll return mock data
  return {
    balance: 1000000,
    value: 123,
    nextDividend: 0.05,
    holdingTime: 12,
  };
}; 