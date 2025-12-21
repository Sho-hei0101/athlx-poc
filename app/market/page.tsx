'use client';

import { useStore } from '@/lib/store';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Sport, Category } from '@/lib/types';
import { translations } from '@/lib/translations';

const allSports: Sport[] = [
  'Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 'Gymnastics',
  'Volleyball', 'Rugby Sevens', 'Boxing', 'Judo', 'Cycling', 'Rowing',
  'Table Tennis', 'Badminton', 'Fencing', 'Weightlifting', 'Wrestling',
  'Taekwondo', 'Archery', 'Shooting', 'eSports', 'Others'
];

const categories: Category[] = ['Amateur', 'Semi-pro', 'Pro', 'Elite'];

export default function MarketPage() {
  const { state } = useStore();
  const t = translations[state.language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'new' | 'featured' | 'promoted' | 'fastGrowing'>('all');

  const filteredAthletes = useMemo(() => {
    return state.athletes.filter(athlete => {
      const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           athlete.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = selectedSport === 'All' || athlete.sport === selectedSport;
      const matchesCategory = selectedCategory === 'All' || athlete.category === selectedCategory;
      
      let matchesSegment = true;
      if (selectedSegment === 'new') matchesSegment = athlete.tags.includes('New');
      if (selectedSegment === 'featured') matchesSegment = athlete.tags.includes('Featured');
      if (selectedSegment === 'promoted') matchesSegment = athlete.tags.includes('Promoted');
      if (selectedSegment === 'fastGrowing') matchesSegment = athlete.tags.includes('Fast Growing');

      return matchesSearch && matchesSport && matchesCategory && matchesSegment;
    });
  }, [state.athletes, searchTerm, selectedSport, selectedCategory, selectedSegment]);

  const getCountryFlag = (nationality: string) => {
    const flags: Record<string, string> = {
      'Portugal': '🇵🇹', 'Japan': '🇯🇵', 'Spain': '🇪🇸', 'USA': '🇺🇸', 'Nigeria': '🇳🇬',
      'China': '🇨🇳', 'Sweden': '🇸🇪', 'Mexico': '🇲🇽', 'France': '🇫🇷', 'Ghana': '🇬🇭',
      'Poland': '🇵🇱', 'India': '🇮🇳', 'Italy': '🇮🇹', 'Ireland': '🇮🇪', 'South Korea': '🇰🇷',
      'UAE': '🇦🇪', 'Brazil': '🇧🇷', 'Malaysia': '🇲🇾', 'Russia': '🇷🇺', 'Canada': '🇨🇦'
    };
    return flags[nationality] || '🏳️';
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
    Others: t.sportOthers
  };
  const categoryLabels: Record<Category, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite
  };
  const tagLabels: Record<string, string> = {
    Featured: t.tagFeatured,
    'Fast Growing': t.tagFastGrowing,
    Promoted: t.tagPromoted,
    New: t.tagNew
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text">{t.athleteDirectory}</h1>

        {/* Filters */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t.searchAthletePlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Sport Filter */}
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value as Sport | 'All')}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              <option value="All">{t.allSports}</option>
              {allSports.map(sport => (
                <option key={sport} value={sport}>{sportLabels[sport]}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              <option value="All">{t.allCategories}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSport('All');
                setSelectedCategory('All');
                setSelectedSegment('all');
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <Filter size={20} />
              <span>{t.clearFilters}</span>
            </button>
          </div>
        </div>

        {/* Segments */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'all', label: t.segmentAllAthletes },
            { key: 'new', label: t.segmentNewAthletes },
            { key: 'featured', label: t.segmentFeatured },
            { key: 'promoted', label: t.segmentCategoryPromotions },
            { key: 'fastGrowing', label: t.segmentFastGrowing }
          ].map(segment => (
            <button
              key={segment.key}
              onClick={() => setSelectedSegment(segment.key as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedSegment === segment.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {segment.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          {t.showingLabel} {filteredAthletes.length} {filteredAthletes.length !== 1 ? t.athletePlural : t.athleteSingular}
        </div>

        {/* Athlete Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map(athlete => (
            <Link
              key={athlete.id}
              href={`/athlete/${athlete.symbol}`}
              className="glass-effect rounded-xl p-6 hover-glow transition"
            >
              {/* Image */}
              <div className="relative mb-4">
                <img
                  src={athlete.imageUrl}
                  alt={athlete.name}
                  className="w-full h-56 object-cover rounded-lg"
                />
                {/* Tags */}
                <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end">
                  {athlete.tags.map(tag => (
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
                  <span className={`badge badge-${athlete.category.toLowerCase().replace('-', '')}`}>
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
                    {athlete.currentPrice.toLocaleString()} pts
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-400">{t.indexDelta24hShort} </span>
                    <span className={athlete.price24hChange >= 0 ? 'price-up' : 'price-down'}>
                      {athlete.price24hChange >= 0 ? '+' : ''}{athlete.price24hChange.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">{t.indexDelta7dShort} </span>
                    <span className={athlete.price7dChange >= 0 ? 'price-up' : 'price-down'}>
                      {athlete.price7dChange >= 0 ? '+' : ''}{athlete.price7dChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-400">
                  {t.demoCreditsFlowShort} {athlete.tradingVolume.toLocaleString()} tATHLX • {athlete.holders} {t.participantsLower}
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="mt-3 h-12 flex items-end space-x-1">
                {athlete.priceHistory.slice(-10).map((point, i) => {
                  const maxPrice = Math.max(...athlete.priceHistory.slice(-10).map(p => p.price));
                  const height = (point.price / maxPrice) * 100;
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
          ))}
        </div>

        {filteredAthletes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">{t.noAthletesFound}</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSport('All');
                setSelectedCategory('All');
                setSelectedSegment('all');
              }}
              className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              {t.clearAllFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
