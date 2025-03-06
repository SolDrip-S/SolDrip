import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data for the MVP
const tokenStats = {
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

type TokenStatsResponse = {
  success: boolean;
  data: typeof tokenStats;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenStatsResponse>
) {
  // In a real implementation, we would fetch this data from the blockchain
  try {
    res.status(200).json({
      success: true,
      data: tokenStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: tokenStats,
      error: 'Failed to fetch token statistics',
    });
  }
} 