import React from 'react';
import { useNovel, MainTab } from '../../context/NovelContext';
import { Feather, Compass, BookOpen, Share2, FolderKanban } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, isZenMode } = useNovel();

  if (isZenMode) return null;

  const items: { id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'editor', label: 'Editor', icon: Feather },
    { id: 'bible', label: 'World Bible', icon: Compass },
    { id: 'preview', label: 'Pratinjau', icon: BookOpen },
    { id: 'publish', label: 'Publikasi', icon: Share2 },
    { id: 'projects', label: 'Proyek', icon: FolderKanban },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-header-bg)] backdrop-blur-lg border-t border-[var(--app-border)] pb-safe transition-colors">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 text-center transition-transform active:scale-90"
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)]' : 'text-[var(--app-text-muted)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--app-accent)] stroke-[2.5]' : 'text-[var(--app-text-muted)]'}`} />
              </div>
              <span
                className={`text-[10px] font-medium leading-none tracking-tight ${
                  isActive ? 'text-[var(--app-accent)] font-semibold' : 'text-[var(--app-text-muted)]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
