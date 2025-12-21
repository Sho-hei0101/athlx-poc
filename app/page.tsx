'use client';

import { useStore } from '@/lib/store';
import Link from 'next/link';
import { TrendingUp, Shield, Users, Rocket, ArrowRight, DollarSign, Heart, Target } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function Home() {
  const { state } = useStore();
  const t = translations[state.language];

  const newAthletes = state.athletes
    .filter(a => a.tags.includes('New'))
    .slice(0, 3);

  const fastGrowing = state.athletes
    .filter(a => a.tags.includes('Fast Growing'))
    .slice(0, 3);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">{t.heroTitle}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t.heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/market"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition flex items-center space-x-2 hover-glow"
              >
                <TrendingUp size={24} />
                <span>{t.exploreMarket}</span>
              </Link>
              <Link
                href="/register-athlete"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition flex items-center space-x-2 hover-glow"
              >
                <Rocket size={24} />
                <span>{t.registerAthlete}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <Heart className="text-red-400 mt-1 flex-shrink-0" size={20} />
                <p>Fans participate in athlete support simulation, exploring new community models.</p>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                <p>Demo credits simulate support allocation and post-career assistance models.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: 'Athlete registers profile',
                description: 'Players submit basic info and career data for review.',
                icon: Users
              },
              {
                step: 2,
                title: 'Admin reviews and approves',
                description: 'Approved athletes appear in the Athlete Directory.',
                icon: Shield
              },
              {
                step: 3,
                title: 'Fans acquire or release units',
                description: 'Fans acquire and release Athlete Units with demo credits.',
                icon: TrendingUp
              },
              {
                step: 4,
                title: 'Demo fees simulate allocation',
                description: 'Demo fees are distributed across simulated support ledgers.',
                icon: DollarSign
              }
            ].map((item) => (
              <div key={item.step} className="glass-effect rounded-xl p-6 hover-glow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                  <item.icon size={24} />
                </div>
                <div className="text-sm font-semibold text-blue-400 mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ATHLX */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why ATHLX Exists</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-effect rounded-xl p-8 hover-glow">
              <Target className="text-purple-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">Early Career Support Model</h3>
              <p className="text-gray-300 leading-relaxed">
                This pilot explores support models for young athletes during critical early career stages, simulating allocation of demo resources to help test UX and community engagement.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-8 hover-glow">
              <Shield className="text-blue-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">Post-Career Support Simulation</h3>
              <p className="text-gray-300 leading-relaxed">
                The Post-Career Support Vault is a locked demo ledger that simulates long-term athlete support mechanisms. This tests allocation models for life after active sports careers.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-8 hover-glow">
              <Heart className="text-red-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">Community Participation</h3>
              <p className="text-gray-300 leading-relaxed">
                Fans participate in a test environment, using demo credits to simulate community-driven athlete support. This helps shape new models for fan-athlete connections.
              </p>
            </div>

            <div className="glass-effect rounded-xl p-8 hover-glow">
              <TrendingUp className="text-green-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">UX Testing & Innovation</h3>
              <p className="text-gray-300 leading-relaxed">
                This closed pilot tests innovative support allocation models. Participants help improve the platform through real usage and feedback in a safe, demo-only environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newly Listed Athletes */}
      {newAthletes.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Newly Listed Athletes</h2>
              <Link href="/market" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newAthletes.map((athlete) => (
                <Link
                  key={athlete.id}
                  href={`/athlete/${athlete.symbol}`}
                  className="glass-effect rounded-xl p-6 hover-glow"
                >
                  <img
                    src={athlete.imageUrl}
                    alt={athlete.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{athlete.name}</h3>
                      <p className="text-sm text-gray-400">{athlete.symbol} • {athlete.sport}</p>
                    </div>
                    <span className={`badge badge-${athlete.category.toLowerCase().replace('-', '')}`}>
                      {athlete.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-lg font-bold price-display">{athlete.currentPrice.toLocaleString()} tATHLX</p>
                    </div>
                    <div className={`text-lg font-bold ${athlete.price24hChange >= 0 ? 'price-up' : 'price-down'}`}>
                      {athlete.price24hChange >= 0 ? '+' : ''}{athlete.price24hChange.toFixed(1)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fast Growing Athletes */}
      {fastGrowing.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Fast Growing Athletes</h2>
              <Link href="/market" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fastGrowing.map((athlete) => (
                <Link
                  key={athlete.id}
                  href={`/athlete/${athlete.symbol}`}
                  className="glass-effect rounded-xl p-6 hover-glow"
                >
                  <img
                    src={athlete.imageUrl}
                    alt={athlete.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{athlete.name}</h3>
                      <p className="text-sm text-gray-400">{athlete.symbol} • {athlete.sport}</p>
                    </div>
                    <span className={`badge badge-${athlete.category.toLowerCase().replace('-', '')}`}>
                      {athlete.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-lg font-bold price-display">{athlete.currentPrice.toLocaleString()} tATHLX</p>
                    </div>
                    <div className="text-lg font-bold price-up">
                      +{athlete.price7dChange.toFixed(1)}% (7d)
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center glass-effect rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-6">Ready to Participate?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the pilot program and help test new athlete support models.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/market"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition hover-glow"
            >
              Explore Athlete Directory
            </Link>
            <Link
              href="/register-athlete"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition hover-glow"
            >
              Register as Athlete
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
