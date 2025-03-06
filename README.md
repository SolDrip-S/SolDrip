# SolDrip - Auto-Compounding SOL Faucet On Solana

SolDrip is the first Solana token with real-time slippage optimization that automatically converts 5% of each transaction tax into SOL cash flow, precisely distributed to token holders every 5 minutes.

## Core Features

### 1. Lightning Dividend Engine
- Automatically exchanges transaction taxes to SOL via Jupiter aggregator
- Smart contract triggers dividends every 0.1 SOL accumulated (approximately 5-minute cycles)
- Distribution formula: Your earnings = (Your holdings / Total supply) × Dividend pool SOL balance × 0.98
  (2% used for on-chain computation gas costs)

### 2. Anti-Fragile Liquidity Mechanism
- 1% transaction tax automatically injected into LP pool at 50/50 ratio
- Slippage protection mode activated when price fluctuates >15%:
  - Pauses dividends for 10 minutes
  - Uses 80% of current tax collection for market buybacks

### 3. Transparent Anti-Whale System
- Maximum holdings per address ≤3% of total supply
- For large sales (>0.2% of total supply):
  - Transaction tax increases to 8%
  - Additional 3% tax injected into 24-hour delayed dividend pool

## Trust Enhancement Design
- Real-time dividend tracking dashboard
- Contract security architecture:
  - Audited by [Ottersec]
  - Ownership renounced
  - All SOL exchange records verifiable on-chain
- Holding time accelerator: Wallets holding tokens for over 7 days automatically receive a 1.1x earnings weight coefficient

## Project Structure

```
/
├── programs/            # Solana smart contracts
│   └── soldrip/         # Main SolDrip token program
├── app/                 # Frontend application
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   └── public/          # Static assets
└── tests/               # Test suite
```

## Development Setup

### Prerequisites
- Node.js v16+
- Rust and Cargo
- Solana CLI
- Anchor Framework

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/soldrip.git
cd soldrip
```

2. Install dependencies
```bash
# Install Solana program dependencies
cd programs/soldrip
cargo build

# Install frontend dependencies
cd ../../app
npm install
```

3. Run local development environment
```bash
# Start local Solana validator
solana-test-validator

# Deploy program
anchor deploy

# Start frontend
npm run dev
```

## License
[MIT License](LICENSE) 