'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import { translations } from '@/lib/translations';
import { Category, MatchHomeAway, MatchResult } from '@/lib/types';
import { formatNumber } from '@/lib/format';

type UpdateFormState = {
  matchDate: string;
  opponent: string;
  homeAway: MatchHomeAway;
  minutesPlayed: number;
  result: MatchResult;
  goals: number;
  assists: number;
  injury: boolean;
  notes: string;
};

export default function MyPage() {
  const { state, getPortfolio, submitAthletePerformanceUpdate } = useStore();
  const t = translations[state.language];

  const [activeTab, setActiveTab] = useState<'fan' | 'athlete'>('fan');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);

  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateForm, setUpdateForm] = useState<UpdateFormState>({
    matchDate: '',
    opponent: '',
    homeAway: 'Home',
    minutesPlayed: 90,
    result: 'Win',
    goals: 0,
    assists: 0,
    injury: false,
    notes: '',
  });

  useEffect(() => {
    if (!state.currentUser) {
      window.location.replace('/');
    }
  }, [state.currentUser]);

  if (!state.currentUser) return null;

  const portfolio = getPortfolio();
  const userTrades = state.trades
    .filter((tr) => tr.userId === state.currentUser!.id)
    .slice()
    .reverse();

  const portfolioValue = portfolio.reduce((sum, p) => {
    const fallbackUnitCost = state.athletes.find((a) => a.symbol === p.athleteSymbol)?.unitCost ?? 0;
    const unitCost = (p.currentPrice ?? 0) > 0 ? (p.currentPrice ?? 0) : fallbackUnitCost;
    return sum + (p.quantity ?? 0) * unitCost;
  }, 0);

  const totalFeesGenerated = userTrades.reduce((sum, tr) => sum + (tr.fee ?? 0), 0);
  const immediatePayoutContribution = totalFeesGenerated * 0.5; // demo

  const categoryLabels: Record<Category, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite,
  };

  const linkedAthlete = state.currentUser.linkedAthleteId
    ? state.athletes.find((a) => a.id === state.currentUser!.linkedAthleteId)
    : null;

  const isAthleteAccount = Boolean(state.currentUser.linkedAthleteId);

  const recentUpdates = linkedAthlete
    ? state.athleteUpdates
        .filter((update) => update.athleteSymbol === linkedAthlete.symbol)
        .slice(-5)
        .reverse()
    : [];

  const openSellModal = (p: any) => {
    const athlete = state.athletes.find((a) => a.symbol === p.athleteSymbol);
    if (athlete) {
      setSelectedAthlete(athlete);
      setTradeModalOpen(true);
    }
  };

  const handleUpdateSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!linkedAthlete) return;

    setUpdateError('');
    setUpdateMessage('');

    if (!updateForm.matchDate || !updateForm.opponent || !updateForm.homeAway || !updateForm.result) {
      setUpdateError(t.updateRequiredFields);
      return;
    }

    const minutesPlayed = Math.max(0, Math.min(90, Number(updateForm.minutesPlayed) || 0));
    const goals = Math.max(0, Math.min(10, Number(updateForm.goals) || 0));
    const assists = Math.max(0, Math.min(10, Number(updateForm.assists) || 0));

    try {
      submitAthletePerformanceUpdate({
        athleteSymbol: linkedAthlete.symbol,
        matchDate: updateForm.matchDate,
        opponent: updateForm.opponent.trim(),
        homeAway: updateForm.homeAway,
        minutesPlayed,
        result: updateForm.result,
        goals,
        assists,
        injury: updateForm.injury,
        notes: updateForm.notes.trim(),
      });

      setUpdateMessage(t.athleteUpdateSubmitted);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined;
      setUpdateError(message ?? t.updateFailed);
    }
  };

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-5xl font-bold gradient-text">{t.myPage}</h1>
          </div>

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
                    {formatNumber(state.currentUser.athlxBalance)} tATHLX
                  </p>
                </div>

                <div className="glass-effect rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <TrendingUp className="text-green-400" size={24} />
                    <h3 className="text-lg font-semibold">{t.unitHoldingsValue}</h3>
                  </div>
                  <p className="text-3xl font-bold price-display">{formatNumber(portfolioValue)} tATHLX</p>
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
                        {portfolio.map((p) => {
                          const avgBuyPrice = p.avgBuyPrice ?? 0;
                          const currentPrice = p.currentPrice ?? 0;
                          const quantity = p.quantity ?? 0;

                          const fallbackUnitCost =
                            state.athletes.find((a) => a.symbol === p.athleteSymbol)?.unitCost ?? 0;

                          const displayUnitCost = currentPrice > 0 ? currentPrice : fallbackUnitCost;

                          const pnl = (displayUnitCost - avgBuyPrice) * quantity;
                          const pnlPercent = avgBuyPrice
                            ? ((displayUnitCost - avgBuyPrice) / avgBuyPrice) * 100
                            : 0;

                          return (
                            <tr
                              key={p.athleteSymbol}
                              className="border-b border-slate-700/50 hover:bg-slate-700/30"
                            >
                              <td className="py-3 px-4">
                                <Link
                                  href={`/athlete/${p.athleteSymbol}`}
                                  className="font-semibold hover:text-blue-400"
                                >
                                  {p.athleteName} ({p.athleteSymbol})
                                </Link>
                              </td>

                              <td className="text-right py-3 px-4 font-semibold">{quantity}</td>
                              <td className="text-right py-3 px-4 price-display">{formatNumber(avgBuyPrice)}</td>
                              <td className="text-right py-3 px-4 price-display">
                                {formatNumber(displayUnitCost)}
                              </td>

                              <td
                                className={`text-right py-3 px-4 font-bold ${
                                  pnl >= 0 ? 'price-up' : 'price-down'
                                }`}
                              >
                                {pnl >= 0 ? '+' : ''}
                                {formatNumber(pnl)} ({pnlPercent >= 0 ? '+' : ''}
                                {pnlPercent.toFixed(1)}%)
                              </td>

                              <td className="text-right py-3 px-4">
                                <button
                                  onClick={() => openSellModal(p)}
                                  disabled={isAthleteAccount}
                                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                    isAthleteAccount
                                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {t.releaseUnits}
                                </button>
                                {isAthleteAccount && (
                                  <p className="text-xs text-gray-400 mt-1">{t.cannotTradeOwnUnitsHint}</p>
                                )}
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
                    {userTrades.map((tr) => (
                      <div
                        key={tr.id}
                        className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          {tr.type === 'buy' ? (
                            <TrendingUp className="text-green-400" size={24} />
                          ) : (
                            <TrendingDown className="text-red-400" size={24} />
                          )}
                          <div>
                            <p className="font-semibold">
                              {tr.type === 'buy' ? t.acquireUnits : t.releaseUnits} {tr.quantity}{' '}
                              {tr.athleteSymbol}
                            </p>
                            <p className="text-sm text-gray-400">{new Date(tr.timestamp).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold price-display">{formatNumber(tr.total)} tATHLX</p>
                          <p className="text-sm text-gray-400">
                            {t.demoFeeShort}: {formatNumber(tr.fee)} tATHLX
                          </p>
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
                    <p className="text-2xl font-bold price-display">{formatNumber(totalFeesGenerated)} tATHLX</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">{t.immediateSupportContribution}</p>
                    <p className="text-2xl font-bold price-display text-green-400">
                      {formatNumber(immediatePayoutContribution)} tATHLX
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  {t.impactNoteStart} {formatNumber(immediatePayoutContribution)} tATHLX {t.impactNoteEnd}
                </p>
              </div>
            </div>
          )}

          {/* Athlete Page */}
          {activeTab === 'athlete' && (
            <div className="space-y-8">
              {linkedAthlete ? (
                <>
                  {/* Athlete Profile Summary */}
                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-6">
                      {t.yourAthleteProfile}: {linkedAthlete.symbol}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.categoryLabel}</p>
                        <span className={`badge badge-${linkedAthlete.category.toLowerCase().replace('-', '')}`}>
                          {categoryLabels[linkedAthlete.category]}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.unitCostLabel}</p>
                        <p className="text-xl font-bold price-display">
                          {formatNumber(linkedAthlete.unitCost)} tATHLX
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.participants}</p>
                        <p className="text-xl font-bold">{linkedAthlete.holders}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.demoCreditsFlow}</p>
                        <p className="text-xl font-bold price-display">
                          {formatNumber(linkedAthlete.tradingVolume)} tATHLX
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Support */}
                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                      <Activity className="text-green-400" size={28} />
                      <span>{t.realTimeSupport}</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-700/50 rounded-lg p-6">
                        <p className="text-sm text-gray-400 mb-2">{t.totalDemoCreditsFlow}</p>
                        <p className="text-3xl font-bold price-display">
                          {formatNumber(linkedAthlete.tradingVolume)} tATHLX
                        </p>
                      </div>

                      <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
                        <p className="text-sm text-gray-300 mb-2">{t.totalImmediatePayout}</p>
                        <p className="text-3xl font-bold price-display text-green-400">
                          {formatNumber(linkedAthlete.tradingVolume * 0.025)} tATHLX
                        </p>
                        <p className="text-xs text-gray-400 mt-2">{t.directSupportNote}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-400">{t.realTimeSupportNote}</p>
                  </div>

                  {/* Athlete Update */}
                  <div className="glass-effect rounded-xl p-6">
                    <h2 className="text-2xl font-bold mb-2">{t.athleteUpdateTitle}</h2>
                    <p className="text-sm text-gray-400 mb-6">{t.athleteUpdateSubtitle}</p>

                    <form onSubmit={handleUpdateSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.matchDateLabel}</label>
                          <input
                            type="date"
                            value={updateForm.matchDate}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({ ...prev, matchDate: event.target.value }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t.opponentLabel}</label>
                          <input
                            type="text"
                            value={updateForm.opponent}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({ ...prev, opponent: event.target.value }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t.homeAwayLabel}</label>
                          <select
                            value={updateForm.homeAway}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({
                                ...prev,
                                homeAway: event.target.value as MatchHomeAway,
                              }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                            required
                          >
                            <option value="Home">{t.homeLabel}</option>
                            <option value="Away">{t.awayLabel}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t.minutesPlayedLabel}</label>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={updateForm.minutesPlayed}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({
                                ...prev,
                                minutesPlayed: Number(event.target.value),
                              }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t.resultLabel}</label>
                          <select
                            value={updateForm.result}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({ ...prev, result: event.target.value as MatchResult }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                            required
                          >
                            <option value="Win">{t.resultWin}</option>
                            <option value="Draw">{t.resultDraw}</option>
                            <option value="Loss">{t.resultLoss}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t.goalsLabel}</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={updateForm.goals}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({ ...prev, goals: Number(event.target.value) }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">{t.assistsLabel}</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={updateForm.assists}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({ ...prev, assists: Number(event.target.value) }))
                            }
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                          />
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-300 mt-6">
                          <input
                            type="checkbox"
                            checked={updateForm.injury}
                            onChange={(event) =>
                              setUpdateForm((prev) => ({ ...prev, injury: event.target.checked }))
                            }
                          />
                          <span>{t.injuryLabel}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">{t.notesLabel}</label>
                        <textarea
                          value={updateForm.notes}
                          onChange={(event) => setUpdateForm((prev) => ({ ...prev, notes: event.target.value }))}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg min-h-[120px]"
                        />
                      </div>

                      {updateError && (
                        <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200">
                          {updateError}
                        </div>
                      )}

                      {updateMessage && (
                        <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-sm text-green-200">
                          {updateMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                      >
                        {t.submitAthleteUpdate}
                      </button>
                    </form>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.unitCostLabel}</p>
                        <p className="text-xl font-bold price-display">{formatNumber(linkedAthlete.unitCost)} tATHLX</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.activityIndexLabel}</p>
                        <p className="text-xl font-bold">
                          {formatNumber(linkedAthlete.activityIndex)} {t.pointsUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t.lastUpdateReasonLabel}</p>
                        <p className="text-sm text-gray-300">
                          {linkedAthlete.lastUpdateReason ?? t.noUpdatesYet}
                        </p>
                      </div>
                    </div>

                    {recentUpdates.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">{t.recentUpdates}</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                          {recentUpdates.map((update) => (
                            <div key={update.id} className="bg-slate-700/50 rounded-lg p-3">
                              <div className="flex justify-between">
                                <span>
                                  {update.matchDate} · {update.opponent}
                                </span>
                                <span className="text-gray-400">
                                  {new Date(update.submittedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {update.notes && <p className="text-xs text-gray-400 mt-1">{update.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Link to public profile */}
                  <div className="glass-effect rounded-xl p-6">
                    <Link
                      href={`/athlete/${linkedAthlete.symbol}`}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      {t.viewPublicProfile} →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="glass-effect rounded-xl p-12 text-center">
                  <h2 className="text-2xl font-bold mb-4">{t.noAthleteProfileLinked}</h2>
                  <p className="text-gray-300 mb-6">{t.noAthleteProfileLinkedDetail}</p>
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