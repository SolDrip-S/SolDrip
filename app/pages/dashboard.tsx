import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TokenStats from '@/components/TokenStats';
import DividendTracker from '@/components/DividendTracker';
import UserHoldings from '@/components/UserHoldings';
import { useSolDrip } from '@/contexts/SolDripContext';

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const { tokenStats, userHoldings, isLoading, refreshData } = useSolDrip();
  
  // State for distribution history
  const [distributions, setDistributions] = useState([]);
  
  // Fetch distribution history
  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const response = await fetch('/api/distributions');
        const result = await response.json();
        if (result.success) {
          setDistributions(result.data);
        }
      } catch (error) {
        console.error('Error fetching distributions:', error);
      }
    };
    
    fetchDistributions();
  }, []);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Dashboard | SolDrip</title>
        <meta name="description" content="SolDrip dashboard - Track your SOL dividends in real-time" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="text-3xl font-bold text-soldrip-primary">
              Sol<span className="text-soldrip-secondary">Drip</span>
            </div>
            <div className="ml-2 text-soldrip-secondary drip-animation">💧</div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white">
            Home
          </Link>
          <Link href="/dashboard" className="text-white font-bold">
            Dashboard
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button 
            onClick={refreshData}
            className="btn-secondary flex items-center"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {!connected ? (
          <div className="card max-w-md mx-auto text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6 text-gray-400">
              Connect your wallet to view your holdings and dividend earnings.
            </p>
            <WalletMultiButton className="btn-primary w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tokenStats && userHoldings && (
              <>
                <UserHoldings 
                  balance={userHoldings.balance}
                  value={userHoldings.value}
                  nextDividend={userHoldings.nextDividend}
                  holdingTime={userHoldings.holdingTime}
                />
                
                <DividendTracker 
                  poolBalance={tokenStats.poolBalance}
                  nextDistribution={tokenStats.nextDistribution}
                  lastDistribution={tokenStats.lastDistribution}
                  totalDistributed={tokenStats.totalDistributed}
                  userNextDividend={userHoldings.nextDividend}
                />
                
                <TokenStats 
                  price={tokenStats.price}
                  marketCap={tokenStats.marketCap}
                  totalSupply={tokenStats.totalSupply}
                  circulatingSupply={tokenStats.circulatingSupply}
                  holders={tokenStats.holders}
                  totalDistributed={tokenStats.totalDistributed}
                />
              </>
            )}
          </div>
        )}
        
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recent Distributions</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Recipients</th>
                    <th className="px-4 py-3 text-left">Your Share</th>
                    <th className="px-4 py-3 text-left">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {distributions.length > 0 ? (
                    distributions.map((dist: any) => (
                      <tr key={dist.id}>
                        <td className="px-4 py-3">{dist.time}</td>
                        <td className="px-4 py-3">{dist.amount} SOL</td>
                        <td className="px-4 py-3">{dist.recipients}</td>
                        <td className="px-4 py-3">{connected ? dist.userShare : '-'} SOL</td>
                        <td className="px-4 py-3">
                          <a 
                            href={`https://explorer.solana.com/tx/${dist.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-soldrip-primary hover:underline"
                          >
                            {dist.txHash}
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center">
                        {isLoading ? 'Loading distributions...' : 'No distributions found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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