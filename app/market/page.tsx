'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { translations } from '@/lib/translations';
import { Category, Sport } from '@/lib/types';
import { formatNumber } from '@/lib/format';
import Link from 'next/link';

export default function MarketPage() {
  const { state } = useStore();
  const t = translations[state.language];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'volume' | 'change'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAthletes = useMemo(() => {
    return state.athletes
      .filter((athlete) => {
        const matchesSearch =
          athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          athlete.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSport = selectedSport === 'All' || athlete.sport === selectedSport;
        const matchesCategory =
          selectedCategory === 'All' || athlete.category === selectedCategory;

        return matchesSearch && matchesSport && matchesCategory;
      })
      .sort((a, b) => {
        let compareValue = 0;

        switch (sortBy) {
          case 'name':
            compareValue = a.name.localeCompare(b.name);
            break;
          case 'price':
            compareValue = a.unitCost - b.unitCost;
            break;
          case 'volume':
            compareValue = a.tradingVolume - b.tradingVolume;
            break;
          case 'change':
            compareValue = a.price24hChange - b.price24hChange;
            break;
          default:
            compareValue = 0;
        }

        return sortDirection === 'asc' ? compareValue : -compareValue;
      });
  }, [state.athletes, searchTerm, selectedSport, selectedCategory, sortBy, sortDirection]);

  const categoryLabels: Record<Category, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite,
  };

  const sportLabels: Record<Sport, string> = {
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
    Others: t.sportOthers,
  };

  const tagLabels: Record<string, string> = {
    Featured: t.featured,
    'Fast Growing': t.fastGrowing,
    Elite: t.elite,
    Promoted: t.promoted,
    New: t.newLabel,
  };

  const getCountryFlag = (nationality: string) => {
    const flags: Record<string, string> = {
      Portugal: '🇵🇹',
      Japan: '🇯🇵',
      Spain: '🇪🇸',
      USA: '🇺🇸',
      Nigeria: '🇳🇬',
      China: '🇨🇳',
      Sweden: '🇸🇪',
      Mexico: '🇲🇽',
      France: '🇫🇷',
      Ghana: '🇬🇭',
      Poland: '🇵🇱',
      India: '🇮🇳',
      Italy: '🇮🇹',
      Ireland: '🇮🇪',
      'South Korea': '🇰🇷',
      UAE: '🇦🇪',
      Brazil: '🇧🇷',
      Malaysia: '🇲🇾',
      Russia: '🇷🇺',
      Canada: '🇨🇦',
    };
    return flags[nationality] || '🏳️';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2 gradient-text">{t.market}</h1>
            <p className="text-gray-400">{t.marketSubtitle}</p>
          </div>

          {/* Search */}
          <div className="mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t.searchAthletes}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition w-64"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-blue-400" />
              <span className="font-semibold">{t.filterBy}</span>
            </div>

            {/* Sport Filter */}
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value as Sport | 'All')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="All">{t.allSports}</option>
              {Object.entries(sportLabels).map(([sport, label]) => (
                <option key={sport} value={sport}>
                  {label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="All">{t.allCategories}</option>
              {Object.entries(categoryLabels).map(([category, label]) => (
                <option key={category} value={category}>
                  {label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="price">{t.sortByUnitCost}</option>
              <option value="name">{t.sortByName}</option>
              <option value="volume">{t.sortByVolume}</option>
              <option value="change">{t.sortByChange}</option>
            </select>

            <button
              onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
            >
              {sortDirection === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
            </button>
          </div>
        </div>

        {/* Market Stats */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            {t.showingLabel} {filteredAthletes.length}{' '}
            {filteredAthletes.length !== 1 ? t.athletePlural : t.athleteSingular}
          </p>
        </div>

        {/* Athlete Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => {
            const activityIndex = athlete.activityIndex ?? athlete.currentPrice;

            return (
              <Link
                key={athlete.id}
                href={`/athlete/${athlete.symbol}`}
                className="glass-effect rounded-xl p-6 hover-glow transition"
              >
                {/* Image + Tags */}
                <div className="relative mb-4 overflow-hidden rounded-lg bg-slate-800">
                  <img
                    src={athlete.imageUrl}
                    alt={athlete.name}
                    className="w-full h-56 object-cover object-top"
                    loading="lazy"
                  />

                  {/* Tags */}
                  <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
                    {athlete.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`badge badge-${tag.toLowerCase().replace(' ', '-')}`}
                      >
                        {tagLabels[tag] ?? tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{athlete.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center space-x-1">
                        <span>{getCountryFlag(athlete.nationality)}</span>
                        <span>{athlete.nationality}</span>
                      </p>
                    </div>
                    <span
                      className={`badge badge-${athlete.category
                        .toLowerCase()
                        .replace('-', '')}`}
                    >
                      {categoryLabels[athlete.category]}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">{athlete.symbol}</span>
                    <span>•</span>
                    <span>{sportLabels[athlete.sport]}</span>
                  </div>
                </div>

                {/* Activity Index Info */}
                <div className="border-t border-slate-600 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">{t.activityIndexLabel}</span>
                    <span className="text-xl font-bold price-display">
                      {formatNumber(activityIndex)} pts
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-400">{t.unitCostShort}</span>
                    <span className="font-semibold price-display">
                      {formatNumber(athlete.unitCost)} tATHLX
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-400">{t.indexDelta24hShort} </span>
                      <span className={athlete.price24hChange >= 0 ? 'price-up' : 'price-down'}>
                        {athlete.price24hChange >= 0 ? '+' : ''}
                        {athlete.price24hChange.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">{t.indexDelta7dShort} </span>
                      <span className={athlete.price7dChange >= 0 ? 'price-up' : 'price-down'}>
                        {athlete.price7dChange >= 0 ? '+' : ''}
                        {athlete.price7dChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    {t.demoCreditsFlowShort} {formatNumber(athlete.tradingVolume)} tATHLX •{' '}
                    {athlete.holders} {t.participantsLower}
                  </div>

                  {athlete.nextMatch && (
                    <div className="mt-2 text-xs text-gray-400">
                      {t.nextMatchShort}: {athlete.nextMatch.date} · {athlete.nextMatch.opponent}
                    </div>
                  )}
                </div>

                {/* Mini Sparkline */}
                <div className="mt-3 h-12 flex items-end space-x-1">
                  {athlete.priceHistory.slice(-10).map((point, i) => {
                    const recent = athlete.priceHistory.slice(-10);
                    const maxPrice = Math.max(...recent.map((p) => p.price));
                    const height = maxPrice ? (point.price / maxPrice) * 100 : 0;

                    return (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500/30 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </Link>
            );
          })}
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">{t.noAthletesFound}</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSport('All');
                setSelectedCategory('All');
              }}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
