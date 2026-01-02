'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import Link from 'next/link';
import { TrendingUp, Shield, Users, Rocket, ArrowRight, DollarSign, Heart, Target } from 'lucide-react';
import { translations } from '@/lib/translations';
import { formatNumber } from '@/lib/format';
import { getCurrentPseudoPrice, getPseudoSeries } from '@/lib/pricing/pseudoMarket';

export default function Home() {
  const { state } = useStore();
  const t = translations[state.language];
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
  const categoryLabels: Record<string, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite
  };

  const step24h = 300;
  const step7d = 900;
  const pricingBucket = Math.floor(Date.now() / (step24h * 1000));

  const calculateChange = (series: Array<{ price: number }>) => {
    if (series.length < 2) return 0;
    const first = series[0].price;
    const last = series[series.length - 1].price;
    return first ? ((last - first) / first) * 100 : 0;
  };

  const pricedAthletes = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return state.athletes.map((athlete) => {
      const currentPrice = getCurrentPseudoPrice(athlete.symbol, athlete.unitCost, now);
      const series24h = getPseudoSeries(athlete.symbol, athlete.unitCost, {
        from: dayStart,
        to: now,
        stepSec: step24h,
      });
      const series7d = getPseudoSeries(athlete.symbol, athlete.unitCost, {
        from: weekStart,
        to: now,
        stepSec: step7d,
      });

      return {
        ...athlete,
        pseudoPrice: currentPrice,
        pseudoChange24h: calculateChange(series24h),
        pseudoChange7d: calculateChange(series7d),
      };
    });
  }, [state.athletes, pricingBucket]);

  const newAthletes = pricedAthletes
    .filter(a => a.tags.includes('New'))
    .slice(0, 3);

  const fastGrowing = pricedAthletes
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
                <p>{t.heroSupportBulletOne}</p>
              </div>
              <div className="flex items-start space-x-2">
                <Shield className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                <p>{t.heroSupportBulletTwo}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{t.howItWorksTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: t.howItWorksStepOneTitle,
                description: t.howItWorksStepOneDescription,
                icon: Users
              },
              {
                step: 2,
                title: t.howItWorksStepTwoTitle,
                description: t.howItWorksStepTwoDescription,
                icon: Shield
              },
              {
                step: 3,
                title: t.howItWorksStepThreeTitle,
                description: t.howItWorksStepThreeDescription,
                icon: TrendingUp
              },
              {
                step: 4,
                title: t.howItWorksStepFourTitle,
                description: t.howItWorksStepFourDescription,
                icon: DollarSign
              }
            ].map((item) => (
              <div key={item.step} className="glass-effect rounded-xl p-6 hover-glow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
                  <item.icon size={24} />
                </div>
                <div className="text-sm font-semibold text-blue-400 mb-2">{t.stepLabel} {item.step}</div>
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
          <h2 className="text-4xl font-bold text-center mb-12">{t.whyAthlxTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-effect rounded-xl p-8 hover-glow">
              <Target className="text-purple-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">{t.whyAthlxCardOneTitle}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t.whyAthlxCardOneDescription}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-8 hover-glow">
              <Shield className="text-blue-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">{t.whyAthlxCardTwoTitle}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t.whyAthlxCardTwoDescription}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-8 hover-glow">
              <Heart className="text-red-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">{t.whyAthlxCardThreeTitle}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t.whyAthlxCardThreeDescription}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-8 hover-glow">
              <TrendingUp className="text-green-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold mb-4">{t.whyAthlxCardFourTitle}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t.whyAthlxCardFourDescription}
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
              <h2 className="text-3xl font-bold">{t.newAthletesTitle}</h2>
              <Link href="/market" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>{t.viewAll}</span>
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
                      <p className="text-sm text-gray-400">{athlete.symbol} • {sportLabels[athlete.sport]}</p>
                    </div>
                    <span className={`badge badge-${athlete.category.toLowerCase().replace('-', '')}`}>
                      {categoryLabels[athlete.category]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-400">{t.unitCostShort}</p>
                      <p className="text-lg font-bold price-display">{formatNumber(athlete.pseudoPrice)} tATHLX</p>
                    </div>
                    <div className={`text-lg font-bold ${athlete.pseudoChange24h >= 0 ? 'price-up' : 'price-down'}`}>
                      {t.indexDelta24hShort} {athlete.pseudoChange24h >= 0 ? '+' : ''}{athlete.pseudoChange24h.toFixed(1)}%
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
              <h2 className="text-3xl font-bold">{t.fastGrowingTitle}</h2>
              <Link href="/market" className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>{t.viewAll}</span>
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
                      <p className="text-sm text-gray-400">{athlete.symbol} • {sportLabels[athlete.sport]}</p>
                    </div>
                    <span className={`badge badge-${athlete.category.toLowerCase().replace('-', '')}`}>
                      {categoryLabels[athlete.category]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-400">{t.unitCostShort}</p>
                      <p className="text-lg font-bold price-display">{formatNumber(athlete.pseudoPrice)} tATHLX</p>
                    </div>
                    <div className={`text-lg font-bold ${athlete.pseudoChange7d >= 0 ? 'price-up' : 'price-down'}`}>
                      {t.indexDelta7dShort} {athlete.pseudoChange7d >= 0 ? '+' : ''}{athlete.pseudoChange7d.toFixed(1)}%
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
          <h2 className="text-4xl font-bold mb-6">{t.ctaTitle}</h2>
          <p className="text-xl text-gray-300 mb-8">
            {t.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/market"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition hover-glow"
            >
              {t.exploreDirectory}
            </Link>
            <Link
              href="/register-athlete"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition hover-glow"
            >
              {t.registerAthlete}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
