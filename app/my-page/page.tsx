'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import { translations } from '@/lib/translations';
import { Category } from '@/lib/types';

export default function MyPage() {
  const { state, getPortfolio } = useStore();
  const t = translations[state.language];
  const [activeTab, setActiveTab] = useState<'fan' | 'athlete'>('fan');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);

  useEffect(() => {
    if (!state.currentUser) {
      window.location.replace('/');
    }
  }, [state.currentUser]);

  if (!state.currentUser) {
    return null;
  }

  const portfolio = getPortfolio();
  const userTrades = state.trades.filter(t => t.userId === state.currentUser!.id).reverse();
  const portfolioValue = portfolio.reduce((sum, p) => sum + (p.quantity * p.currentPrice), 0);
  const totalFeesGenerated = userTrades.reduce((sum, t) => sum + t.fee, 0);
  const immediatePayoutContribution = totalFeesGenerated * 0.5; // 2.5% of 5%
  const categoryLabels: Record<Category, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite
  };

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
          <h1 className="text-5xl font-bold mb-8 gradient-text">{t.myPage}</h1>

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
              {t.participantViewTab}
            </button>
            <button
              onClick={() => setActiveTab('athlete')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'athlete'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {t.athleteViewTab}
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
                    <h3 className="text-lg font-semibold">{t.balance}</h3>
                  </div>
                  <p className="text-3xl font-bold price-display">
                    {state.currentUser.athlxBalance.toLocaleString()} tATHLX
                  </p>
                </div>
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="text-green-400" size={24} />
                    <h3 className="text-lg font-semibold">{t.unitHoldingsValue}</h3>
                  </div>
                  <p className="text-3xl font-bold price-display">
                    {portfolioValue.toLocaleString()} tATHLX
                  </p>
                </div>
                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="text-purple-400" size={24} />
                    <h3 className="text-lg font-semibold">{t.unitHoldings}</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {portfolio.length} {t.unitHoldingsCountLabel}
                  </p>
                </div>
              </div>

              {/* Portfolio */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">{t.myUnits}</h2>
                {portfolio.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-3 px-4">{t.athleteLabel}</th>
                          <th className="text-right py-3 px-4">{t.quantity}</th>
                          <th className="text-right py-3 px-4">{t.avgUnitCost}</th>
                          <th className="text-right py-3 px-4">{t.currentUnitCost}</th>
                          <th className="text-right py-3 px-4">{t.unitDeltaLabel}</th>
                          <th className="text-right py-3 px-4">{t.actionLabel}</th>
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
                                  {t.releaseUnits}
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
                    <p className="mb-4">{t.noUnitsMessage}</p>
                    <Link href="/market" className="text-blue-400 hover:text-blue-300 font-semibold">
                      {t.exploreTestEnvironment} →
                    </Link>
                  </div>
                )}
              </div>

              {/* Activity History */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">{t.activityHistory}</h2>
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
                              {trade.type === 'buy' ? t.acquireUnits : t.releaseUnits} {trade.quantity} {trade.athleteSymbol}
                            </p>
                            <p className="text-sm text-gray-400">{new Date(trade.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold price-display">{trade.total.toLocaleString()} tATHLX</p>
                          <p className="text-sm text-gray-400">{t.demoFeeShort}: {trade.fee.toLocaleString()} tATHLX</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-400">{t.noActivityHistory}</p>
                )}
              </div>

              {/* Impact */}
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-4">{t.yourImpact}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">{t.totalDemoFees}</p>
                    <p className="text-2xl font-bold price-display">{totalFeesGenerated.toLocaleString()} tATHLX</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">{t.immediateSupportContribution}</p>
                    <p className="text-2xl font-bold price-display text-green-400">
                      {immediatePayoutContribution.toLocaleString()} tATHLX
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  {t.impactNoteStart} {immediatePayoutContribution.toLocaleString()} tATHLX {t.impactNoteEnd}
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
                    <h2 className="text-2xl font-bold mb-6">{t.yourAthleteProfile}: {linkedAthlete.symbol}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.categoryLabel}</p>
                        <span className={`badge badge-${linkedAthlete.category.toLowerCase().replace('-', '')}`}>
                          {categoryLabels[linkedAthlete.category]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.unitCostLabel}</p>
                        <p className="text-xl font-bold price-display">{linkedAthlete.unitCost.toLocaleString()} tATHLX</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.participants}</p>
                        <p className="text-xl font-bold">{linkedAthlete.holders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.demoCreditsFlow}</p>
                        <p className="text-xl font-bold price-display">{linkedAthlete.tradingVolume.toLocaleString()} tATHLX</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                      <Activity className="text-green-400" size={28} />
                      <span>{t.realTimeSupport}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/50 rounded-lg p-6">
                        <p className="text-sm text-gray-400 mb-2">{t.totalDemoCreditsFlow}</p>
                        <p className="text-3xl font-bold price-display">{linkedAthlete.tradingVolume.toLocaleString()} tATHLX</p>
                      </div>
                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
                        <p className="text-sm text-gray-300 mb-2">{t.totalImmediatePayout}</p>
                        <p className="text-3xl font-bold price-display text-green-400">
                          {(linkedAthlete.tradingVolume * 0.025).toLocaleString()} tATHLX
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {t.directSupportNote}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-400">
                      {t.realTimeSupportNote}
                    </p>
                  </div>

                  <div className="glass-effect rounded-xl p-6">
                    <Link href={`/athlete/${linkedAthlete.symbol}`} className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold">
                      {t.viewPublicProfile} →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="glass-effect rounded-xl p-12 text-center">
                  <h2 className="text-2xl font-bold mb-4">{t.noAthleteProfileLinked}</h2>
                  <p className="text-gray-300 mb-6">
                    {t.noAthleteProfileLinkedDetail}
                  </p>
                  <Link
                    href="/register-athlete"
                    className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition"
                  >
                    {t.registerAthlete}
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

