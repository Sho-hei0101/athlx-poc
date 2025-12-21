'use client';

import { useStore } from '@/lib/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity } from 'lucide-react';
import TradeModal from '@/components/TradeModal';

export default function MyPage() {
  const { state, getPortfolio } = useStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fan' | 'athlete'>('fan');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);

  if (!state.currentUser) {
    router.push('/');
    return null;
  }

  const portfolio = getPortfolio();
  const userTrades = state.trades.filter(t => t.userId === state.currentUser!.id).reverse();
  const portfolioValue = portfolio.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0);
  const totalFeesGenerated = userTrades.reduce((sum, t) => sum + t.fee, 0);
  const immediatePayoutContribution = totalFeesGenerated * 0.5; // 2.5% of 5%

  const linkedAthlete = state.currentUser.linkedAthleteId
    ? state.athletes.find(a => a.id === state.currentUser!.linkedAthleteId)
    : null;

  const openSellModal = (portfolio: any) => {
    const athlete = state.athletes.find(a => a.symbol === portfolio.athleteSymbol);
    if (athlete) {
      setSelectedAthlete(athlete);
      setTradeModalOpen(true);
    }
  };

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 gradient-text">My Page</h1>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('fan')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'fan'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Fan Page
            </button>
            <button
              onClick={() => setActiveTab('athlete')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'athlete'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Athlete Page
            </button>
          </div>

          {/* Fan Page */}
          {activeTab === 'fan' && (
            <div className="space-y-8">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <DollarSign className="text-blue-400" size={24} />
                    <h3 className="text-lg font-semibold">ATHLX Balance</h3>
                  </div>
                  <p className="text-3xl font-bold price-display">{state.currentUser.athlxBalance.toLocaleString()} ATHLX</p>
                </div>
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="text-green-400" size={24} />
                    <h3 className="text-lg font-semibold">Portfolio Value</h3>
                  </div>
                  <p className="text-3xl font-bold price-display">{portfolioValue.toLocaleString()} ATHLX</p>
                </div>
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold">Holdings</h3>
                  </div>
                  <p className="text-3xl font-bold">{portfolio.length} Tokens</p>
                </div>
              </div>

              {/* Portfolio */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">My Portfolio</h2>
                {portfolio.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-3 px-4">Athlete</th>
                          <th className="text-right py-3 px-4">Quantity</th>
                          <th className="text-right py-3 px-4">Avg Buy Price</th>
                          <th className="text-right py-3 px-4">Current Price</th>
                          <th className="text-right py-3 px-4">P/L</th>
                          <th className="text-right py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.map(p => {
                          const pnl = (p.currentPrice - p.avgBuyPrice) * p.quantity;
                          const pnlPercent = ((p.currentPrice - p.avgBuyPrice) / p.avgBuyPrice) * 100;
                          
                          return (
                            <tr key={p.athleteSymbol} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                              <td className="py-3 px-4">
                                <Link href={`/athlete/${p.athleteSymbol}`} className="font-semibold hover:text-blue-400">
                                  {p.athleteName} ({p.athleteSymbol})
                                </Link>
                              </td>
                              <td className="text-right py-3 px-4 font-semibold">{p.quantity}</td>
                              <td className="text-right py-3 px-4 price-display">{p.avgBuyPrice.toLocaleString()}</td>
                              <td className="text-right py-3 px-4 price-display">{p.currentPrice.toLocaleString()}</td>
                              <td className={`text-right py-3 px-4 font-bold ${pnl >= 0 ? 'price-up' : 'price-down'}`}>
                                {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                              </td>
                              <td className="text-right py-3 px-4">
                                <button
                                  onClick={() => openSellModal(p)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition"
                                >
                                  Sell
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p className="mb-4">You don't have any athlete tokens yet.</p>
                    <Link href="/market" className="text-blue-400 hover:text-blue-300 font-semibold">
                      Explore Market →
                    </Link>
                  </div>
                )}
              </div>

              {/* Trading History */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Trading History</h2>
                {userTrades.length > 0 ? (
                  <div className="space-y-3">
                    {userTrades.map(trade => (
                      <div key={trade.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {trade.type === 'buy' ? (
                            <TrendingUp className="text-green-400" size={24} />
                          ) : (
                            <TrendingDown className="text-red-400" size={24} />
                          )}
                          <div>
                            <p className="font-semibold">
                              {trade.type.toUpperCase()} {trade.quantity} {trade.athleteSymbol}
                            </p>
                            <p className="text-sm text-gray-400">{new Date(trade.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold price-display">{trade.total.toLocaleString()} ATHLX</p>
                          <p className="text-sm text-gray-400">Fee: {trade.fee.toLocaleString()} ATHLX</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-400">No trading history yet.</p>
                )}
              </div>

              {/* Impact */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Total Fees Generated</p>
                    <p className="text-2xl font-bold price-display">{totalFeesGenerated.toLocaleString()} ATHLX</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Contribution to Immediate Athlete Support</p>
                    <p className="text-2xl font-bold price-display text-green-400">{immediatePayoutContribution.toLocaleString()} ATHLX</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  Your trading activity has contributed {immediatePayoutContribution.toLocaleString()} ATHLX directly to athletes through the 2.5% immediate payout mechanism.
                </p>
              </div>
            </div>
          )}

          {/* Athlete Page */}
          {activeTab === 'athlete' && (
            <div className="space-y-8">
              {linkedAthlete ? (
                <>
                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-6">Your Athlete Token: {linkedAthlete.symbol}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Category</p>
                        <span className={`badge badge-${linkedAthlete.category.toLowerCase().replace('-', '')}`}>
                          {linkedAthlete.category}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Current Price</p>
                        <p className="text-xl font-bold price-display">{linkedAthlete.currentPrice.toLocaleString()} ATHLX</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Holders</p>
                        <p className="text-xl font-bold">{linkedAthlete.holders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Trading Volume</p>
                        <p className="text-xl font-bold price-display">{linkedAthlete.tradingVolume.toLocaleString()} ATHLX</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                      <Activity className="text-green-400" size={28} />
                      <span>Real-time Support</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/50 rounded-lg p-6">
                        <p className="text-sm text-gray-400 mb-2">Total Trading Volume</p>
                        <p className="text-3xl font-bold price-display">{linkedAthlete.tradingVolume.toLocaleString()} ATHLX</p>
                      </div>
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
                        <p className="text-sm text-gray-300 mb-2">Total Immediate Payout (2.5%)</p>
                        <p className="text-3xl font-bold price-display text-green-400">
                          {(linkedAthlete.tradingVolume * 0.025).toLocaleString()} ATHLX
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Direct support from every trade of your token
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">
                      Every time your token is traded, 2.5% of the transaction volume goes directly to you as immediate financial support. This mechanism ensures you receive real-time benefits from your market activity.
                    </p>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <Link href={`/athlete/${linkedAthlete.symbol}`} className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold">
                      View Your Public Profile →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="glass-effect rounded-xl p-12 text-center">
                  <h2 className="text-2xl font-bold mb-4">No Athlete Token Linked</h2>
                  <p className="text-gray-300 mb-6">
                    You don't have an athlete token associated with your account yet.
                  </p>
                  <Link
                    href="/register-athlete"
                    className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition"
                  >
                    Register as Athlete
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedAthlete && (
        <TradeModal
          isOpen={tradeModalOpen}
          onClose={() => {
            setTradeModalOpen(false);
            setSelectedAthlete(null);
          }}
          athlete={selectedAthlete}
          initialMode="sell"
        />
      )}
    </>
  );
}
