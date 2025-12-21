'use client';

import { useState } from 'react';
import AdminPasswordModal from './AdminPasswordModal';
import { useStore } from '@/lib/store';
import { translations } from '@/lib/translations';

export default function Footer() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { state } = useStore();
  const t = translations[state.language];

  return (
    <>
      <footer className="bg-slate-900 border-t border-blue-500/20 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-3">AthleteXchange</h3>
              <p className="text-gray-400 text-sm">
                {t.footerMission}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">{t.footerPlatform}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-blue-400 transition">{t.home}</a></li>
                <li><a href="/market" className="hover:text-blue-400 transition">{t.market}</a></li>
                <li><a href="/about" className="hover:text-blue-400 transition">{t.about}</a></li>
                <li><a href="/news" className="hover:text-blue-400 transition">{t.news}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">{t.footerResources}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/register-athlete" className="hover:text-blue-400 transition">{t.registerAthlete}</a></li>
                <li><a href="/my-page" className="hover:text-blue-400 transition">{t.myPage}</a></li>
                <li>
                  <button
                    onClick={() => setShowAdminModal(true)}
                    className="hover:text-blue-400 transition text-left"
                  >
                    {t.adminPanel}
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-500/20 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 AthleteXchange (ATHLX). {t.footerRights}</p>
            <p className="mt-1 text-red-300 font-semibold">{t.footerDisclaimer}</p>
          </div>
        </div>
      </footer>

      <AdminPasswordModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </>
  );
}
