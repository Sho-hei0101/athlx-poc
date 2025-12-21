'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPasswordModal({ isOpen, onClose }: AdminPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Get admin PIN from environment variable or use fallback
  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PIN) {
      onClose();
      router.push('/admin');
      setPassword('');
      setError('');
    } else {
      setError('Incorrect PIN');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
        <button
          onClick={() => {
            onClose();
            setPassword('');
            setError('');
          }}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Admin Panel Access</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Admin PIN</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin PIN"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Access Admin Panel
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Contact repository owner to set NEXT_PUBLIC_ADMIN_PIN environment variable.
        </p>
      </div>
    </div>
  );
}
