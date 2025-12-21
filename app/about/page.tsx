'use client';

import { useStore } from '@/lib/store';
import { Shield, Target, TrendingUp, Users, Award } from 'lucide-react';
import { translations } from '@/lib/translations';

export default function AboutPage() {
  const { state } = useStore();
  const t = translations[state.language];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 gradient-text text-center">
          {t.aboutTitle}
        </h1>

        <section className="mb-16">
          <div className="glass-effect rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center space-x-3">
              <Award className="text-blue-400" size={32} />
              <span>{t.aboutSubtitle}</span>
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>{t.aboutIntroOne}</p>
              <p>{t.aboutIntroTwo}</p>
              <p className="font-semibold text-lg mt-6 mb-4">{t.aboutHowItWorksTitle}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t.aboutHowItWorksStepOne}</li>
                <li>{t.aboutHowItWorksStepTwo}</li>
                <li>{t.aboutHowItWorksStepThree}</li>
                <li>
                  {t.aboutHowItWorksStepFour}
                  <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                    <li>{t.aboutLedgerOperations}</li>
                    <li>{t.aboutLedgerRewards}</li>
                    <li>{t.aboutLedgerSupport}</li>
                  </ul>
                </li>
              </ul>
              <p className="font-semibold text-red-300 text-lg mt-6">
                {t.aboutNoticeTitle}
              </p>
              <p>{t.aboutNoticeBody}</p>
            </div>
          </div>
        </section>

        {/* Purpose & Vision */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t.aboutPurposeTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Target className="text-purple-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {t.aboutPurposeCardOneTitle}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.aboutPurposeCardOneDescription}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Shield className="text-blue-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {t.aboutPurposeCardTwoTitle}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.aboutPurposeCardTwoDescription}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <Users className="text-red-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {t.aboutPurposeCardThreeTitle}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.aboutPurposeCardThreeDescription}
              </p>
            </div>

            <div className="glass-effect rounded-xl p-6 hover-glow">
              <TrendingUp className="text-green-400 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">
                {t.aboutPurposeCardFourTitle}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {t.aboutPurposeCardFourDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="glass-effect rounded-xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              {t.aboutCtaTitle}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t.aboutCtaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/market"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition hover-glow"
              >
                {t.exploreTestEnvironment}
              </a>
              <a
                href="/register-athlete"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition hover-glow"
              >
                {t.registerAthlete}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
