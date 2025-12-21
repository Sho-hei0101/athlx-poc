'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Sport } from '@/lib/types';
import { CheckCircle } from 'lucide-react';
import { translations } from '@/lib/translations';

const sportsList: Sport[] = [
  'Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 'Gymnastics',
  'Volleyball', 'Rugby Sevens', 'Boxing', 'Judo', 'Cycling', 'Rowing',
  'Table Tennis', 'Badminton', 'Fencing', 'Weightlifting', 'Wrestling',
  'Taekwondo', 'Archery', 'Shooting', 'eSports', 'Others'
];

export default function RegisterAthletePage() {
  const { state, submitAthleteRegistration } = useStore();
  const t = translations[state.language];
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: '',
    sport: 'Football' as Sport,
    requestedCategory: 'Amateur' as any,
    team: '',
    position: '',
    bio: '',
    profileUrl: '',
    highlightVideoUrl: '',
    agreeTerms: false
  });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!state.currentUser) {
      setError(t.registerLoginFirst);
      return;
    }

    if (!formData.agreeTerms) {
      setError(t.termsAgreementRequired);
      return;
    }

    try {
      submitAthleteRegistration(formData);
      setSubmitted(true);
      setTimeout(() => {
        router.push('/my-page');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-12 text-center max-w-2xl animate-fade-in">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{t.applicationSubmittedTitle}</h2>
          <p className="text-xl text-gray-300 mb-6">
            {t.applicationSubmittedSubtitle}
          </p>
          <p className="text-gray-400">
            {t.applicationSubmittedNote}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text text-center">{t.registerAthlete}</h1>

        <div className="glass-effect rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t.basicInformation}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.fullName} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.dateOfBirth} *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.genderLabel} *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="Male">{t.genderMale}</option>
                    <option value="Female">{t.genderFemale}</option>
                    <option value="Other">{t.genderOther}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.nationalityLabel} *</label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </section>

            {/* Sport Info */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t.sportInformation}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.sportLabel} *</label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value as Sport })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    {sportsList.map(sport => (
                      <option key={sport} value={sport}>{sportLabels[sport]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.requestedCategory} *</label>
                  <select
                    value={formData.requestedCategory}
                    onChange={(e) => setFormData({ ...formData, requestedCategory: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="Amateur">{t.amateur}</option>
                    <option value="Semi-pro">{t.semiPro}</option>
                    <option value="Pro">{t.pro}</option>
                    <option value="Elite">{t.elite}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.teamLabel} *</label>
                  <input
                    type="text"
                    required
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.positionLabel} *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </section>

            {/* Profile */}
            <section>
              <h2 className="text-2xl font-bold mb-4">{t.profileLabel}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.shortBio} *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t.bioPlaceholder}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.profileUrlLabel}</label>
                  <input
                    type="url"
                    value={formData.profileUrl}
                    onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                    placeholder={t.profileUrlPlaceholder}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.highlightVideoLabel}</label>
                  <input
                    type="url"
                    value={formData.highlightVideoUrl}
                    onChange={(e) => setFormData({ ...formData, highlightVideoUrl: e.target.value })}
                    placeholder={t.highlightVideoPlaceholder}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </section>

            {/* Agreement */}
            <div className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                {t.termsAgreement}
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200">
                {error}
              </div>
            )}

            {!state.currentUser && (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-sm text-yellow-200">
                {t.registerLoginFirst}
              </div>
            )}

            <button
              type="submit"
              disabled={!state.currentUser}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition disabled:opacity-50"
            >
              {t.submitApplication}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
