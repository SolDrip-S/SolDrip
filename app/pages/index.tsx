import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useSolDrip } from '@/contexts/SolDripContext';
import TokenStats from '@/components/TokenStats';
import DividendTracker from '@/components/DividendTracker';
import UserHoldings from '@/components/UserHoldings';

export default function Home() {
  const { publicKey, connected } = useWallet();
  const { tokenStats, userHoldings, isLoading } = useSolDrip();
  
  return (
    <div className="min-h-screen">
      <Head>
        <title>SolDrip - Auto-Compounding SOL Faucet</title>
        <meta name="description" content="SolDrip is the first Solana token with real-time slippage optimization that automatically converts transaction taxes into SOL dividends." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-3xl font-bold text-soldrip-primary">
            Sol<span className="text-soldrip-secondary">Drip</span>
          </div>
          <div className="ml-2 text-soldrip-secondary drip-animation">💧</div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white font-bold">
            Home
          </Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">
            <span className="text-soldrip-primary">Auto-Compounding</span>
            <br />
            <span className="text-soldrip-secondary">SOL Faucet</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-300">
            Hold tokens, earn SOL every 5 minutes directly to your wallet.
          </p>
          
          {/* Dividend Pool Status */}
          {tokenStats && (
            <div className="mt-12 card max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4">Dividend Pool Status</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400">Current Pool</p>
                  <p className="text-2xl font-bold">{tokenStats.poolBalance} SOL</p>
                </div>
                <div className="h-16 w-16 relative">
                  <div className="absolute inset-0 bg-soldrip-primary rounded-full opacity-20 animate-ping"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">💧</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-soldrip-primary h-full" 
                  style={{ width: `${(tokenStats.poolBalance / tokenStats.nextDistribution * 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Next distribution at {tokenStats.nextDistribution} SOL ({(tokenStats.poolBalance / tokenStats.nextDistribution * 100).toFixed(0)}% complete)
              </p>
            </div>
          )}
        </section>

        {connected ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Holdings */}
            <UserHoldings 
              balance={userHoldings.balance}
              value={userHoldings.value}
              nextDividend={userHoldings.nextDividend}
              holdingTime={userHoldings.holdingTime}
            />
            
            {/* Dividend History */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Dividend History</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Today</span>
                  <span className="text-xl font-bold">0.12 SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Week</span>
                  <span className="text-xl font-bold">0.35 SOL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Earned</span>
                  <span className="text-xl font-bold">0.35 SOL</span>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/dashboard" className="btn-secondary w-full block text-center">
                  View Full History
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="text-center">
            <div className="card max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="mb-6 text-gray-400">
                Connect your wallet to view your holdings and dividend earnings.
              </p>
              <WalletMultiButton className="btn-primary w-full" />
            </div>
          </section>
        )}
        
        {/* Token Info */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-4xl mb-4 text-soldrip-primary">⚡</div>
              <h3 className="text-xl font-bold mb-2">Lightning Dividend Engine</h3>
              <p className="text-gray-400">
                5% of each transaction is automatically converted to SOL and distributed to holders every 5 minutes.
              </p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4 text-soldrip-secondary">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Anti-Fragile Liquidity</h3>
              <p className="text-gray-400">
                1% of transactions go to liquidity. Price protection activates during high volatility.
              </p>
            </div>
            <div className="card">
              <div className="text-4xl mb-4 text-soldrip-accent">🐳</div>
              <h3 className="text-xl font-bold mb-2">Anti-Whale System</h3>
              <p className="text-gray-400">
                Maximum 3% holdings per wallet. Higher taxes on large sales protect smaller holders.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 text-center text-gray-400">
        <p>© 2023 SolDrip. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">Telegram</a>
          <a href="#" className="hover:text-white">Discord</a>
          <a href="#" className="hover:text-white">GitHub</a>
        </div>
      </footer>
    </div>
  );
} 