'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { MatchHomeAway, MatchResult } from '@/lib/types';

export default function AthleteUpdatePage() {
  const { state, submitAthletePerformanceUpdate } = useStore();
  const t = translations[state.language];
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    matchDate: '',
    opponent: '',
    homeAway: 'Home' as MatchHomeAway,
    minutesPlayed: 90,
    result: 'Win' as MatchResult,
    goals: 0,
    assists: 0,
    injury: false,
    notes: ''
  });

  useEffect(() => {
    if (!state.currentUser) {
      window.location.replace('/');
    }
  }, [state.currentUser]);

  if (!state.currentUser) {
    return null;
  }

  const linkedAthlete = state.currentUser.linkedAthleteId
    ? state.athletes.find(athlete => athlete.id === state.currentUser?.linkedAthleteId)
    : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!linkedAthlete) return;

    submitAthletePerformanceUpdate({
      athleteSymbol: linkedAthlete.symbol,
      matchDate: formData.matchDate,
      opponent: formData.opponent,
      homeAway: formData.homeAway,
      minutesPlayed: Math.max(0, Math.min(90, Number(formData.minutesPlayed) || 0)),
      result: formData.result,
      goals: Math.max(0, Number(formData.goals) || 0),
      assists: Math.max(0, Number(formData.assists) || 0),
      injury: formData.injury,
      notes: formData.notes.trim()
    });
    setMessage(t.athleteUpdateSubmitted);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 gradient-text">{t.athleteUpdateTitle}</h1>
        <p className="text-gray-400 mb-8">{t.athleteUpdateSubtitle}</p>

        {!linkedAthlete ? (
          <div className="glass-effect rounded-xl p-8 text-center">
            <p className="text-gray-300">{t.noAthleteProfileLinkedDetail}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t.athleteLabel}</label>
              <div className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg">
                {linkedAthlete.name} ({linkedAthlete.symbol})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.matchDateLabel}</label>
                <input
                  type="date"
                  value={formData.matchDate}
                  onChange={(event) => setFormData(prev => ({ ...prev, matchDate: event.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.opponentLabel}</label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(event) => setFormData(prev => ({ ...prev, opponent: event.target.value }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.homeAwayLabel}</label>
                <select
                  value={formData.homeAway}
                  onChange={(event) => setFormData(prev => ({ ...prev, homeAway: event.target.value as MatchHomeAway }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                >
                  <option value="Home">{t.homeLabel}</option>
                  <option value="Away">{t.awayLabel}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.minutesPlayedLabel}</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={formData.minutesPlayed}
                  onChange={(event) => setFormData(prev => ({ ...prev, minutesPlayed: Number(event.target.value) }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.resultLabel}</label>
                <select
                  value={formData.result}
                  onChange={(event) => setFormData(prev => ({ ...prev, result: event.target.value as MatchResult }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                >
                  <option value="Win">{t.resultWin}</option>
                  <option value="Draw">{t.resultDraw}</option>
                  <option value="Loss">{t.resultLoss}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.goalsLabel}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.goals}
                  onChange={(event) => setFormData(prev => ({ ...prev, goals: Number(event.target.value) }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t.assistsLabel}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.assists}
                  onChange={(event) => setFormData(prev => ({ ...prev, assists: Number(event.target.value) }))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300 mt-6">
                <input
                  type="checkbox"
                  checked={formData.injury}
                  onChange={(event) => setFormData(prev => ({ ...prev, injury: event.target.checked }))}
                />
                <span>{t.injuryLabel}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.notesLabel}</label>
              <textarea
                value={formData.notes}
                onChange={(event) => setFormData(prev => ({ ...prev, notes: event.target.value }))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg min-h-[120px]"
                placeholder={t.notesPlaceholder}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              {t.submitAthleteUpdate}
            </button>

            {message && (
              <div className="p-3 bg-slate-700/60 rounded-lg text-sm text-gray-200">
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
