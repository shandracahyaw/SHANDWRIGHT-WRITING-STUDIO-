import React from 'react';
import { useNovel, MainTab } from '../../context/NovelContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Feather, BookOpen, Compass, Eye, Share2, FolderKanban, Target, Sparkles, Download, Upload } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeProject,
    todayWords,
    dailyGoal,
    isZenMode,
    setIsZenMode,
    exportStudioBackup,
    importStudioBackup,
  } = useNovel();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (isZenMode) return null;

  const goalPercent = Math.min(100, Math.round((todayWords / Math.max(1, dailyGoal)) * 100));

  const navLinks: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'editor', label: 'Editor Naskah', icon: Feather },
    { id: 'bible', label: 'World Bible', icon: Compass },
    { id: 'preview', label: 'Pratinjau Buku', icon: BookOpen },
    { id: 'publish', label: 'Publikasi', icon: Share2 },
    { id: 'projects', label: 'Proyek', icon: FolderKanban },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importStudioBackup(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#1b1c28] bg-[#070709]/95 backdrop-blur-md px-4 lg:px-7 py-2.5">
      <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
        {/* Zone 1: Single text element Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f472b6] to-[#ec4899] flex items-center justify-center shadow-[0_0_15px_rgba(244,114,182,0.3)]">
              <Feather className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-base tracking-wider font-bold text-white whitespace-nowrap">
                SHANDWRIGHT
              </span>
              <span className="text-[10px] tracking-widest text-[#f472b6] font-medium -mt-1 uppercase">
                Dark Novel Studio
              </span>
            </div>
          </div>

          {activeProject && (
            <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-[#1f2130] text-xs text-gray-400">
              <span className="text-gray-200 font-medium truncate max-w-[180px]">
                {activeProject.title}
              </span>
              <span className="text-gray-600">/</span>
              <span className="text-[#f472b6] text-[11px] font-mono">{activeProject.genre}</span>
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
                    ? 'bg-[#181926] text-[#f472b6] border border-[#2e3146] shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#12131c]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#f472b6]' : 'text-gray-500'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + PWA & Daily Tracker */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Daily Goal Counter Pill */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0e0f17] border border-[#1f2130] text-xs"
            title={`Target Hari Ini: ${todayWords} / ${dailyGoal} kata (${goalPercent}%)`}
          >
            <Target className="w-3.5 h-3.5 text-[#f472b6]" />
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-gray-200 font-semibold">{todayWords}</span>
              <span className="text-[10px] text-gray-500 font-mono">/{dailyGoal}w</span>
            </div>
            <div className="w-12 h-1.5 bg-[#1a1c28] rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-[#f472b6] to-[#fb7185] transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Backup / Export Dropdown / Buttons */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={exportStudioBackup}
              className="p-1.5 text-gray-400 hover:text-[#f472b6] hover:bg-[#161824] rounded-lg transition-colors"
              title="Cadangkan Semua Data Studio (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-[#f472b6] hover:bg-[#161824] rounded-lg transition-colors"
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

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
