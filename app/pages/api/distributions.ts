import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data for the MVP
const mockDistributions = [
  {
    id: '1',
    time: '10 minutes ago',
    timestamp: Date.now() - 10 * 60 * 1000,
    amount: 0.1,
    recipients: 523,
    userShare: 0.005,
    txHash: '5xGT...7Uyk',
  },
  {
    id: '2',
    time: '15 minutes ago',
    timestamp: Date.now() - 15 * 60 * 1000,
    amount: 0.1,
    recipients: 520,
    userShare: 0.005,
    txHash: '3rFD...9Pqw',
  },
  {
    id: '3',
    time: '20 minutes ago',
    timestamp: Date.now() - 20 * 60 * 1000,
    amount: 0.1,
    recipients: 518,
    userShare: 0.005,
    txHash: '7jKL...2Mxz',
  },
  {
    id: '4',
    time: '25 minutes ago',
    timestamp: Date.now() - 25 * 60 * 1000,
    amount: 0.1,
    recipients: 515,
    userShare: 0.005,
    txHash: '9pQR...4Abc',
  },
  {
    id: '5',
    time: '30 minutes ago',
    timestamp: Date.now() - 30 * 60 * 1000,
    amount: 0.1,
    recipients: 510,
    userShare: 0.005,
    txHash: '2sTu...6Def',
  },
];

type DistributionsResponse = {
  success: boolean;
  data: typeof mockDistributions;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DistributionsResponse>
) {
  // In a real implementation, we would fetch this data from the blockchain
  try {
    // Simulate fetching distribution history
    // In a real implementation, we would query the blockchain
    res.status(200).json({
      success: true,
      data: mockDistributions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      error: 'Failed to fetch distribution history',
    });
  }
} 