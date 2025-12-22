'use client';

import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { translations } from '@/lib/translations';
import { Category } from '@/lib/types';

export default function AdminPage() {
  const { state, approveAthlete, rejectAthlete, resetDemoData } = useStore();
  const t = translations[state.language];
  const [selectedPending, setSelectedPending] = useState<string | null>(null);
  const [finalCategory, setFinalCategory] = useState('Amateur');
  const [initialPrice, setInitialPrice] = useState(100);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [view, setView] = useState<'dashboard' | 'pending' | 'review'>('dashboard');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const pendingApplications = state.pendingAthletes.filter(p => p.status === 'pending');
  const approvedCount = state.pendingAthletes.filter(p => p.status === 'approved').length;
  const rejectedCount = state.pendingAthletes.filter(p => p.status === 'rejected').length;

  const categoryBreakdown = {
    Amateur: state.athletes.filter(a => a.category === 'Amateur').length,
    'Semi-pro': state.athletes.filter(a => a.category === 'Semi-pro').length,
    Pro: state.athletes.filter(a => a.category === 'Pro').length,
    Elite: state.athletes.filter(a => a.category === 'Elite').length
  };
  const categoryLabels: Record<Category, string> = {
    Amateur: t.amateur,
    'Semi-pro': t.semiPro,
    Pro: t.pro,
    Elite: t.elite
  };
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
  const genderLabels: Record<string, string> = {
    Male: t.genderMale,
    Female: t.genderFemale,
    Other: t.genderOther
  };

  const handleReview = (pendingId: string) => {
    const pending = pendingApplications.find(p => p.id === pendingId);
    if (pending) {
      const suggestedSymbol = pending.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 4);
      setTokenSymbol(suggestedSymbol);
      setFinalCategory(pending.requestedCategory);
      setSelectedPending(pendingId);
      setView('review');
    }
  };

  const handleApprove = () => {
    if (selectedPending && tokenSymbol && initialPrice > 0) {
      approveAthlete(selectedPending, finalCategory, initialPrice, tokenSymbol);
      setView('pending');
      setSelectedPending(null);
      setTokenSymbol('');
      setInitialPrice(100);
    }
  };

  const handleReject = () => {
    if (selectedPending && rejectionReason) {
      rejectAthlete(selectedPending, rejectionReason);
      setView('pending');
      setSelectedPending(null);
      setRejectionReason('');
    }
  };

  const handleReset = () => {
    setResetError('');
    setResetSuccess('');
    if (resetConfirm !== 'RESET') {
      setResetError(t.resetConfirmError);
      return;
    }
    try {
      resetDemoData();
      setResetSuccess(t.resetDemoDataSuccess);
      setResetConfirm('');
    } catch (error: any) {
      setResetError(error.message ?? t.adminOnly);
    }
  };

  const selectedApplication = pendingApplications.find(p => p.id === selectedPending);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text">{t.adminPanel}</h1>

        {/* View Selector */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setView('dashboard')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              view === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {t.adminDashboard}
          </button>
          <button
            onClick={() => setView('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition relative ${
              view === 'pending' || view === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {t.pendingApplications}
            {pendingApplications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {pendingApplications.length}
              </span>
            )}
          </button>
          <a
            href="/admin/match-update"
            className="px-6 py-3 rounded-lg font-semibold transition bg-slate-700 text-gray-300 hover:bg-slate-600"
          >
            {t.matchUpdateTitle}
          </a>
        </div>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="text-yellow-400" size={24} />
                  <h3 className="font-semibold">{t.pendingLabel}</h3>
                </div>
                <p className="text-4xl font-bold">{pendingApplications.length}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="font-semibold">{t.approvedLabel}</h3>
                </div>
                <p className="text-4xl font-bold">{approvedCount}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <XCircle className="text-red-400" size={24} />
                  <h3 className="font-semibold">{t.rejectedLabel}</h3>
                </div>
                <p className="text-4xl font-bold">{rejectedCount}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="text-blue-400" size={24} />
                  <h3 className="font-semibold">{t.totalAthletesLabel}</h3>
                </div>
                <p className="text-4xl font-bold">{state.athletes.length}</p>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">{t.athletesByCategory}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="bg-slate-700/50 rounded-lg p-4">
                    <span className={`badge badge-${category.toLowerCase().replace('-', '')}`}>{categoryLabels[category as Category]}</span>
                    <p className="text-3xl font-bold mt-2">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setView('pending')}
                className="glass-effect rounded-xl p-8 hover-glow text-left"
              >
                <h3 className="text-xl font-bold mb-2">{t.viewPendingApplications}</h3>
                <p className="text-gray-400">{pendingApplications.length} {t.applicationsAwaitingReview}</p>
              </button>
              <div className="glass-effect rounded-xl p-8">
                <h3 className="text-xl font-bold mb-2">{t.allAthletes}</h3>
                <p className="text-gray-400">{state.athletes.length} {t.athletesInDirectory}</p>
              </div>
            </div>

            {state.isAdmin && (
              <div className="glass-effect rounded-xl p-6">
                <h2 className="text-xl font-bold mb-2">{t.resetDemoData}</h2>
                <p className="text-sm text-gray-400 mb-4">{t.resetDemoDataWarning}</p>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={resetConfirm}
                    onChange={(event) => setResetConfirm(event.target.value)}
                    placeholder={t.resetConfirmPlaceholder}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
                  />
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                  >
                    {t.resetDemoData}
                  </button>
                </div>
                {resetError && (
                  <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200">
                    {resetError}
                  </div>
                )}
                {resetSuccess && (
                  <div className="mt-3 p-3 bg-green-500/20 border border-green-500 rounded-lg text-sm text-green-200">
                    {resetSuccess}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pending Applications View */}
        {view === 'pending' && (
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">{t.pendingAthleteApplications}</h2>
            {pendingApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4">{t.name}</th>
                      <th className="text-left py-3 px-4">{t.sportLabel}</th>
                      <th className="text-left py-3 px-4">{t.nationalityLabel}</th>
                      <th className="text-left py-3 px-4">{t.requestedCategory}</th>
                      <th className="text-left py-3 px-4">{t.submittedLabel}</th>
                      <th className="text-right py-3 px-4">{t.actionLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApplications.map(pending => (
                      <tr key={pending.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-semibold">{pending.name}</td>
                        <td className="py-3 px-4">{sportLabels[pending.sport]}</td>
                        <td className="py-3 px-4">{pending.nationality}</td>
                        <td className="py-3 px-4">
                          <span className={`badge badge-${pending.requestedCategory.toLowerCase().replace('-', '')}`}>
                            {categoryLabels[pending.requestedCategory as Category]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {new Date(pending.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleReview(pending.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                          >
                            {t.reviewLabel}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t.noPendingApplications}</p>
              </div>
            )}
          </div>
        )}

        {/* Review Application View */}
        {view === 'review' && selectedApplication && (
          <div className="space-y-6">
            <button
              onClick={() => setView('pending')}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              ← {t.backToPending}
            </button>

            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">{t.reviewApplication}: {selectedApplication.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">{t.personalInformation}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">{t.name}:</span> <span className="font-semibold">{selectedApplication.name}</span></p>
                    <p><span className="text-gray-400">{t.dateOfBirth}:</span> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                    <p><span className="text-gray-400">{t.genderLabel}:</span> {genderLabels[selectedApplication.gender] ?? selectedApplication.gender}</p>
                    <p><span className="text-gray-400">{t.nationalityLabel}:</span> {selectedApplication.nationality}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">{t.sportInformation}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">{t.sportLabel}:</span> <span className="font-semibold">{sportLabels[selectedApplication.sport]}</span></p>
                    <p><span className="text-gray-400">{t.teamLabel}:</span> {selectedApplication.team}</p>
                    <p><span className="text-gray-400">{t.positionLabel}:</span> {selectedApplication.position}</p>
                    <p>
                      <span className="text-gray-400">{t.requestedCategory}:</span>{' '}
                      <span className={`badge badge-${selectedApplication.requestedCategory.toLowerCase().replace('-', '')}`}>
                        {categoryLabels[selectedApplication.requestedCategory as Category]}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">{t.bioLabel}</h3>
                <p className="text-gray-300 text-sm bg-slate-700/50 rounded-lg p-4">{selectedApplication.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedApplication.profileUrl && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">{t.profileUrlLabel}</h3>
                    <a href={selectedApplication.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {selectedApplication.profileUrl}
                    </a>
                  </div>
                )}
                {selectedApplication.highlightVideoUrl && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">{t.highlightVideo}</h3>
                    <a href={selectedApplication.highlightVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {selectedApplication.highlightVideoUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Form */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">{t.setAthleteParameters}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.finalCategory}</label>
                  <select
                    value={finalCategory}
                    onChange={(e) => setFinalCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="Amateur">{t.amateur}</option>
                    <option value="Semi-pro">{t.semiPro}</option>
                    <option value="Pro">{t.pro}</option>
                    <option value="Elite">{t.elite}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.initialActivityIndex}</label>
                  <input
                    type="number"
                    min="1"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(parseInt(e.target.value) || 100)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.tokenSymbolLabel}</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={!tokenSymbol || initialPrice <= 0}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>{t.approveAndAddToDirectory}</span>
                </button>
              </div>
            </div>

            {/* Rejection Form */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">{t.rejectApplication}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t.rejectionReason}</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t.rejectionReasonPlaceholder}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition disabled:opacity-50 flex items-center space-x-2"
              >
                <XCircle size={20} />
                <span>{t.rejectApplication}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
