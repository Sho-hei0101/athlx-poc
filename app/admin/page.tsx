'use client';

import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminPage() {
  const { state, approveAthlete, rejectAthlete } = useStore();
  const [selectedPending, setSelectedPending] = useState<string | null>(null);
  const [finalCategory, setFinalCategory] = useState('Amateur');
  const [initialPrice, setInitialPrice] = useState(100);
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [view, setView] = useState<'dashboard' | 'pending' | 'review'>('dashboard');

  const pendingApplications = state.pendingAthletes.filter(p => p.status === 'pending');
  const approvedCount = state.pendingAthletes.filter(p => p.status === 'approved').length;
  const rejectedCount = state.pendingAthletes.filter(p => p.status === 'rejected').length;

  const categoryBreakdown = {
    Amateur: state.athletes.filter(a => a.category === 'Amateur').length,
    'Semi-pro': state.athletes.filter(a => a.category === 'Semi-pro').length,
    Pro: state.athletes.filter(a => a.category === 'Pro').length,
    Elite: state.athletes.filter(a => a.category === 'Elite').length
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

  const selectedApplication = pendingApplications.find(p => p.id === selectedPending);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text">Admin Panel</h1>

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
            Dashboard
          </button>
          <button
            onClick={() => setView('pending')}
            className={`px-6 py-3 rounded-lg font-semibold transition relative ${
              view === 'pending' || view === 'review'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Pending Applications
            {pendingApplications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {pendingApplications.length}
              </span>
            )}
          </button>
        </div>

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="text-yellow-400" size={24} />
                  <h3 className="font-semibold">Pending</h3>
                </div>
                <p className="text-4xl font-bold">{pendingApplications.length}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="font-semibold">Approved</h3>
                </div>
                <p className="text-4xl font-bold">{approvedCount}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <XCircle className="text-red-400" size={24} />
                  <h3 className="font-semibold">Rejected</h3>
                </div>
                <p className="text-4xl font-bold">{rejectedCount}</p>
              </div>
              <div className="glass-effect rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="text-blue-400" size={24} />
                  <h3 className="font-semibold">Total Athletes</h3>
                </div>
                <p className="text-4xl font-bold">{state.athletes.length}</p>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Athletes by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="bg-slate-700/50 rounded-lg p-4">
                    <span className={`badge badge-${category.toLowerCase().replace('-', '')}`}>{category}</span>
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
                <h3 className="text-xl font-bold mb-2">View Pending Applications</h3>
                <p className="text-gray-400">{pendingApplications.length} applications awaiting review</p>
              </button>
              <div className="glass-effect rounded-xl p-8">
                <h3 className="text-xl font-bold mb-2">All Athletes</h3>
                <p className="text-gray-400">{state.athletes.length} athletes listed on the market</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Applications View */}
        {view === 'pending' && (
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Pending Athlete Applications</h2>
            {pendingApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Sport</th>
                      <th className="text-left py-3 px-4">Nationality</th>
                      <th className="text-left py-3 px-4">Requested Category</th>
                      <th className="text-left py-3 px-4">Submitted</th>
                      <th className="text-right py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApplications.map(pending => (
                      <tr key={pending.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-semibold">{pending.name}</td>
                        <td className="py-3 px-4">{pending.sport}</td>
                        <td className="py-3 px-4">{pending.nationality}</td>
                        <td className="py-3 px-4">
                          <span className={`badge badge-${pending.requestedCategory.toLowerCase().replace('-', '')}`}>
                            {pending.requestedCategory}
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
                            Review
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
                <p>No pending applications at the moment.</p>
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
              ← Back to Pending Applications
            </button>

            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Review Application: {selectedApplication.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Name:</span> <span className="font-semibold">{selectedApplication.name}</span></p>
                    <p><span className="text-gray-400">Date of Birth:</span> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                    <p><span className="text-gray-400">Gender:</span> {selectedApplication.gender}</p>
                    <p><span className="text-gray-400">Nationality:</span> {selectedApplication.nationality}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Sport Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Sport:</span> <span className="font-semibold">{selectedApplication.sport}</span></p>
                    <p><span className="text-gray-400">Team:</span> {selectedApplication.team}</p>
                    <p><span className="text-gray-400">Position:</span> {selectedApplication.position}</p>
                    <p>
                      <span className="text-gray-400">Requested Category:</span>{' '}
                      <span className={`badge badge-${selectedApplication.requestedCategory.toLowerCase().replace('-', '')}`}>
                        {selectedApplication.requestedCategory}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-gray-300 text-sm bg-slate-700/50 rounded-lg p-4">{selectedApplication.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedApplication.profileUrl && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">Profile URL</h3>
                    <a href={selectedApplication.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {selectedApplication.profileUrl}
                    </a>
                  </div>
                )}
                {selectedApplication.highlightVideoUrl && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">Highlight Video</h3>
                    <a href={selectedApplication.highlightVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm break-all">
                      {selectedApplication.highlightVideoUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Form */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Set Token Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Final Category</label>
                  <select
                    value={finalCategory}
                    onChange={(e) => setFinalCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    <option>Amateur</option>
                    <option>Semi-pro</option>
                    <option>Pro</option>
                    <option>Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Initial Price (ATHLX)</label>
                  <input
                    type="number"
                    min="1"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(parseInt(e.target.value) || 100)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Token Symbol (3-4 chars)</label>
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
                  <span>Approve and List on Market</span>
                </button>
              </div>
            </div>

            {/* Rejection Form */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Reject Application</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition disabled:opacity-50 flex items-center space-x-2"
              >
                <XCircle size={20} />
                <span>Reject Application</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
