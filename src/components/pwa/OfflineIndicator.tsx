import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#14151f] border border-[#2e3146] px-3.5 py-2 text-xs font-medium text-[#f472b6] shadow-2xl backdrop-blur-md">
      <WifiOff className="w-4 h-4 text-[#fb7185] animate-pulse" />
      <span>Mode Offline — Seluruh data naskah &amp; World Bible tersimpan aman di perangkat lokal.</span>
    </div>
  );
};
