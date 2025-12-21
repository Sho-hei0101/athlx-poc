'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Menu, X, Globe, Wallet } from 'lucide-react';
import AuthModal from './AuthModal';
import { translations } from '@/lib/translations';

export default function Navigation() {
  const { state, logout, connectMetaMask, disconnectMetaMask, setLanguage } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const t = translations[state.language];

  const handleMetaMaskClick = () => {
    if (state.currentUser?.metaMaskAddress) {
      disconnectMetaMask();
    } else {
      if (state.currentUser) {
        connectMetaMask();
      } else {
        setAuthMode('login');
        setAuthModalOpen(true);
      }
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(state.language === 'EN' ? 'ES' : 'EN');
  };

  return (
    <>
      <nav className="bg-slate-900/95 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold gradient-text">AthleteXchange</span>
                <span className="badge bg-blue-600 text-white">ATHLX</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="hover:text-blue-400 transition">{t.home}</Link>
              <Link href="/market" className="hover:text-blue-400 transition">{t.market}</Link>
              <Link href="/about" className="hover:text-blue-400 transition">{t.about}</Link>
              <Link href="/news" className="hover:text-blue-400 transition">{t.news}</Link>
              {state.currentUser && (
                <Link href="/my-page" className="hover:text-blue-400 transition">{t.myPage}</Link>
              )}
            </div>

            {/* Right side items */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-blue-600/20 transition"
              >
                <Globe size={16} />
                <span className="font-semibold">{state.language}</span>
              </button>

              {/* ATHLX Balance */}
              {state.currentUser && (
                <div className="px-4 py-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                  <span className="text-sm text-blue-200">{t.balance}:</span>
                  <span className="ml-2 font-bold price-display text-white">
                    {state.currentUser.athlxBalance.toLocaleString()} ATHLX
                  </span>
                </div>
              )}

              {/* MetaMask */}
              <button
                onClick={handleMetaMaskClick}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition ${
                  state.currentUser?.metaMaskAddress
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                <Wallet size={18} />
                <span>
                  {state.currentUser?.metaMaskAddress
                    ? `${t.connected}: ${state.currentUser.metaMaskAddress}`
                    : t.connectMetaMask}
                </span>
              </button>

              {/* Auth */}
              {state.currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-blue-200">{state.currentUser.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                  >
                    {t.logout}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    {t.login}
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                  >
                    {t.signup}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-blue-600/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-blue-500/20">
            <div className="px-4 pt-2 pb-4 space-y-3">
              <Link href="/" className="block py-2 hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>
                {t.home}
              </Link>
              <Link href="/market" className="block py-2 hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>
                {t.market}
              </Link>
              <Link href="/about" className="block py-2 hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>
                {t.about}
              </Link>
              <Link href="/news" className="block py-2 hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>
                {t.news}
              </Link>
              {state.currentUser && (
                <Link href="/my-page" className="block py-2 hover:text-blue-400" onClick={() => setMobileMenuOpen(false)}>
                  {t.myPage}
                </Link>
              )}
              
              <div className="pt-3 border-t border-blue-500/20">
                <button
                  onClick={toggleLanguage}
                  className="w-full text-left py-2 hover:text-blue-400 flex items-center space-x-2"
                >
                  <Globe size={16} />
                  <span>Language: {state.language}</span>
                </button>
                
                {state.currentUser && (
                  <div className="py-2 text-sm">
                    {t.balance}: <span className="font-bold price-display">{state.currentUser.athlxBalance.toLocaleString()} ATHLX</span>
                  </div>
                )}
                
                <button
                  onClick={handleMetaMaskClick}
                  className={`w-full mt-2 px-4 py-2 rounded-lg font-semibold transition ${
                    state.currentUser?.metaMaskAddress
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {state.currentUser?.metaMaskAddress
                    ? `${t.connected}: ${state.currentUser.metaMaskAddress}`
                    : t.connectMetaMask}
                </button>

                {state.currentUser ? (
                  <>
                    <div className="py-2 text-sm text-blue-200 mt-2">
                      {state.currentUser.name}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                    >
                      {t.logout}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 mt-2">
                    <button
                      onClick={() => handleAuthClick('login')}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                    >
                      {t.login}
                    </button>
                    <button
                      onClick={() => handleAuthClick('signup')}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                    >
                      {t.signup}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
      />
    </>
  );
}
