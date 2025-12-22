'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import {
  MatchCondition,
  MatchExpectedRole,
  MatchHomeAway,
  MatchImportance,
  MatchMinutesBucket,
  MatchResult
} from '@/lib/types';

export default function MatchUpdatePage() {
  const { state, submitMatchUpdate } = useStore();
  const t = translations[state.language];
  const [approved, setApproved] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState(state.athletes[0]?.symbol ?? '');
  const [nextMatch, setNextMatch] = useState({
    date: '',
    opponent: '',
    homeAway: 'Home' as MatchHomeAway,
    expectedRole: 'Starter' as MatchExpectedRole,
    condition: '100%' as MatchCondition,
    importance: 'League' as MatchImportance
  });
  const [lastMatch, setLastMatch] = useState({
    date: '',
    minutesBucket: '61-90' as MatchMinutesBucket,
    result: 'Win' as MatchResult,
    goals: '',
    assists: '',
    injury: false
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSymbol) return;

    const normalizedLastMatch = lastMatch.date
      ? {
          date: lastMatch.date,
          minutesBucket: lastMatch.minutesBucket,
          result: lastMatch.result,
          goals: lastMatch.goals ? Number(lastMatch.goals) : undefined,
          assists: lastMatch.assists ? Number(lastMatch.assists) : undefined,
          injury: lastMatch.injury
        }
      : undefined;

    const normalizedNextMatch = nextMatch.date
      ? {
          date: nextMatch.date,
          opponent: nextMatch.opponent,
          homeAway: nextMatch.homeAway,
          expectedRole: nextMatch.expectedRole,
          condition: nextMatch.condition,
          importance: nextMatch.importance
        }
      : undefined;

    submitMatchUpdate(selectedSymbol, normalizedNextMatch, normalizedLastMatch, approved);
    setMessage(approved ? t.matchUpdateApplied : t.matchUpdateQueued);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 gradient-text">{t.matchUpdateTitle}</h1>

        <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t.athleteLabel}</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
            >
              {state.athletes.map(athlete => (
                <option key={athlete.symbol} value={athlete.symbol}>
                  {athlete.name} ({athlete.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <h2 className="text-xl font-semibold mb-4">{t.nextMatch}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={nextMatch.date}
                onChange={(e) => setNextMatch({ ...nextMatch, date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <input
                type="text"
                placeholder={t.opponentLabel}
                value={nextMatch.opponent}
                onChange={(e) => setNextMatch({ ...nextMatch, opponent: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <select
                value={nextMatch.homeAway}
                onChange={(e) => setNextMatch({ ...nextMatch, homeAway: e.target.value as MatchHomeAway })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              >
                <option value="Home">{t.homeLabel}</option>
                <option value="Away">{t.awayLabel}</option>
              </select>
              <select
                value={nextMatch.expectedRole}
                onChange={(e) => setNextMatch({ ...nextMatch, expectedRole: e.target.value as MatchExpectedRole })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              >
                <option value="Starter">{t.roleStarter}</option>
                <option value="Bench">{t.roleBench}</option>
                <option value="Not in squad">{t.roleNotInSquad}</option>
              </select>
              <select
                value={nextMatch.condition}
                onChange={(e) => setNextMatch({ ...nextMatch, condition: e.target.value as MatchCondition })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              >
                <option value="100%">{t.conditionFull}</option>
                <option value="Minor">{t.conditionMinor}</option>
                <option value="Not 100%">{t.conditionNotFull}</option>
              </select>
              <select
                value={nextMatch.importance}
                onChange={(e) => setNextMatch({ ...nextMatch, importance: e.target.value as MatchImportance })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              >
                <option value="League">{t.importanceLeague}</option>
                <option value="Cup">{t.importanceCup}</option>
                <option value="Friendly">{t.importanceFriendly}</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <h2 className="text-xl font-semibold mb-4">{t.lastMatch}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={lastMatch.date}
                onChange={(e) => setLastMatch({ ...lastMatch, date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <select
                value={lastMatch.result}
                onChange={(e) => setLastMatch({ ...lastMatch, result: e.target.value as MatchResult })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              >
                <option value="Win">{t.resultWin}</option>
                <option value="Draw">{t.resultDraw}</option>
                <option value="Loss">{t.resultLoss}</option>
              </select>
              <select
                value={lastMatch.minutesBucket}
                onChange={(e) => setLastMatch({ ...lastMatch, minutesBucket: e.target.value as MatchMinutesBucket })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              >
                <option value="61-90">{t.minutesHigh}</option>
                <option value="31-60">{t.minutesMid}</option>
                <option value="1-30">{t.minutesLow}</option>
                <option value="0">{t.minutesNone}</option>
              </select>
              <input
                type="number"
                min="0"
                placeholder={t.goalsLabel}
                value={lastMatch.goals}
                onChange={(e) => setLastMatch({ ...lastMatch, goals: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <input
                type="number"
                min="0"
                placeholder={t.assistsLabel}
                value={lastMatch.assists}
                onChange={(e) => setLastMatch({ ...lastMatch, assists: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={lastMatch.injury}
                  onChange={(e) => setLastMatch({ ...lastMatch, injury: e.target.checked })}
                />
                <span>{t.injuryLabel}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
              />
              <span>{t.applyUpdateNow}</span>
            </label>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              {t.submitMatchUpdate}
            </button>
          </div>

          {message && (
            <div className="p-3 bg-slate-700/60 rounded-lg text-sm text-gray-200">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
