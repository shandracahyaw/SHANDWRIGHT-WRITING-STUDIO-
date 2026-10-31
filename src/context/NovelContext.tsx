import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Project,
  VolumeArc,
  Chapter,
  CharacterProfile,
  WorldSetting,
  ClueItem,
  MacroPlotBeat,
  VisualScene,
  TypesettingConfig,
  VersionSnapshot,
  AppTheme,
} from '../types/novel';
import {
  INITIAL_PROJECTS,
  INITIAL_ARCS,
  INITIAL_CHAPTERS,
  INITIAL_CHARACTERS,
  INITIAL_SETTINGS,
  INITIAL_CLUES,
  INITIAL_MACRO_BEATS,
  INITIAL_SCENES,
  INITIAL_SNAPSHOTS,
  DEFAULT_TYPESETTING,
} from '../utils/initialData';

export type MainTab = 'projects' | 'editor' | 'bible' | 'preview' | 'publish';
export type BibleSubTab = 'characters' | 'settings' | 'clues' | 'scenes';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface NovelContextType {
  // Navigation & View State
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  bibleSubTab: BibleSubTab;
  setBibleSubTab: (subTab: BibleSubTab) => void;
  isZenMode: boolean;
  setIsZenMode: (zen: boolean) => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;

  // In-app Confirm Modal
  confirmModal: ConfirmModalState | null;
  requestConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }) => void;
  closeConfirm: () => void;

  // Projects
  projects: Project[];
  activeProject: Project | undefined;
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  createProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Arcs / Volumes
  arcs: VolumeArc[];
  projectArcs: VolumeArc[];
  createArc: (data: Partial<VolumeArc>) => VolumeArc;
  updateArc: (id: string, updates: Partial<VolumeArc>) => void;
  deleteArc: (id: string) => void;

  // Chapters
  chapters: Chapter[];
  projectChapters: Chapter[];
  activeChapter: Chapter | undefined;
  activeChapterId: string;
  setActiveChapterId: (id: string) => void;
  createChapter: (arcId: string, title?: string, content?: string) => Chapter;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;

  // Word & Goal Tracker
  todayWords: number;
  dailyGoal: number;
  totalProjectWords: number;
  activeChapterWords: number;
  activeChapterChars: number;
  readingTimeMinutes: number;
  recordSessionWordDelta: (delta: number) => void;

  // World Bible: Characters
  characters: CharacterProfile[];
  projectCharacters: CharacterProfile[];
  createCharacter: (data: Partial<CharacterProfile>) => CharacterProfile;
  updateCharacter: (id: string, updates: Partial<CharacterProfile>) => void;
  deleteCharacter: (id: string) => void;

  // World Bible: Settings
  settings: WorldSetting[];
  projectSettings: WorldSetting[];
  createSetting: (data: Partial<WorldSetting>) => WorldSetting;
  updateSetting: (id: string, updates: Partial<WorldSetting>) => void;
  deleteSetting: (id: string) => void;

  // World Bible: Clues & Mystery
  clues: ClueItem[];
  projectClues: ClueItem[];
  createClue: (data: Partial<ClueItem>) => ClueItem;
  updateClue: (id: string, updates: Partial<ClueItem>) => void;
  deleteClue: (id: string) => void;

  // World Bible: Macro Beats
  macroBeats: MacroPlotBeat[];
  projectMacroBeats: MacroPlotBeat[];
  updateMacroBeat: (id: string, updates: Partial<MacroPlotBeat>) => void;

  // World Bible: Scenes
  scenes: VisualScene[];
  projectScenes: VisualScene[];
  createScene: (data: Partial<VisualScene>) => VisualScene;
  updateScene: (id: string, updates: Partial<VisualScene>) => void;
  deleteScene: (id: string) => void;

  // Version Snapshots (Time Machine)
  snapshots: VersionSnapshot[];
  chapterSnapshots: VersionSnapshot[];
  createSnapshot: (chapterId: string, note?: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;

  // Typesetting
  typesetting: TypesettingConfig;
  updateTypesetting: (updates: Partial<TypesettingConfig>) => void;

  // Backup & Import
  exportStudioBackup: () => void;
  importStudioBackup: (file: File) => Promise<boolean>;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const NovelContext = createContext<NovelContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`shandwright_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`shandwright_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const NovelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<MainTab>('editor');
  const [bibleSubTab, setBibleSubTab] = useState<BibleSubTab>('characters');
  const [isZenMode, setIsZenMode] = useState(false);

  // App Theme: 'dark' | 'light' | 'buttercream' | 'blush'
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('shandwright_theme');
      return (saved as AppTheme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyThemeToDOM = (activeTheme: AppTheme) => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    const isDarkVariant = ['dark', 'dark-maroon', 'dark-burgundy', 'dark-emerald'].includes(activeTheme);
    if (isDarkVariant) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const themeColors: Record<AppTheme, string> = {
      dark: '#070709',
      light: '#f8fafc',
      buttercream: '#FAF7EE',
      blush: '#FFF5F7',
      'light-teal': '#E6F4F1',
      'dark-maroon': '#1A070A',
      'dark-burgundy': '#150619',
      'dark-emerald': '#051610',
    };

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[activeTheme] || '#070709');
    }
  };

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('shandwright_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
    applyThemeToDOM(newTheme);
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Core Data
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', INITIAL_PROJECTS));
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('shandwright_active_project_id');
    return saved || 'proj-obsidian-throne';
  });

  const [arcs, setArcs] = useState<VolumeArc[]>(() => loadFromStorage('arcs', INITIAL_ARCS));
  const [chapters, setChapters] = useState<Chapter[]>(() => loadFromStorage('chapters', INITIAL_CHAPTERS));
  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    const saved = localStorage.getItem('shandwright_active_chapter_id');
    return saved || 'chap-1';
  });

  const [characters, setCharacters] = useState<CharacterProfile[]>(() => loadFromStorage('characters', INITIAL_CHARACTERS));
  const [settings, setSettings] = useState<WorldSetting[]>(() => loadFromStorage('settings', INITIAL_SETTINGS));
  const [clues, setClues] = useState<ClueItem[]>(() => loadFromStorage('clues', INITIAL_CLUES));
  const [macroBeats, setMacroBeats] = useState<MacroPlotBeat[]>(() => loadFromStorage('macro_beats', INITIAL_MACRO_BEATS));
  const [scenes, setScenes] = useState<VisualScene[]>(() => loadFromStorage('scenes', INITIAL_SCENES));
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>(() => loadFromStorage('snapshots', INITIAL_SNAPSHOTS));
  const [typesetting, setTypesetting] = useState<TypesettingConfig>(() => loadFromStorage('typesetting', DEFAULT_TYPESETTING));

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to local storage
  useEffect(() => saveToStorage('projects', projects), [projects]);
  useEffect(() => saveToStorage('arcs', arcs), [arcs]);
  useEffect(() => saveToStorage('chapters', chapters), [chapters]);
  useEffect(() => saveToStorage('characters', characters), [characters]);
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('clues', clues), [clues]);
  useEffect(() => saveToStorage('macro_beats', macroBeats), [macroBeats]);
  useEffect(() => saveToStorage('scenes', scenes), [scenes]);
  useEffect(() => saveToStorage('snapshots', snapshots), [snapshots]);
  useEffect(() => saveToStorage('typesetting', typesetting), [typesetting]);
  useEffect(() => {
    if (activeProjectId) localStorage.setItem('shandwright_active_project_id', activeProjectId);
  }, [activeProjectId]);
  useEffect(() => {
    if (activeChapterId) localStorage.setItem('shandwright_active_chapter_id', activeChapterId);
  }, [activeChapterId]);

  // Derived states
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  const projectArcs = useMemo(() => {
    return arcs.filter((a) => a.projectId === activeProject?.id).sort((a, b) => a.order - b.order);
  }, [arcs, activeProject?.id]);

  const projectChapters = useMemo(() => {
    return chapters
      .filter((c) => c.projectId === activeProject?.id)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [chapters, activeProject?.id]);

  const activeChapter = useMemo(() => {
    return (
      chapters.find((c) => c.id === activeChapterId && c.projectId === activeProject?.id) ||
      projectChapters[0]
    );
  }, [chapters, activeChapterId, activeProject?.id, projectChapters]);

  const projectCharacters = useMemo(() => {
    return characters.filter((c) => c.projectId === activeProject?.id);
  }, [characters, activeProject?.id]);

  const projectSettings = useMemo(() => {
    return settings.filter((s) => s.projectId === activeProject?.id);
  }, [settings, activeProject?.id]);

  const projectClues = useMemo(() => {
    return clues.filter((c) => c.projectId === activeProject?.id);
  }, [clues, activeProject?.id]);

  const projectMacroBeats = useMemo(() => {
    return macroBeats.filter((b) => b.projectId === activeProject?.id);
  }, [macroBeats, activeProject?.id]);

  const projectScenes = useMemo(() => {
    return scenes.filter((s) => s.projectId === activeProject?.id);
  }, [scenes, activeProject?.id]);

  const chapterSnapshots = useMemo(() => {
    return snapshots
      .filter((s) => s.chapterId === activeChapter?.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [snapshots, activeChapter?.id]);

  // Word Counters
  const totalProjectWords = useMemo(() => {
    return projectChapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  }, [projectChapters]);

  const activeChapterWords = useMemo(() => {
    return activeChapter?.wordCount || 0;
  }, [activeChapter]);

  const activeChapterChars = useMemo(() => {
    return activeChapter?.characterCount || 0;
  }, [activeChapter]);

  const readingTimeMinutes = useMemo(() => {
    // Average reading speed: 200 words per minute
    return Math.max(1, Math.ceil(activeChapterWords / 200));
  }, [activeChapterWords]);

  const todayWords = activeProject?.todayWordsWritten || 0;
  const dailyGoal = activeProject?.targetDailyWords || 1000;

  const recordSessionWordDelta = useCallback((delta: number) => {
    if (delta === 0) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const newToday = Math.max(0, (p.todayWordsWritten || 0) + delta);
        return {
          ...p,
          todayWordsWritten: newToday,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [activeProjectId]);

  // In-app Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  const requestConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      isDestructive?: boolean;
      onConfirm: () => void;
    }) => {
      setConfirmModal({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel || 'Hapus',
        cancelLabel: options.cancelLabel || 'Batal',
        isDestructive: options.isDestructive !== false,
        onConfirm: () => {
          options.onConfirm();
          setConfirmModal(null);
        },
      });
    },
    []
  );

  const closeConfirm = useCallback(() => {
    setConfirmModal(null);
  }, []);

  // Project CRUD
  const createProject = useCallback((data: Partial<Project>): Project => {
    const id = `proj-${Date.now()}`;
    const newProj: Project = {
      id,
      title: data.title || 'Proyek Baru',
      subtitle: data.subtitle || '',
      authorName: data.authorName || 'Penulis Shandwright',
      copyrightYear: data.copyrightYear || new Date().getFullYear().toString(),
      synopsis: data.synopsis || 'Draf sinopsis naskah baru...',
      category: data.category || 'standalone',
      seriesTitle: data.seriesTitle || '',
      seriesOrder: data.seriesOrder || 1,
      genre: data.genre || 'General Fiction',
      status: data.status || 'Idea',
      coverUrl: data.coverUrl || '/src/assets/images/sample_book_cover_1793354596229.jpg',
      targetDailyWords: data.targetDailyWords || 1000,
      todayWordsWritten: 0,
      lastSessionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);

    // Create default Arc 1 & Chapter 1 for this project
    const arcId = `arc-${Date.now()}`;
    const newArc: VolumeArc = {
      id: arcId,
      projectId: id,
      title: 'Arc I: Permulaan',
      order: 1,
      description: 'Bagian pembuka babak pertama.',
    };
    setArcs((prev) => [...prev, newArc]);

    const chapId = `chap-${Date.now()}`;
    const newChap: Chapter = {
      id: chapId,
      projectId: id,
      arcId: arcId,
      chapterNumber: 1,
      title: 'Bab 1: Permulaan',
      content: '',
      status: 'Idea',
      wordCount: 0,
      characterCount: 0,
      publishingStatus: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChapters((prev) => [...prev, newChap]);

    setActiveProjectId(id);
    setActiveChapterId(chapId);
    showToast(`Proyek "${newProj.title}" berhasil dibuat!`);
    return newProj;
  }, [showToast]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    showToast('Proyek berhasil diperbarui');
  }, [showToast]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activeProjectId === id) {
        const nextId = filtered.length > 0 ? filtered[0].id : '';
        setActiveProjectId(nextId);
        setChapters((chaps) => {
          const remainingChaps = chaps.filter((c) => c.projectId === nextId);
          setActiveChapterId(remainingChaps.length > 0 ? remainingChaps[0].id : '');
          return chaps;
        });
      }
      return filtered;
    });
    setArcs((prev) => prev.filter((a) => a.projectId !== id));
    setChapters((prev) => prev.filter((c) => c.projectId !== id));
    setCharacters((prev) => prev.filter((c) => c.projectId !== id));
    setSettings((prev) => prev.filter((s) => s.projectId !== id));
    setClues((prev) => prev.filter((c) => c.projectId !== id));
    setScenes((prev) => prev.filter((s) => s.projectId !== id));
    showToast('Proyek berhasil dihapus');
  }, [activeProjectId, showToast]);

  // Arcs CRUD
  const createArc = useCallback((data: Partial<VolumeArc>): VolumeArc => {
    const id = `arc-${Date.now()}`;
    const newArc: VolumeArc = {
      id,
      projectId: activeProjectId,
      title: data.title || `Arc ${projectArcs.length + 1}`,
      order: projectArcs.length + 1,
      description: data.description || '',
    };
    setArcs((prev) => [...prev, newArc]);
    showToast(`Arc "${newArc.title}" ditambahkan`);
    return newArc;
  }, [activeProjectId, projectArcs.length, showToast]);

  const updateArc = useCallback((id: string, updates: Partial<VolumeArc>) => {
    setArcs((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const deleteArc = useCallback((id: string) => {
    setArcs((prev) => prev.filter((a) => a.id !== id));
    setChapters((prev) => {
      const filtered = prev.filter((c) => c.arcId !== id);
      if (activeChapter && activeChapter.arcId === id) {
        const remaining = filtered.filter((c) => c.projectId === activeProjectId);
        setActiveChapterId(remaining.length > 0 ? remaining[0].id : '');
      }
      return filtered;
    });
    showToast('Volume/Arc berhasil dihapus');
  }, [activeChapter, activeProjectId, showToast]);

  // Chapter CRUD
  const createChapter = useCallback(
    (arcId: string, title?: string, content: string = ''): Chapter => {
      const id = `chap-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const nextNum = projectChapters.length + 1;
      const cleanContent = content || '';
      const words = cleanContent.trim() ? cleanContent.trim().split(/\s+/).length : 0;
      const chars = cleanContent.length;

      const newChap: Chapter = {
        id,
        projectId: activeProjectId,
        arcId,
        chapterNumber: nextNum,
        title: title || `Bab ${nextNum}: Draf Baru`,
        content: cleanContent,
        status: cleanContent.length > 0 ? 'On Progress' : 'Idea',
        wordCount: words,
        characterCount: chars,
        publishingStatus: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setChapters((prev) => [...prev, newChap]);
      setActiveChapterId(id);
      showToast(`Bab "${newChap.title}" dibuat`);
      return newChap;
    },
    [activeProjectId, projectChapters.length, showToast]
  );

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextContent = updates.content !== undefined ? updates.content : c.content;
        const words = nextContent.trim() ? nextContent.trim().split(/\s+/).length : 0;
        const chars = nextContent.length;

        return {
          ...c,
          ...updates,
          wordCount: words,
          characterCount: chars,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setChapters((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeChapterId === id) {
        const remainingForProject = filtered.filter((c) => c.projectId === activeProjectId);
        setActiveChapterId(remainingForProject.length > 0 ? remainingForProject[0].id : '');
      }
      return filtered;
    });
    showToast('Bab berhasil dihapus');
  }, [activeChapterId, activeProjectId, showToast]);

  // Characters
  const createCharacter = useCallback((data: Partial<CharacterProfile>): CharacterProfile => {
    const id = `char-${Date.now()}`;
    const newChar: CharacterProfile = {
      id,
      projectId: activeProjectId,
      name: data.name || 'Tokoh Baru',
      alias: data.alias || '',
      role: data.role || 'Morally Gray',
      darkMotivation: data.darkMotivation || '',
      traumaAndFatalFlaw: data.traumaAndFatalFlaw || '',
      faction: data.faction || '',
      aliveStatus: data.aliveStatus || 'Alive',
      relationships: data.relationships || [],
      secretNotes: data.secretNotes || '',
      imageUrl: data.imageUrl || '',
    };
    setCharacters((prev) => [...prev, newChar]);
    showToast(`Karakter "${newChar.name}" ditambahkan`);
    return newChar;
  }, [activeProjectId, showToast]);

  const updateCharacter = useCallback((id: string, updates: Partial<CharacterProfile>) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Profil karakter diperbarui');
  }, [showToast]);

  const deleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    showToast('Karakter dihapus');
  }, [showToast]);

  // Settings
  const createSetting = useCallback((data: Partial<WorldSetting>): WorldSetting => {
    const id = `set-${Date.now()}`;
    const newSetting: WorldSetting = {
      id,
      projectId: activeProjectId,
      name: data.name || 'Lokasi Baru',
      realmType: data.realmType || 'Gothic Citadel',
      atmosphereAndClimate: data.atmosphereAndClimate || '',
      cruelMoralLaws: data.cruelMoralLaws || '',
      magicOrTechRules: data.magicOrTechRules || '',
      rulingFactions: data.rulingFactions || '',
      imageUrl: data.imageUrl || '',
      notes: data.notes || '',
    };
    setSettings((prev) => [...prev, newSetting]);
    showToast(`Setting "${newSetting.name}" ditambahkan`);
    return newSetting;
  }, [activeProjectId, showToast]);

  const updateSetting = useCallback((id: string, updates: Partial<WorldSetting>) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Latar dunia diperbarui');
  }, [showToast]);

  const deleteSetting = useCallback((id: string) => {
    setSettings((prev) => prev.filter((s) => s.id !== id));
    showToast('Latar dihapus');
  }, [showToast]);

  // Clues
  const createClue = useCallback((data: Partial<ClueItem>): ClueItem => {
    const id = `clue-${Date.now()}`;
    const newClue: ClueItem = {
      id,
      projectId: activeProjectId,
      title: data.title || 'Petunjuk Baru',
      type: data.type || 'clue',
      status: data.status || 'Planted',
      chapterPlanted: data.chapterPlanted || '',
      chapterPayoff: data.chapterPayoff || '',
      revelationNotes: data.revelationNotes || '',
      relatedCharacter: data.relatedCharacter || '',
    };
    setClues((prev) => [...prev, newClue]);
    showToast('Petunjuk misteri ditambahkan');
    return newClue;
  }, [activeProjectId, showToast]);

  const updateClue = useCallback((id: string, updates: Partial<ClueItem>) => {
    setClues((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Papan misteri diperbarui');
  }, [showToast]);

  const deleteClue = useCallback((id: string) => {
    setClues((prev) => prev.filter((c) => c.id !== id));
    showToast('Petunjuk dihapus');
  }, [showToast]);

  // Macro Beats
  const updateMacroBeat = useCallback((id: string, updates: Partial<MacroPlotBeat>) => {
    setMacroBeats((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    showToast('Tahapan alur makro diperbarui');
  }, [showToast]);

  // Scenes
  const createScene = useCallback((data: Partial<VisualScene>): VisualScene => {
    const id = `scene-${Date.now()}`;
    const newScene: VisualScene = {
      id,
      projectId: activeProjectId,
      title: data.title || 'Adegan Baru',
      chapterRef: data.chapterRef || '',
      moodAndAtmosphere: data.moodAndAtmosphere || '',
      lightingAndWeather: data.lightingAndWeather || '',
      tensionLevel: data.tensionLevel || 'Mencekam',
      imageUrl: data.imageUrl || '',
      notes: data.notes || '',
    };
    setScenes((prev) => [...prev, newScene]);
    showToast('Visual Scene ditambahkan');
    return newScene;
  }, [activeProjectId, showToast]);

  const updateScene = useCallback((id: string, updates: Partial<VisualScene>) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Papan adegan diperbarui');
  }, [showToast]);

  const deleteScene = useCallback((id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
    showToast('Adegan dihapus');
  }, [showToast]);

  // Snapshots (Time Machine)
  const createSnapshot = useCallback((chapterId: string, note?: string) => {
    const chap = chapters.find((c) => c.id === chapterId);
    if (!chap || !chap.content.trim()) {
      showToast('Naskah kosong, snapshot tidak dibuat', 'info');
      return;
    }
    const id = `snap-${Date.now()}`;
    const newSnap: VersionSnapshot = {
      id,
      chapterId,
      timestamp: new Date().toISOString(),
      wordCount: chap.wordCount,
      note: note || `Snapshot otomatis (${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`,
      content: chap.content,
    };
    setSnapshots((prev) => [newSnap, ...prev]);
    showToast('Riwayat versi (snapshot) berhasil disimpan!');
  }, [chapters, showToast]);

  const restoreSnapshot = useCallback((snapshotId: string) => {
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return;
    updateChapter(snap.chapterId, { content: snap.content });
    showToast(`Naskah dikembalikan ke versi ${new Date(snap.timestamp).toLocaleString('id-ID')}`);
  }, [snapshots, updateChapter, showToast]);

  const deleteSnapshot = useCallback((snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
    showToast('Snapshot dihapus');
  }, [showToast]);

  // Typesetting
  const updateTypesetting = useCallback((updates: Partial<TypesettingConfig>) => {
    setTypesetting((prev) => ({ ...prev, ...updates }));
  }, []);

  // Studio Backup & Restore
  const exportStudioBackup = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects,
      arcs,
      chapters,
      characters,
      settings,
      clues,
      macroBeats,
      scenes,
      snapshots,
      typesetting,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shandwright_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cadangan data studio berhasil diunduh!');
  }, [projects, arcs, chapters, characters, settings, clues, macroBeats, scenes, snapshots, typesetting, showToast]);

  const importStudioBackup = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.projects && Array.isArray(parsed.projects)) setProjects(parsed.projects);
      if (parsed.arcs && Array.isArray(parsed.arcs)) setArcs(parsed.arcs);
      if (parsed.chapters && Array.isArray(parsed.chapters)) setChapters(parsed.chapters);
      if (parsed.characters && Array.isArray(parsed.characters)) setCharacters(parsed.characters);
      if (parsed.settings && Array.isArray(parsed.settings)) setSettings(parsed.settings);
      if (parsed.clues && Array.isArray(parsed.clues)) setClues(parsed.clues);
      if (parsed.macroBeats && Array.isArray(parsed.macroBeats)) setMacroBeats(parsed.macroBeats);
      if (parsed.scenes && Array.isArray(parsed.scenes)) setScenes(parsed.scenes);
      if (parsed.snapshots && Array.isArray(parsed.snapshots)) setSnapshots(parsed.snapshots);
      if (parsed.typesetting) setTypesetting(parsed.typesetting);

      showToast('Cadangan data studio berhasil dipulihkan!');
      return true;
    } catch (err) {
      console.error('Import backup failed:', err);
      showToast('Gagal memulihkan file cadangan: Format JSON tidak valid', 'error');
      return false;
    }
  }, [showToast]);

  return (
    <NovelContext.Provider
      value={{
        activeTab,
        setActiveTab,
        bibleSubTab,
        setBibleSubTab,
        isZenMode,
        setIsZenMode,
        theme,
        setTheme,

        confirmModal,
        requestConfirm,
        closeConfirm,

        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        createProject,
        updateProject,
        deleteProject,

        arcs,
        projectArcs,
        createArc,
        updateArc,
        deleteArc,

        chapters,
        projectChapters,
        activeChapter,
        activeChapterId,
        setActiveChapterId,
        createChapter,
        updateChapter,
        deleteChapter,

        todayWords,
        dailyGoal,
        totalProjectWords,
        activeChapterWords,
        activeChapterChars,
        readingTimeMinutes,
        recordSessionWordDelta,

        characters,
        projectCharacters,
        createCharacter,
        updateCharacter,
        deleteCharacter,

        settings,
        projectSettings,
        createSetting,
        updateSetting,
        deleteSetting,

        clues,
        projectClues,
        createClue,
        updateClue,
        deleteClue,

        macroBeats,
        projectMacroBeats,
        updateMacroBeat,

        scenes,
        projectScenes,
        createScene,
        updateScene,
        deleteScene,

        snapshots,
        chapterSnapshots,
        createSnapshot,
        restoreSnapshot,
        deleteSnapshot,

        typesetting,
        updateTypesetting,

        exportStudioBackup,
        importStudioBackup,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};

export const useNovel = () => {
  const context = useContext(NovelContext);
  if (!context) {
    throw new Error('useNovel must be used within a NovelProvider');
  }
  return context;
};
