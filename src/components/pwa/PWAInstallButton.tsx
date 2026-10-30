import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-[#f472b6] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#ec4899] active:scale-95 transition-all shadow-[0_0_15px_rgba(244,114,182,0.25)] whitespace-nowrap shrink-0"
        title="Instal Shandwright ke Beranda (PWA Offline)"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instal App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-[#262837] bg-[#11131a] px-3 py-1.5 text-xs font-medium text-[#f472b6] hover:bg-[#1a1c26] transition-colors whitespace-nowrap shrink-0"
          title="Instal Shandwright di iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instal di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#2a2d3e] bg-[#0d0e14] p-6 shadow-2xl text-[#e2e8f0]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e202c]">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#f472b6]" />
                  Instal di iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e202c] text-[#f472b6] font-bold">1</span>
                  <p>Buka menu <strong>Share</strong> (ikon kotak dengan panah ke atas) di bilah bawah Safari.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e202c] text-[#f472b6] font-bold">2</span>
                  <p>Gulir ke bawah dan ketuk <strong>Add to Home Screen</strong> (Tambahkan ke Layar Utama).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e202c] text-[#f472b6] font-bold">3</span>
                  <p>Shandwright kini dapat diakses layaknya aplikasi asli tanpa koneksi internet.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#f472b6] py-2 text-xs font-semibold text-black hover:bg-[#ec4899] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
