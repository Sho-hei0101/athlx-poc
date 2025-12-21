'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Athlete } from '@/lib/types';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { translations } from '@/lib/translations';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: Athlete;
  initialMode?: 'buy' | 'sell';
}

export default function TradeModal({ isOpen, onClose, athlete, initialMode = 'buy' }: TradeModalProps) {
  const { executeTrade, state } = useStore();
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const t = translations[state.language];

  if (!isOpen) return null;

  const subtotal = quantity * athlete.currentPrice;
  const fee = subtotal * 0.05;
  const total = mode === 'buy' ? subtotal + fee : subtotal - fee;

  const handleConfirm = () => {
    try {
      if (!state.currentUser) {
        setError('Please login first');
        return;
      }

      if (mode === 'buy' && state.currentUser.athlxBalance < total) {
        setError('Insufficient balance');
        return;
      }

      executeTrade(athlete.symbol, mode, quantity, athlete.currentPrice);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setQuantity(1);
        setError('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Trade {athlete.name} ({athlete.symbol})
        </h2>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('buy')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
              mode === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            <TrendingUp size={20} />
            <span>{t.buy}</span>
          </button>
          <button
            onClick={() => setMode('sell')}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
              mode === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            }`}
          >
            <TrendingDown size={20} />
            <span>{t.sell}</span>
          </button>
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition text-lg font-semibold"
          />
        </div>

        {/* Price Breakdown */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current Price:</span>
            <span className="font-bold price-display">{athlete.currentPrice.toLocaleString()} ATHLX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Quantity:</span>
            <span className="font-semibold">{quantity}</span>
          </div>
          <div className="border-t border-slate-600 pt-3 flex justify-between">
            <span className="text-gray-400">Subtotal:</span>
            <span className="font-bold price-display">{subtotal.toLocaleString()} ATHLX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Trading Fee (5%):</span>
            <span className="font-semibold text-orange-400 price-display">{fee.toLocaleString()} ATHLX</span>
          </div>
          <div className="border-t border-slate-600 pt-3 flex justify-between text-lg">
            <span className="font-bold">Total {mode === 'buy' ? 'Cost' : 'Received'}:</span>
            <span className={`font-bold price-display ${mode === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
              {total.toLocaleString()} ATHLX
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          A 5% trading fee is applied to every transaction. 2.5% goes directly to support the athlete, and the remainder supports platform operations and the Athlete Lifetime Support Vault.
        </p>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-sm text-green-200 mb-4">
            Trade executed successfully! You {mode === 'buy' ? 'bought' : 'sold'} {quantity} {athlete.symbol} for {total.toLocaleString()} ATHLX.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={success}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              mode === 'buy'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {t.confirm} {mode === 'buy' ? t.buy : t.sell}
          </button>
        </div>

        {state.currentUser && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Your Balance: <span className="font-bold price-display text-white">{state.currentUser.athlxBalance.toLocaleString()} ATHLX</span>
          </div>
        )}
      </div>
    </div>
  );
}
