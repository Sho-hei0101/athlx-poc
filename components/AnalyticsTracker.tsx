'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { logEvent } from '@/lib/analytics';

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    logEvent('page_view', { meta: { path: pathname } });
  }, [pathname]);

  return null;
};

export default AnalyticsTracker;
