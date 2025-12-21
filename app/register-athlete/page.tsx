'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Sport } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

const sportsList: Sport[] = [
  'Football', 'Basketball', 'Athletics', 'Swimming', 'Tennis', 'Gymnastics',
  'Volleyball', 'Rugby Sevens', 'Boxing', 'Judo', 'Cycling', 'Rowing',
  'Table Tennis', 'Badminton', 'Fencing', 'Weightlifting', 'Wrestling',
  'Taekwondo', 'Archery', 'Shooting', 'eSports', 'Others'
];

export default function RegisterAthletePage() {
  const { state, submitAthleteRegistration } = useStore();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!state.currentUser) {
      setError('Please login first to register as an athlete');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Please agree to the terms');
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
          <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
          <p className="text-xl text-gray-300 mb-6">
            Your athlete profile has been submitted and is awaiting admin approval.
          </p>
          <p className="text-gray-400">
            You will be notified once your application is reviewed. Redirecting to My Page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 gradient-text text-center">Register as Athlete</h1>

        <div className="glass-effect rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nationality *</label>
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
              <h2 className="text-2xl font-bold mb-4">Sport Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sport *</label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value as Sport })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    {sportsList.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Requested Category *</label>
                  <select
                    value={formData.requestedCategory}
                    onChange={(e) => setFormData({ ...formData, requestedCategory: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  >
                    <option>Amateur</option>
                    <option>Semi-pro</option>
                    <option>Pro</option>
                    <option>Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Team / Club *</label>
                  <input
                    type="text"
                    required
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Position / Specialty *</label>
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
              <h2 className="text-2xl font-bold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Short Bio *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about your athletic journey, achievements, and goals..."
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profile URL</label>
                  <input
                    type="url"
                    value={formData.profileUrl}
                    onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
                    placeholder="https://example.com/your-profile"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Highlight Video URL (YouTube)</label>
                  <input
                    type="url"
                    value={formData.highlightVideoUrl}
                    onChange={(e) => setFormData({ ...formData, highlightVideoUrl: e.target.value })}
                    placeholder="https://youtube.com/embed/..."
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
                I agree to the terms and understand this is a demo environment. I confirm that the information provided is accurate and I have the right to register on this platform.
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200">
                {error}
              </div>
            )}

            {!state.currentUser && (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-sm text-yellow-200">
                Please login first to submit your athlete registration.
              </div>
            )}

            <button
              type="submit"
              disabled={!state.currentUser}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition disabled:opacity-50"
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
