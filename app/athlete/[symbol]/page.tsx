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
    let dataPoints = athlete.priceHistory;
    
    if (timeframe === '1D') dataPoints = athlete.priceHistory.slice(-1);
    if (timeframe === '1W') dataPoints = athlete.priceHistory.slice(-7);
    if (timeframe === '1M') dataPoints = athlete.priceHistory.slice(-30);

    return {
      labels: dataPoints.map(p => new Date(p.time).toLocaleDateString()),
      datasets: [
        {
          label: t.activityIndexWithPoints,
          data: dataPoints.map(p => p.price),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [athlete.priceHistory, timeframe, t.activityIndexWithPoints]);

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
          color: '#9ca3af',
          callback: (value: any) => `${value} ${t.pointsUnit}`
        }
      }
    }
  };

  const openTrade = (mode: 'buy' | 'sell') => {
    setTradeMode(mode);
    setTradeModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="glass-effect rounded-xl p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Image */}
              <div>
                <img
                  src={athlete.imageUrl}
                  alt={athlete.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>

              {/* Center: Info */}
              <div className="lg:col-span-1">
                <div className="mb-4">
                  <h1 className="text-4xl font-bold mb-2">{athlete.name}</h1>
                  <div className="flex items-center space-x-2 text-xl text-gray-400 mb-3">
                    <span className="font-bold text-blue-400">{athlete.symbol}</span>
                    <span>•</span>
                    <span className={`badge badge-${athlete.category.toLowerCase().replace('-', '')}`}>
                      {categoryLabels[athlete.category]}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <User size={18} className="text-gray-400" />
                    <span>{sportLabels[athlete.sport]} • {athlete.position}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{getCountryFlag(athlete.nationality)} {athlete.nationality}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span>{athlete.team}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {t.ageLabel}: {athlete.age} • {t.heightLabel}: {athlete.height}
                  </div>
                </div>
              </div>

              {/* Right: Price & Actions */}
              <div>
                <div className="bg-slate-700/50 rounded-lg p-6 mb-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">{t.unitCostLabel}</p>
                    <p className="text-4xl font-bold price-display">
                      {formatNumber(athlete.unitCost)} tATHLX
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">{t.indexDelta24h}</p>
                      <p className={`text-lg font-bold ${athlete.price24hChange >= 0 ? 'price-up' : 'price-down'}`}>
                        {athlete.price24hChange >= 0 ? '+' : ''}{athlete.price24hChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.indexDelta7d}</p>
                      <p className={`text-lg font-bold ${athlete.price7dChange >= 0 ? 'price-up' : 'price-down'}`}>
                        {athlete.price7dChange >= 0 ? '+' : ''}{athlete.price7dChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">{t.demoCreditsFlow}</p>
                      <p className="font-semibold">{formatNumber(athlete.tradingVolume)} tATHLX</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t.participants}</p>
                      <p className="font-semibold">{athlete.holders}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openTrade('buy')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition flex items-center justify-center space-x-2"
                  >
                    <TrendingUp size={20} />
                    <span>{t.acquireUnits}</span>
                  </button>
                  <button
                    onClick={() => openTrade('sell')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition flex items-center justify-center space-x-2"
                  >
                    <TrendingDown size={20} />
                    <span>{t.releaseUnits}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

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
            <div className="h-96">
              <AthletePriceChart data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Profile & Bio */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">{t.playerProfile}</h2>
              <p className="text-gray-300 leading-relaxed mb-4">{athlete.bio}</p>
              <a
                href={athlete.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {t.viewFullProfile} →
              </a>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">{t.highlightVideo}</h2>
              <div className="aspect-video">
                <iframe
                  src={athlete.highlightVideoUrl}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>

          {/* Latest News */}
          {relatedNews.length > 0 && (
            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">{t.latestNews}</h2>
              <div className="space-y-4">
                {relatedNews.map(news => (
                  <div key={news.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition">
                    <h3 className="text-lg font-bold mb-2">{news.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{news.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(news.date).toLocaleDateString()}
                      </span>
                      <a
                        href={news.readMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                      >
                        {t.readMore} →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        athlete={athlete}
        initialMode={tradeMode}
      />
    </>
  );
}
