'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { notFound } from 'next/navigation';
import { TrendingUp, TrendingDown, Calendar, MapPin, User } from 'lucide-react';
import TradeModal from '@/components/TradeModal';
import { translations } from '@/lib/translations';
import { Category } from '@/lib/types';
import dynamic from 'next/dynamic';
import type { ChartData, ChartOptions } from 'chart.js';
import { formatNumber } from '@/lib/format';
import { getCurrentPseudoPrice, getPseudoSeries } from '@/lib/pricing/pseudoMarket';

const AthletePriceChart = dynamic(() => import('@/components/AthletePriceChart'), { ssr: false });

export default function AthletePage({ params }: { params: { symbol: string } }) {
  const { symbol } = params;
  const { state } = useStore();
  const t = translations[state.language];
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1W');

  const athlete = state.athletes.find(a => a.symbol === symbol);

  if (!athlete) {
    notFound();
  }

  const relatedNews = state.news.filter(n => n.relatedAthleteSymbol === athlete.symbol);
  const categoryLabels: Record<Category, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite
  };
  const sportLabels: Record<string, string> = {
    Football: t.sportFootball,
    Basketball: t.sportBasketball,
    Athletics: t.sportAthletics,
    Swimming: t.sportSwimming,
    Tennis: t.sportTennis,
    Gymnastics: t.sportGymnastics,
    Volleyball: t.sportVolleyball,
    'Rugby Sevens': t.sportRugbySevens,
    Boxing: t.sportBoxing,
    Judo: t.sportJudo,
    Cycling: t.sportCycling,
    Rowing: t.sportRowing,
    'Table Tennis': t.sportTableTennis,
    Badminton: t.sportBadminton,
    Fencing: t.sportFencing,
    Weightlifting: t.sportWeightlifting,
    Wrestling: t.sportWrestling,
    Taekwondo: t.sportTaekwondo,
    Archery: t.sportArchery,
    Shooting: t.sportShooting,
    Cricket: t.sportCricket,
    eSports: t.sportEsports,
    Others: t.sportOthers
  };

  const getCountryFlag = (nationality: string) => {
    const flags: Record<string, string> = {
      'Portugal': '🇵🇹', 'Japan': '🇯🇵', 'Spain': '🇪🇸', 'USA': '🇺🇸', 'Nigeria': '🇳🇬',
      'China': '🇨🇳', 'Sweden': '🇸🇪', 'Mexico': '🇲🇽', 'France': '🇫🇷', 'Ghana': '🇬🇭',
      'Poland': '🇵🇱', 'India': '🇮🇳', 'Italy': '🇮🇹', 'Ireland': '🇮🇪', 'South Korea': '🇰🇷',
      'UAE': '🇦🇪', 'Brazil': '🇧🇷', 'Malaysia': '🇲🇾', 'Russia': '🇷🇺', 'Canada': '🇨🇦'
    };
    return flags[nationality] || '🏳️';
  };

  const chartData = useMemo<ChartData<'line'>>(() => {
    const now = new Date();
    const timeframeConfig = {
      '1D': { days: 1, stepSec: 300, label: 'time' as const },
      '1W': { days: 7, stepSec: 900, label: 'date' as const },
      '1M': { days: 30, stepSec: 3600, label: 'date' as const },
    };
    const config = timeframeConfig[timeframe];
    const from = new Date(now.getTime() - config.days * 24 * 60 * 60 * 1000);
    const series = getPseudoSeries(athlete.symbol, athlete.unitCost, {
      from,
      to: now,
      stepSec: config.stepSec,
    });
    const labels = series.map((point) =>
      config.label === 'time'
        ? new Date(point.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date(point.t).toLocaleDateString(),
    );

    return {
      labels,
      datasets: [
        {
          label: t.unitCostLabel,
          data: series.map((point) => point.price),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [athlete.symbol, athlete.unitCost, timeframe, t.unitCostLabel]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  const calculateChange = (series: Array<{ price: number }>) => {
    if (series.length < 2) return 0;
    const first = series[0].price;
    const last = series[series.length - 1].price;
    return first ? ((last - first) / first) * 100 : 0;
  };

  const pricingBucket = Math.floor(Date.now() / (300 * 1000));
  const pricingSnapshot = useMemo(() => {
    const now = new Date();
    const currentPrice = getCurrentPseudoPrice(athlete.symbol, athlete.unitCost, now);
    const series24h = getPseudoSeries(athlete.symbol, athlete.unitCost, {
      from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      to: now,
      stepSec: 300,
    });
    const series7d = getPseudoSeries(athlete.symbol, athlete.unitCost, {
      from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      to: now,
      stepSec: 900,
    });

    return {
      currentPrice,
      change24h: calculateChange(series24h),
      change7d: calculateChange(series7d),
    };
  }, [athlete.symbol, athlete.unitCost, pricingBucket]);
  const tradeAthlete = { ...athlete, unitCost: pricingSnapshot.currentPrice, currentPrice: pricingSnapshot.currentPrice };

  const openTrade = (mode: 'buy' | 'sell') => {
    setTradeMode(mode);
    setTradeModalOpen(true);
  };

  const activityIndex = athlete.activityIndex ?? athlete.currentPrice;
  const linkedAthlete = state.currentUser?.linkedAthleteId
    ? state.athletes.find(a => a.id === state.currentUser?.linkedAthleteId)
    : null;
  const isAthleteAccount = Boolean(linkedAthlete);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Athlete Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-6 mb-6">
                <img
                  src={athlete.imageUrl}
                  alt={athlete.name}
                  className="w-32 h-32 rounded-xl object-cover"
                />
                <div>
                  <h1 className="text-4xl font-bold mb-2">{athlete.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <span className="font-semibold text-blue-400">{athlete.symbol}</span>
                    <span>•</span>
                    <span>{categoryLabels[athlete.category]}</span>
                    <span>•</span>
                    <span>{sportLabels[athlete.sport]}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{getCountryFlag(athlete.nationality)} {athlete.nationality}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{athlete.team}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{athlete.position}</span>
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {t.ageLabel}: {athlete.age} • {t.heightLabel}: {athlete.height}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">{athlete.bio}</p>

              {relatedNews.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t.relatedNews}</h3>
                  <div className="space-y-2">
                    {relatedNews.map(news => (
                      <div key={news.id} className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-sm font-semibold">{news.title}</p>
                        <p className="text-xs text-gray-400">{news.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Price & Actions */}
            <div>
              <div className="bg-slate-700/50 rounded-lg p-6 mb-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">{t.unitCostLabel}</p>
                  <p className="text-4xl font-bold price-display">
                    {formatNumber(pricingSnapshot.currentPrice)} tATHLX
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">{t.indexDelta24h}</p>
                    <p className={`text-lg font-bold ${pricingSnapshot.change24h >= 0 ? 'price-up' : 'price-down'}`}>
                      {pricingSnapshot.change24h >= 0 ? '+' : ''}{pricingSnapshot.change24h.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t.indexDelta7d}</p>
                    <p className={`text-lg font-bold ${pricingSnapshot.change7d >= 0 ? 'price-up' : 'price-down'}`}>
                      {pricingSnapshot.change7d >= 0 ? '+' : ''}{pricingSnapshot.change7d.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">{t.activityIndexLabel}</p>
                    <p className="font-semibold">{formatNumber(activityIndex)} {t.pointsUnit}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t.demoCreditsFlow}</p>
                    <p className="font-semibold">{formatNumber(athlete.tradingVolume)} tATHLX</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">{t.participants}</p>
                    <p className="font-semibold">{athlete.holders}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openTrade('buy')}
                  disabled={isAthleteAccount}
                  className={`px-6 py-3 rounded-lg font-bold transition flex items-center justify-center space-x-2 ${
                    isAthleteAccount
                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <TrendingUp size={20} />
                  <span>{t.acquireUnits}</span>
                </button>
                <button
                  onClick={() => openTrade('sell')}
                  disabled={isAthleteAccount}
                  className={`px-6 py-3 rounded-lg font-bold transition flex items-center justify-center space-x-2 ${
                    isAthleteAccount
                      ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <TrendingDown size={20} />
                  <span>{t.releaseUnits}</span>
                </button>
                {isAthleteAccount && (
                  <p className="col-span-2 text-xs text-gray-400 mt-2">{t.cannotTradeOwnUnitsHint}</p>
                )}
              </div>
            </div>
          </div>

          {(athlete.nextMatch || athlete.lastUpdateReason) && (
            <div className="glass-effect rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">{t.matchUpdateTitle}</h2>
              {athlete.nextMatch && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">{t.nextMatch}</p>
                  <p className="font-semibold">
                    {athlete.nextMatch.date} · {athlete.nextMatch.opponent} ({athlete.nextMatch.homeAway})
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-blue-600/20 text-blue-200">{athlete.nextMatch.expectedRole}</span>
                    <span className="px-2 py-1 rounded-full bg-purple-600/20 text-purple-200">{athlete.nextMatch.condition}</span>
                    <span className="px-2 py-1 rounded-full bg-slate-700/60 text-gray-200">{athlete.nextMatch.importance}</span>
                  </div>
                </div>
              )}
              {athlete.lastUpdateReason && (
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">{t.lastUpdateReasonLabel}: </span>
                  {athlete.lastUpdateReason}
                </div>
              )}
            </div>
          )}

          {/* Activity Index Chart */}
          <div className="glass-effect rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{t.activityIndexChart}</h2>
              <div className="flex gap-2">
                {(['1D', '1W', '1M'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <AthletePriceChart data={chartData} options={chartOptions} />
            </div>
          </div>

          <TradeModal
            isOpen={tradeModalOpen}
            onClose={() => setTradeModalOpen(false)}
            athlete={tradeAthlete}
            initialMode={tradeMode}
          />
        </div>
      </div>
    </div>
  );
}
