import React, { useState, useEffect, useRef } from 'react';
import { useNovel, MainTab } from '../../context/NovelContext';
import { AppTheme } from '../../types/novel';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  Feather,
  BookOpen,
  Compass,
  Share2,
  FolderKanban,
  Download,
  Upload,
  Palette,
  Check,
  Maximize,
  Minimize,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeProject,
    todayWords,
    isZenMode,
    theme,
    setTheme,
    exportStudioBackup,
    importStudioBackup,
  } = useNovel();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  if (isZenMode) return null;

  const navLinks: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'editor', label: 'Editor', icon: Feather },
    { id: 'bible', label: 'World Bible', icon: Compass },
    { id: 'preview', label: 'Pratinjau Buku', icon: BookOpen },
    { id: 'publish', label: 'Publikasi', icon: Share2 },
    { id: 'projects', label: 'Proyek', icon: FolderKanban },
  ];

  const themes: { id: AppTheme; label: string; color: string; border: string; fontNote?: string }[] = [
    { id: 'dark', label: 'Dark OLED', color: '#070709', border: '#f472b6' },
    { id: 'light', label: 'Putih Terang', color: '#ffffff', border: '#e2e8f0' },
    { id: 'light-teal', label: 'Light Teal', color: '#E6F4F1', border: '#0D9488' },
    { id: 'buttercream', label: 'Buttercream', color: '#FAF7EE', border: '#D97706' },
    { id: 'blush', label: 'Very Light Pink', color: '#FFF5F7', border: '#F43F5E' },
    { id: 'dark-maroon', label: 'Dark Maroon', color: '#1A070A', border: '#F43F5E', fontNote: 'Teks Kuning Lembut' },
    { id: 'dark-burgundy', label: 'Dark Burgundy', color: '#150619', border: '#E879F9', fontNote: 'Teks Kuning Lembut' },
    { id: 'dark-emerald', label: 'Dark Emerald', color: '#051610', border: '#34D399', fontNote: 'Teks Kuning Lembut' },
  ];

  const getThemeShortLabel = () => {
    switch (theme) {
      case 'dark':
        return 'OLED';
      case 'light':
        return 'Light';
      case 'light-teal':
        return 'Teal';
      case 'buttercream':
        return 'Butter';
      case 'blush':
        return 'Pink';
      case 'dark-maroon':
        return 'Maroon';
      case 'dark-burgundy':
        return 'Burgundy';
      case 'dark-emerald':
        return 'Emerald';
      default:
        return 'Tema';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importStudioBackup(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--app-header-bg)] backdrop-blur-md px-3 sm:px-5 lg:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Zone 1: Single text element Brand Zone - positioned near left corner */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--app-accent)] flex items-center justify-center shadow-sm">
              <Feather className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-base tracking-wider font-bold text-[var(--app-text)] whitespace-nowrap">
                SHANDWRIGHT
              </span>
              <span className="text-[10px] tracking-widest text-[var(--app-accent)] font-semibold -mt-1 uppercase">
                WRITING STUDIO
              </span>
            </div>
          </div>

          {activeProject && (
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
              <span className="text-[var(--app-text)] font-medium truncate max-w-[180px]">
                {activeProject.title}
              </span>
              <span>/</span>
              <span className="text-[var(--app-accent)] font-mono text-[11px]">{activeProject.genre}</span>
            </div>
          )}
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] border border-[var(--app-border)] shadow-sm'
                    : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--app-accent)]' : 'text-[var(--app-text-muted)]'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Theme Selector + PWA Install */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Words Count simple indicator (no forced target) */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs"
            title="Total kata sesi saat ini"
          >
            <Feather className="w-3 h-3 text-[var(--app-accent)]" />
            <span className="font-mono text-[var(--app-text)] font-semibold">{todayWords}</span>
            <span className="text-[10px] text-[var(--app-text-muted)] font-mono">kata</span>
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors"
              title="Pilih Tema Warna Aplikasi (8 Tema)"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              <span className="hidden sm:inline text-[11px] font-medium capitalize">
                {getThemeShortLabel()}
              </span>
            </button>

            {themeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setThemeDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-2 shadow-2xl space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-semibold text-[var(--app-text-muted)] tracking-wider">
                    Tema Warna Studio (8 Tema)
                  </div>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                        theme === t.id
                          ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-semibold'
                          : 'text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-left min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <div className="truncate">
                          <p className="truncate leading-tight">{t.label}</p>
                          {t.fontNote && (
                            <span className="text-[9px] text-[var(--app-text-muted)] font-mono block">
                              {t.fontNote}
                            </span>
                          )}
                        </div>
                      </div>
                      {theme === t.id && <Check className="w-3 h-3 text-[var(--app-accent)] shrink-0 ml-1.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Fullscreen App Web Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh (ESC)' : 'Layar Penuh Web (Fullscreen)'}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                <span className="hidden xl:inline text-[11px] font-medium">Exit Full</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)]" />
                <span className="hidden xl:inline text-[11px] font-medium">Fullscreen</span>
              </>
            )}
          </button>

          {/* Backup & Import Tools */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={exportStudioBackup}
              className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:bg-[var(--app-card-sub)] rounded-lg transition-colors"
              title="Cadangkan Semua Data (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:bg-[var(--app-card-sub)] rounded-lg transition-colors"
              title="Pulihkan Data Studio (Import JSON)"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* PWA Mobile Download Button (Always present) */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
