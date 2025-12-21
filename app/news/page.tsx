'use client';

import { useStore } from '@/lib/store';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { Sport } from '@/lib/types';

const sportsList: (Sport | 'All')[] = ['All', 'Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 'Gymnastics', 'Others'];
const categories = ['All', 'Transfer', 'Performance', 'Injury', 'Career', 'Others'];

export default function NewsPage() {
  const { state } = useStore();
  const [selectedSport, setSelectedSport] = useState<Sport | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredNews = useMemo(() => {
    return state.news.filter(news => {
      const matchesSport = selectedSport === 'All' || news.sport === selectedSport;
      const matchesCategory = selectedCategory === 'All' || news.category === selectedCategory;
      return matchesSport && matchesCategory;
    });
  }, [state.news, selectedSport, selectedCategory]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text">Sports News</h1>

        {/* Filters */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value as Sport | 'All')}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              {sportsList.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSelectedSport('All');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNews.map(news => {
            const relatedAthlete = news.relatedAthleteSymbol 
              ? state.athletes.find(a => a.symbol === news.relatedAthleteSymbol)
              : null;

            return (
              <div key={news.id} className="glass-effect rounded-xl p-6 hover-glow">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="badge badge-new">{news.category}</span>
                  <span className="text-sm text-gray-400">{news.sport}</span>
                </div>

                <h3 className="text-2xl font-bold mb-3">{news.title}</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">{news.summary}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar size={16} />
                    <span>{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={news.readMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-semibold text-sm"
                  >
                    Read more →
                  </a>
                </div>

                {relatedAthlete && (
                  <div className="border-t border-slate-600 pt-4">
                    <Link href={`/athlete/${relatedAthlete.symbol}`} className="flex items-center space-x-4 hover:bg-slate-700/50 p-3 rounded-lg transition">
                      <img
                        src={relatedAthlete.imageUrl}
                        alt={relatedAthlete.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold">{relatedAthlete.name}</p>
                        <p className="text-sm text-gray-400">{relatedAthlete.symbol} • {relatedAthlete.sport}</p>
                        <p className="text-sm font-semibold price-display">{relatedAthlete.currentPrice.toLocaleString()} ATHLX</p>
                      </div>
                      <button className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition">
                        View Token
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No news found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
