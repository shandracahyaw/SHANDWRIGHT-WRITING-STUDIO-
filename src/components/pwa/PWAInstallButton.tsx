import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone PWA, optionally show a subtle installed checkmark or keep simple
  if (isInstalled) {
    return (
      <div
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[10px] text-[var(--app-accent)] font-medium"
        title="Shandwright PWA terpasang di perangkat ini"
      >
        <Check className="w-3 h-3 stroke-[2.5]" />
        <span>PWA Aktif</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-xl bg-[var(--app-accent)] px-3 py-1.5 text-xs font-semibold text-black hover:opacity-90 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
        title="Unduh & Pasang Shandwright ke Layar Utama (PWA Mobile Offline)"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Unduh PWA</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl text-[var(--app-text)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <h3 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[var(--app-accent)]" />
                Pasang Shandwright di HP / PC
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-[var(--app-text-muted)]">
              <div className="p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)]">
                <p className="font-semibold text-[var(--app-text)] mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  Pengguna Android (Chrome / Edge / Samsung):
                </p>
                <p>
                  1. Ketuk ikon menu titik tiga (<strong>⋮</strong>) di sudut kanan atas browser.<br />
                  2. Pilih <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)]">
                <p className="font-semibold text-[var(--app-text)] mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  Pengguna iPhone / iPad (Safari):
                </p>
                <p>
                  1. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.<br />
                  2. Gulir ke bawah dan ketuk <strong>"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)]">
                <p className="font-semibold text-[var(--app-text)] mb-1 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  Pengguna Laptop / Desktop:
                </p>
                <p>
                  Klik ikon instalasi (komputer dengan panah bawah) di bilah alamat URL browser (omnibox).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-[var(--app-accent)] py-2 text-xs font-semibold text-black hover:opacity-90 transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
