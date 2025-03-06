import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data for the MVP
const mockHoldings = {
  balance: 1000000,
  value: 123,
  nextDividend: 0.05,
  holdingTime: 12,
  transactions: [
    { type: 'buy', amount: 500000, time: '2 days ago', value: 60 },
    { type: 'buy', amount: 500000, time: '12 days ago', value: 55 },
  ],
  dividends: [
    { amount: 0.005, time: '10 minutes ago' },
    { amount: 0.005, time: '15 minutes ago' },
    { amount: 0.005, time: '20 minutes ago' },
    { amount: 0.005, time: '25 minutes ago' },
    { amount: 0.005, time: '30 minutes ago' },
  ],
};

type UserHoldingsResponse = {
  success: boolean;
  data: typeof mockHoldings | null;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserHoldingsResponse>
) {
  // In a real implementation, we would fetch this data from the blockchain
  // based on the user's wallet address
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Wallet address is required',
    });
  }

  try {
    // Simulate fetching data for the specific address
    // In a real implementation, we would query the blockchain
    res.status(200).json({
      success: true,
      data: mockHoldings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: 'Failed to fetch user holdings',
    });
  }
} 