'use client';

import { useStore } from '@/lib/store';
import { useState } from 'react';
import { translations } from '@/lib/translations';
import { NewsItem } from '@/lib/types';
import Link from 'next/link';
import { formatNumber } from '@/lib/format';

export default function NewsPage() {
  const { state } = useStore();
  const t = translations[state.language];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Transfer', 'Performance', 'Injury', 'Career', 'Others'];
  const filteredNews = state.news.filter(news => selectedCategory === 'All' || news.category === selectedCategory);

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Transfer': return 'bg-purple-500';
      case 'Performance': return 'bg-green-500';
      case 'Injury': return 'bg-red-500';
      case 'Career': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text">{t.newsTitle}</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {category === 'All' ? t.allCategories : t[`category${category}` as keyof typeof t]}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.map(news => (
            <div key={news.id} className="glass-effect rounded-xl p-6 hover-glow">
              <div className="flex items-center justify-between mb-4">
                <span className={`${getCategoryColor(news.category)} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                  {news.category}
                </span>
                <span className="text-gray-400 text-sm">{formatDate(news.date)}</span>
              </div>

              <h3 className="text-xl font-bold mb-3">{news.title}</h3>
              <p className="text-gray-300 mb-4">{news.summary}</p>

              {news.relatedAthleteSymbol && (
                <Link
                  href={`/athlete/${news.relatedAthleteSymbol}`}
                  className="inline-block text-blue-400 hover:text-blue-300 font-semibold text-sm"
                >
                  {t.viewAthleteProfile} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>{t.noNewsFound}</p>
          </div>
        )}
      </div>
    </div>
  );
}
