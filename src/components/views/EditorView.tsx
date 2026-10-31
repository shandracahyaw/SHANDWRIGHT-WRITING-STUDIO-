import React, { useState, useEffect, useRef } from 'react';
import { useNovel } from '../../context/NovelContext';
import { exportChapterToDocx, parseDocxFile } from '../../utils/docxHelper';
import { DarkGenre } from '../../types/novel';
import {
  Feather,
  Plus,
  Trash2,
  Edit3,
  FileDown,
  History,
  Maximize2,
  Minimize2,
  Upload,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter,
  Copy,
  ClipboardPaste,
  Layers,
  RotateCcw,
  Clock,
  Sliders,
  X,
  FileText,
  Check,
  BookOpen,
  BookMarked,
  Baseline,
  Eye,
  Sparkles,
} from 'lucide-react';

const TEXT_COLORS = [
  { name: 'Warna Tema (Default)', value: 'inherit' },
  { name: 'Merah Crimson', value: '#ef4444' },
  { name: 'Pink Mawar', value: '#f472b6' },
  { name: 'Emas Amber', value: '#f59e0b' },
  { name: 'Hijau Zamrud', value: '#10b981' },
  { name: 'Biru Samudra', value: '#3b82f6' },
  { name: 'Ungu Violet', value: '#8b5cf6' },
  { name: 'Jingga Sunset', value: '#f97316' },
  { name: 'Cyan Es', value: '#06b6d4' },
  { name: 'Abu Lembut', value: '#94a3b8' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Kuning Terang', value: '#fef08a' },
  { name: 'Pink Pastel', value: '#fbcfe8' },
  { name: 'Mint Segar', value: '#a7f3d0' },
  { name: 'Biru Langit', value: '#bae6fd' },
  { name: 'Ungu Lavender', value: '#e9d5ff' },
  { name: 'Oranye Peach', value: '#fed7aa' },
  { name: 'Merah Karang', value: '#fecdd3' },
  { name: 'Lime Cerah', value: '#d9f99d' },
  { name: 'Cyan Ice', value: '#cffafe' },
  { name: 'Abu Halus', value: '#e2e8f0' },
];

export const EditorView: React.FC = () => {
  const {
    activeProject,
    updateProject,
    projectArcs,
    projectChapters,
    activeChapter,
    activeChapterId,
    setActiveChapterId,
    createArc,
    deleteArc,
    createChapter,
    updateChapter,
    deleteChapter,
    typesetting,
    updateTypesetting,
    chapterSnapshots,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    isZenMode,
    setIsZenMode,
    createProject,
    setActiveProjectId,
    recordSessionWordDelta,
    showToast,
    requestConfirm,
  } = useNovel();

  // Mode Baca (Reader Mode) state for preview reading in editor
  const [isReaderMode, setIsReaderMode] = useState(false);

  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [showTypesetPanel, setShowTypesetPanel] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [textColorMenuPos, setTextColorMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [highlightMenuPos, setHighlightMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Cover Preview & Details Modal
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverAuthor, setCoverAuthor] = useState('');
  const [coverCopyright, setCoverCopyright] = useState('');
  const [coverGenre, setCoverGenre] = useState<DarkGenre>('General Fiction');
  const [coverSubGenre, setCoverSubGenre] = useState('');
  const [coverSynopsis, setCoverSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // New Story Quick Modal directly in Editor tab
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newStoryForm, setNewStoryForm] = useState({
    title: '',
    genre: 'General Fiction' as DarkGenre,
    subGenre: '',
    synopsis: '',
    authorName: 'Shandra Cahya',
    copyrightYear: new Date().getFullYear().toString(),
  });

  const [snapshotNote, setSnapshotNote] = useState('');
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const prevChapterIdRef = useRef<string | null>(null);
  const prevWordCountRef = useRef(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotTimerRef = useRef<NodeJS.Timeout | null>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  // Sync content when activeChapter changes without wiping existing drafts
  useEffect(() => {
    if (activeChapter) {
      setTitle(activeChapter.title || '');
      const initialHtml = activeChapter.content || '';
      if (editorRef.current) {
        const isNewChapter = prevChapterIdRef.current !== activeChapter.id;
        const currentInner = editorRef.current.innerHTML;
        const isEditorBlank = !editorRef.current.innerText?.trim() || currentInner === '<p><br></p>' || currentInner === '';

        // Only populate if it's a different chapter or if editor is genuinely blank
        if (isNewChapter || isEditorBlank) {
          if (!initialHtml.includes('<p>') && !initialHtml.includes('<div>') && initialHtml.includes('\n')) {
            editorRef.current.innerHTML = initialHtml
              .split(/\n\s*\n/)
              .map((p) => `<p>${p.trim()}</p>`)
              .join('');
          } else {
            editorRef.current.innerHTML = initialHtml || '<p><br></p>';
          }
          prevChapterIdRef.current = activeChapter.id;
        }
        updateCounts();
      }
    } else {
      setTitle('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      setWordCount(0);
      setCharCount(0);
      prevChapterIdRef.current = null;
    }
  }, [activeChapterId, activeChapter?.id, isReaderMode]);

  // Handle ESC for Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, setIsZenMode]);

  // Update real-time word and character counts
  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const cleanText = text.replace(/\u200B/g, '').trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const chars = cleanText.length;
    setWordCount(words);
    setCharCount(chars);

    const delta = words - prevWordCountRef.current;
    if (delta > 0) {
      recordSessionWordDelta(delta);
    }
    prevWordCountRef.current = words;
  };

  // Handle editor input & auto-save
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    updateCounts();

    const currentHtml = editorRef.current.innerHTML;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (activeChapter) {
        updateChapter(activeChapter.id, {
          content: currentHtml,
          title: title,
        });
      }
    }, 700);

    // Periodic auto-snapshot
    if (!snapshotTimerRef.current && activeChapter) {
      snapshotTimerRef.current = setTimeout(() => {
        createSnapshot(activeChapter.id, 'Auto-save Time Machine');
        snapshotTimerRef.current = null;
      }, 15 * 60 * 1000);
    }
  };

  // Safe toggle between Reader Mode and Write Mode without losing plot/text
  const handleToggleReaderMode = (targetMode?: boolean) => {
    const nextMode = targetMode !== undefined ? targetMode : !isReaderMode;

    if (nextMode) {
      // Switching into Reader Mode:
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      // Immediately flush current editor HTML and title into novel state
      if (editorRef.current && activeChapter) {
        const currentHtml = editorRef.current.innerHTML;
        updateChapter(activeChapter.id, {
          content: currentHtml,
          title: title,
        });
      }
      setIsReaderMode(true);
    } else {
      // Switching back to Write Mode:
      setIsReaderMode(false);
      // Ensure editor content is intact and focus it
      setTimeout(() => {
        if (editorRef.current && activeChapter) {
          const currentText = editorRef.current.innerText?.trim();
          if (!currentText || editorRef.current.innerHTML === '<p><br></p>') {
            const initialHtml = activeChapter.content || '<p><br></p>';
            if (!initialHtml.includes('<p>') && !initialHtml.includes('<div>') && initialHtml.includes('\n')) {
              editorRef.current.innerHTML = initialHtml
                .split(/\n\s*\n/)
                .map((p) => `<p>${p.trim()}</p>`)
                .join('');
            } else {
              editorRef.current.innerHTML = initialHtml || '<p><br></p>';
            }
          }
          updateCounts();
          editorRef.current.focus();
        }
      }, 50);
    }
  };

  // Title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (activeChapter) {
      updateChapter(activeChapter.id, { title: newTitle });
    }
  };

  // Rich Text Execution Commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleEditorInput();
  };

  // Alignments: Left, Center, Right, Justify
  const handleAlign = (alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull') => {
    execCmd(alignment);
  };

  // Lists: Bullet, Numbered (1.), Upper Alpha (A.), Lower Alpha (a.)
  const handleList = (type: 'disc' | 'decimal' | 'upper-alpha' | 'lower-alpha') => {
    if (type === 'disc') {
      execCmd('insertUnorderedList');
    } else {
      execCmd('insertOrderedList');
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        const el = selection.anchorNode.parentElement?.closest('ol');
        if (el) {
          if (type === 'upper-alpha') {
            el.className = 'list-alpha-upper';
          } else if (type === 'lower-alpha') {
            el.className = 'list-alpha-lower';
          } else {
            el.className = 'list-numeric';
          }
        }
      }
    }
  };

  // Highlight Text (10 Colors)
  const handleHighlight = (color: string) => {
    if (color === 'transparent') {
      execCmd('removeFormat');
    } else {
      execCmd('hiliteColor', color);
    }
    setShowHighlightMenu(false);
  };

  // Text Color (10 Colors)
  const handleTextColor = (color: string) => {
    execCmd('foreColor', color);
    setShowTextColorMenu(false);
  };

  const handleOpenTextColorMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (showTextColorMenu) {
      setShowTextColorMenu(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 500;
    const left = Math.max(10, Math.min(rect.left, screenW - 270));
    setTextColorMenuPos({ top: rect.bottom + 6, left });
    setShowTextColorMenu(true);
    setShowHighlightMenu(false);
  };

  const handleOpenHighlightMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (showHighlightMenu) {
      setShowHighlightMenu(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 500;
    const left = Math.max(10, Math.min(rect.left, screenW - 270));
    setHighlightMenuPos({ top: rect.bottom + 6, left });
    setShowHighlightMenu(true);
    setShowTextColorMenu(false);
  };

  // Copy All / Copy Selection
  const handleCopyText = (type: 'all' | 'selection') => {
    if (!editorRef.current) return;
    if (type === 'all') {
      navigator.clipboard.writeText(editorRef.current.innerText);
      showToast('Seluruh teks bab berhasil disalin!');
    } else {
      const selected = window.getSelection()?.toString();
      if (selected) {
        navigator.clipboard.writeText(selected);
        showToast('Teks terpilih berhasil disalin!');
      } else {
        showToast('Blok teks terlebih dahulu untuk disalin.', 'info');
      }
    }
  };

  // Paste Clean Text
  const handlePasteClean = async () => {
    try {
      const text = await navigator.clipboard.readText();
      execCmd('insertText', text);
      showToast('Teks bersih berhasil ditempelkan!');
    } catch {
      showToast('Gunakan shortcut Ctrl+V untuk menempel.', 'info');
    }
  };

  // Open Cover Modal
  const openCoverModal = () => {
    if (!activeProject) return;
    setCoverAuthor(activeProject.authorName || 'Shandra Cahya');
    setCoverCopyright(activeProject.copyrightYear || new Date().getFullYear().toString());
    setCoverGenre(activeProject.genre || 'General Fiction');
    setCoverSubGenre(activeProject.subGenre || '');
    setCoverSynopsis(activeProject.synopsis || '');
    setCoverUrl(activeProject.coverUrl || '');
    setShowCoverModal(true);
  };

  const handleSaveCover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;
    updateProject(activeProject.id, {
      authorName: coverAuthor,
      copyrightYear: coverCopyright,
      genre: coverGenre,
      subGenre: coverSubGenre,
      synopsis: coverSynopsis,
      coverUrl: coverUrl,
    });
    setShowCoverModal(false);
    showToast('Rincian sampul, genre & buku berhasil diperbarui!');
  };

  const handleCreateNewStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryForm.title.trim()) {
      showToast('Judul cerita wajib diisi', 'error');
      return;
    }
    const created = createProject({
      title: newStoryForm.title.trim(),
      genre: newStoryForm.genre,
      subGenre: newStoryForm.subGenre.trim() || undefined,
      synopsis: newStoryForm.synopsis.trim() || 'Dunia naskah baru.',
      authorName: newStoryForm.authorName || 'Shandra Cahya',
      copyrightYear: newStoryForm.copyrightYear || new Date().getFullYear().toString(),
      category: 'series',
      status: 'On Progress',
      coverUrl: '/src/assets/images/sample_book_cover_1793354596229.jpg',
    });
    // Create initial arc & chapter for the new story
    const arc = createArc({ projectId: created.id, title: 'Arc I: Permulaan' });
    createChapter(arc.id, 'Bab 1: Permulaan');
    setActiveProjectId(created.id);
    setShowNewStoryModal(false);
    setNewStoryForm({
      title: '',
      genre: 'General Fiction',
      subGenre: '',
      synopsis: '',
      authorName: 'Shandra Cahya',
      copyrightYear: new Date().getFullYear().toString(),
    });
    showToast(`Cerita "${created.title}" berhasil dibuat! Siap menulis.`);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Manual snapshot
  const handleManualSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter) return;
    createSnapshot(activeChapter.id, snapshotNote || 'Manual snapshot');
    setSnapshotNote('');
    showToast('Snapshot versi berhasil diamankan di Time Machine');
  };

  // Import single .docx into current active chapter
  const handleDocxImportChapter = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChapter) return;

    try {
      const parsedChapters = await parseDocxFile(file);
      if (parsedChapters.length > 0) {
        const fullContent = parsedChapters.map((c) => c.content).join('\n\n');
        if (editorRef.current) {
          editorRef.current.innerHTML = fullContent
            .split(/\n\s*\n/)
            .map((p) => `<p>${p.trim()}</p>`)
            .join('');
          handleEditorInput();
        }
        showToast(`Berhasil memuat naskah dari ${file.name}`);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal mengimpor file', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Export full manuscript to .docx
  const handleExportDocx = async () => {
    if (!activeProject) return;
    try {
      setIsExportingDocx(true);
      await exportChapterToDocx(activeProject, projectChapters, typesetting);
      showToast('Naskah Word (.docx) siap diunduh!');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal mengekspor naskah', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Export current chapter to .txt / .md
  const handleExportText = (format: 'txt' | 'md') => {
    if (!activeChapter || !editorRef.current) return;
    const rawText = editorRef.current.innerText || '';
    const header = format === 'md' ? `# ${activeChapter.title}\n\n` : `${activeChapter.title}\n\n`;
    const textContent = header + rawText;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChapter.title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Bab berhasil diekspor (.${format})`);
  };

  const getFontClass = () => {
    switch (typesetting.fontFamily) {
      case 'EB Garamond':
        return 'font-garamond';
      case 'Baskervville':
        return 'font-baskerville';
      case 'Merriweather':
        return 'font-merriweather';
      case 'Cinzel':
        return 'font-cinzel';
      case 'Times New Roman':
        return 'font-times';
      case 'Consolas':
        return 'font-consolas';
      case 'Helvetica':
        return 'font-helvetica';
      case 'Poppins':
        return 'font-poppins';
      case 'Questrial':
        return 'font-questrial';
      default:
        return 'font-garamond';
    }
  };

  const getFontFamilyInline = () => {
    switch (typesetting.fontFamily) {
      case 'EB Garamond':
        return "'EB Garamond', Garamond, Georgia, serif";
      case 'Baskervville':
        return "'Baskervville', Baskerville, Georgia, serif";
      case 'Merriweather':
        return "'Merriweather', Georgia, serif";
      case 'Cinzel':
        return "'Cinzel', serif";
      case 'Times New Roman':
        return "'Times New Roman', Times, serif";
      case 'Consolas':
        return "Consolas, 'Courier New', Courier, monospace";
      case 'Helvetica':
        return "'Helvetica Neue', Helvetica, Arial, sans-serif";
      case 'Poppins':
        return "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif";
      case 'Questrial':
        return "'Questrial', -apple-system, BlinkMacSystemFont, sans-serif";
      default:
        return "'EB Garamond', Garamond, Georgia, serif";
    }
  };

  const getColumnWidthClass = () => {
    switch (typesetting.columnWidth) {
      case 'narrow':
        return 'max-w-xl';
      case 'wide':
        return 'max-w-4xl';
      case 'standard':
      default:
        return 'max-w-2xl';
    }
  };

  return (
    <div
      className={`relative flex min-h-[calc(100vh-57px)] bg-[var(--app-bg)] text-[var(--app-text)] transition-colors ${
        isZenMode ? 'fixed inset-0 z-50 overflow-y-auto bg-[var(--app-bg)]' : ''
      }`}
    >
      {/* ZEN MODE FLOATING TOP CONTROLS */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[var(--app-card)]/90 backdrop-blur-md border border-[var(--app-border)] rounded-xl px-3 py-1.5 shadow-2xl transition-opacity hover:opacity-100 opacity-60">
          <span className="text-[11px] text-[var(--app-accent)] font-mono">Zen Mode (ESC untuk keluar)</span>
          <button
            onClick={() => setIsZenMode(false)}
            className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg transition-colors"
            title="Keluar dari Zen Mode (ESC)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {!isZenMode && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* LEFT SIDEBAR: CHAPTERS & ARCS NAVIGATOR */}
      {!isZenMode && (
        <aside
          className={`fixed md:relative inset-y-0 left-0 z-50 md:z-20 border-r border-[var(--app-border)] bg-[var(--app-card)] transition-all duration-300 flex flex-col h-full ${
            sidebarOpen
              ? 'translate-x-0 w-72 sm:w-80 max-w-[85vw] shadow-2xl md:shadow-none'
              : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-[var(--app-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--app-accent)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text)]">
                Struktur Cerita
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => docxInputRef.current?.click()}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] rounded-lg transition-colors"
                title="Impor Bab dari .docx"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={docxInputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={handleDocxImportChapter}
              />
              <button
                onClick={() => {
                  const title = prompt('Nama Arc / Bagian Baru:', `Arc ${projectArcs.length + 1}`);
                  if (title) createArc({ title });
                }}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] rounded-lg transition-colors"
                title="Tambah Arc Baru"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg transition-colors ml-0.5"
                title="Tutup Daftar Bab"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Arcs & Chapters List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {projectArcs.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--app-text-muted)]">
                <p>Belum ada arc naskah.</p>
                <button
                  onClick={() => createArc({ title: 'Arc I: Permulaan' })}
                  className="mt-2 text-[var(--app-accent)] underline font-semibold"
                >
                  + Tambah Arc Pertama
                </button>
              </div>
            ) : (
              projectArcs.map((arc) => {
                const arcChapters = projectChapters.filter((c) => c.arcId === arc.id);
                return (
                  <div key={arc.id} className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-[var(--app-text-muted)] font-medium group">
                      <span className="truncate text-[var(--app-text)] font-semibold">{arc.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => createChapter(arc.id)}
                          className="p-1 text-[var(--app-accent)] hover:bg-[var(--app-card-sub)] rounded"
                          title="Tambah Bab"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            requestConfirm({
                              title: 'Hapus Arc / Bagian',
                              message: `Yakin ingin menghapus volume "${arc.title}" beserta seluruh bab di dalamnya?`,
                              confirmLabel: 'Hapus Arc',
                              onConfirm: () => deleteArc(arc.id),
                            });
                          }}
                          className="p-1 text-red-400 hover:bg-[var(--app-card-sub)] rounded"
                          title="Hapus Arc"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-0.5 pl-1.5 border-l border-[var(--app-border)]">
                      {arcChapters.length === 0 ? (
                        <div className="text-[11px] text-[var(--app-text-muted)] px-2.5 py-1">
                          Kosong. Klik + untuk membuat bab.
                        </div>
                      ) : (
                        arcChapters.map((chap) => {
                          const isSelected = chap.id === activeChapterId;
                          return (
                            <div
                              key={chap.id}
                              onClick={() => {
                                setActiveChapterId(chap.id);
                                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                  setSidebarOpen(false);
                                }
                              }}
                              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-medium shadow-sm border border-[var(--app-border)]'
                                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="truncate">
                                  {chap.title || `Bab ${chap.chapterNumber}`}
                                </p>
                                <span className="text-[10px] font-mono text-[var(--app-text-muted)]">
                                  {chap.wordCount || 0} kata
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestConfirm({
                                    title: 'Hapus Bab Naskah',
                                    message: `Yakin ingin menghapus "${chap.title || `Bab ${chap.chapterNumber}`}"?`,
                                    confirmLabel: 'Hapus Bab',
                                    onConfirm: () => deleteChapter(chap.id),
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--app-text-muted)] hover:text-red-400 rounded transition-opacity"
                                title="Hapus Bab"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Export Full Manuscript */}
          <div className="p-3 border-t border-[var(--app-border)] bg-[var(--app-card-sub)]">
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-all shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              <span>{isExportingDocx ? 'Mengekspor Word...' : 'Unduh Buku (.docx)'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* MAIN WRITING WORKBENCH */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Editor Top Bar - Centered across all modes */}
        {!isZenMode && (
          <div className="border-b border-[var(--app-border)] bg-[var(--app-header-bg)] px-3 sm:px-6 py-2 transition-colors">
            <div className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2.5">
              {/* Left Controls: Sidebar Toggle & Stats */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    sidebarOpen
                      ? 'border-[var(--app-border)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-sm'
                      : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] hover:border-[var(--app-accent)]'
                  }`}
                  title={sidebarOpen ? 'Tutup Daftar Bab' : 'Buka Daftar Bab'}
                >
                  <Layers className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span className="font-semibold">{sidebarOpen ? 'Tutup Bab' : 'Daftar Bab'}</span>
                  {activeChapter && (
                    <span className="font-mono text-[10px] text-[var(--app-text-muted)] border-l border-[var(--app-border)] pl-1.5 max-w-[100px] truncate hidden sm:inline">
                      Bab {activeChapter.chapterNumber}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] font-mono">
                  <span>{wordCount} kata</span>
                  <span>·</span>
                  <span>{charCount} kar</span>
                </div>
              </div>

              {/* Right Controls: Mode Baca, New Story, Formatting Suite, Time Machine, Zen Mode */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Mode Baca (Reader Mode) Button */}
                <button
                  onClick={() => handleToggleReaderMode()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isReaderMode
                      ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-black shadow-xs'
                      : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] hover:border-[var(--app-accent)]'
                  }`}
                  title={isReaderMode ? 'Kembali ke Mode Tulis (Edit)' : 'Beralih ke Mode Baca (Pratinjau)'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isReaderMode ? 'Mode Tulis' : 'Mode Baca'}</span>
                </button>

                {/* Quick New Story Button */}
                <button
                  onClick={() => setShowNewStoryModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-medium text-[var(--app-accent)] hover:border-[var(--app-accent)] transition-colors"
                  title="Tulis Cerita Baru (Pilih Genre & Sub-Genre)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerita Baru</span>
                </button>

                {/* Typesetting Drawer Trigger */}
                <button
                  onClick={() => setShowTypesetPanel(!showTypesetPanel)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    showTypesetPanel
                      ? 'border-[var(--app-border)] bg-[var(--app-accent-bg)] text-[var(--app-accent)]'
                      : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] hover:border-[var(--app-accent)]'
                  }`}
                  title="Format Font & Ukuran"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Font</span>
                </button>

                {/* Version History (Time Machine) */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors"
                  title="Riwayat Versi (Time Machine)"
                >
                  <History className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span className="hidden md:inline">Riwayat</span>
                  {chapterSnapshots.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-[var(--app-card-sub)] text-[var(--app-accent)] text-[10px] font-mono rounded">
                      {chapterSnapshots.length}
                    </span>
                  )}
                </button>

                {/* Export Text options */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={() => handleExportText('md')}
                    className="px-2 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                    title="Unduh Bab (.md)"
                  >
                    .md
                  </button>
                  <button
                    onClick={() => handleExportText('txt')}
                    className="px-2 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                    title="Unduh Bab (.txt)"
                  >
                    .txt
                  </button>
                </div>

                {/* Zen Mode Button */}
                <button
                  onClick={() => setIsZenMode(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--app-accent-bg)] border border-[var(--app-border)] text-[var(--app-accent)] text-xs font-medium hover:opacity-90 transition-all"
                  title="Mode Fokus Layar Penuh (Zen Mode)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Focus</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* READER MODE TOP BANNER - Centered */}
        {!isZenMode && isReaderMode && (
          <div className="border-b border-[var(--app-border)] bg-[var(--app-card-sub)] px-4 sm:px-6 py-2 transition-colors">
            <div className="w-full max-w-4xl mx-auto flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-semibold text-[11px] uppercase tracking-wider">
                  <Eye className="w-3 h-3" />
                  Mode Baca
                </span>
                <span className="text-[var(--app-text-muted)] hidden sm:inline">
                  Pratinjau membaca bersih tanpa gangguan tombol editing.
                </span>
              </div>
              <button
                onClick={() => handleToggleReaderMode(false)}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors"
              >
                <Edit3 className="w-3 h-3 text-[var(--app-accent)]" />
                <span>Kembali ke Mode Tulis</span>
              </button>
            </div>
          </div>
        )}

        {/* RICH TEXT FORMATTING TOOLBAR - Centered in Fullscreen & Windowed Modes */}
        {!isZenMode && !isReaderMode && (
          <div className="border-b border-[var(--app-border)] bg-[var(--app-card)] px-3 sm:px-6 py-2 transition-colors">
            <div className="w-full max-w-5xl mx-auto flex items-center justify-center gap-1.5 overflow-x-auto flex-wrap">
              {/* Inline Text Styles: B, I, U */}
              <div className="flex items-center gap-0.5 border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={() => execCmd('bold')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Bold (Tebal) - Ctrl+B"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('italic')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Italic (Miring) - Ctrl+I"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('underline')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Underline (Garis Bawah) - Ctrl+U"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Warna Huruf (Text Color) - 10 Colors Trigger */}
              <div className="border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenTextColorMenu}
                  className={`flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
                    showTextColorMenu
                      ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-xs'
                      : 'text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
                  }`}
                  title="Warna Huruf (10 Opsi)"
                >
                  <Baseline className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                </button>
              </div>

              {/* Alignments: Left, Center, Right, Justify */}
              <div className="flex items-center gap-0.5 border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAlign('justifyLeft')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Rata Kiri"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign('justifyCenter')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Rata Tengah"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign('justifyRight')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Rata Kanan"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlign('justifyFull')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Rata Kiri-Kanan (Justify)"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Lists: Bullet (•), Numbered (1.), Upper Alpha (A.), Lower Alpha (a.) */}
              <div className="flex items-center gap-0.5 border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleList('disc')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                  title="Daftar Poin (Bullet •)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleList('decimal')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors font-mono text-xs font-semibold"
                  title="Daftar Nomor (1, 2, 3)"
                >
                  1.
                </button>
                <button
                  type="button"
                  onClick={() => handleList('upper-alpha')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors font-mono text-xs font-semibold"
                  title="Daftar Huruf Kapital (A, B, C)"
                >
                  A.
                </button>
                <button
                  type="button"
                  onClick={() => handleList('lower-alpha')}
                  className="p-1.5 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors font-mono text-xs font-semibold"
                  title="Daftar Huruf Kecil (a, b, c)"
                >
                  a.
                </button>
              </div>

              {/* Highlight Menu (10 Colors) Trigger */}
              <div className="border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenHighlightMenu}
                  className={`flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
                    showHighlightMenu
                      ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-xs'
                      : 'text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
                  }`}
                  title="Sorot Teks (10 Opsi)"
                >
                  <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                </button>
              </div>

              {/* Copy & Paste Helpers */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyText('selection')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]"
                  title="Salin teks yang diblok"
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">Salin Blok</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyText('all')}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]"
                  title="Salin semua teks di bab ini"
                >
                  <Copy className="w-3 h-3 text-[var(--app-accent)]" />
                  <span className="hidden sm:inline">Salin Semua</span>
                </button>
                <button
                  type="button"
                  onClick={handlePasteClean}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]"
                  title="Tempel teks bersih dari clipboard"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span className="hidden sm:inline">Tempel</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING TYPESETTING CONTROLS DRAWER - Centered */}
        {showTypesetPanel && !isZenMode && (
          <div className="border-b border-[var(--app-border)] bg-[var(--app-card-sub)] px-4 md:px-7 py-3 transition-colors">
            <div className="w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs animate-in slide-in-from-top-1">
              <div>
                <label className="text-[10px] text-[var(--app-text-muted)] uppercase font-medium block mb-1">
                  Font Naskah
                </label>
                <select
                  value={typesetting.fontFamily}
                  onChange={(e) =>
                    updateTypesetting({
                      fontFamily: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-xs text-[var(--app-text)] focus:outline-none"
                >
                  <option value="EB Garamond">EB Garamond (Klasik)</option>
                  <option value="Baskervville">Baskerville (Elegan)</option>
                  <option value="Merriweather">Merriweather (Tajam)</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Cinzel">Cinzel (Gothic)</option>
                  <option value="Consolas">Consolas (Monospace)</option>
                  <option value="Helvetica">Helvetica (Modern Clean)</option>
                  <option value="Poppins">Poppins (Geometris)</option>
                  <option value="Questrial">Questrial (Minimalis)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[var(--app-text-muted)] uppercase font-medium block mb-1">
                  Ukuran Font: {typesetting.fontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="26"
                  step="1"
                  value={typesetting.fontSize}
                  onChange={(e) => updateTypesetting({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-[var(--app-accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[var(--app-text-muted)] uppercase font-medium block mb-1">
                  Spasi Baris: {typesetting.lineHeight}
                </label>
                <select
                  value={typesetting.lineHeight}
                  onChange={(e) => updateTypesetting({ lineHeight: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-xs text-[var(--app-text)] focus:outline-none"
                >
                  <option value="1.4">1.4 (Kompak)</option>
                  <option value="1.6">1.6 (Normal)</option>
                  <option value="1.8">1.8 (Standar Buku)</option>
                  <option value="2.0">2.0 (Longgar)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[var(--app-text-muted)] uppercase font-medium block mb-1">
                  Indent Paragraf
                </label>
                <button
                  type="button"
                  onClick={() =>
                    updateTypesetting({ paragraphIndent: !typesetting.paragraphIndent })
                  }
                  className={`w-full py-1 px-2 rounded-lg border text-xs font-medium transition-colors ${
                    typesetting.paragraphIndent
                      ? 'border-[var(--app-accent)] bg-[var(--app-accent-bg)] text-[var(--app-accent)]'
                      : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text-muted)]'
                  }`}
                >
                  {typesetting.paragraphIndent ? 'Indent Aktif (Alinea)' : 'Tanpa Indent'}
                </button>
              </div>

              <div>
                <label className="text-[10px] text-[var(--app-text-muted)] uppercase font-medium block mb-1">
                  Lebar Bidang Baca
                </label>
                <select
                  value={typesetting.columnWidth}
                  onChange={(e) => updateTypesetting({ columnWidth: e.target.value as any })}
                  className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1 text-xs text-[var(--app-text)] focus:outline-none"
                >
                  <option value="narrow">Kompak</option>
                  <option value="standard">Standar Buku</option>
                  <option value="wide">Lebar</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* EDITOR WRITING CANVAS (contentEditable) */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex justify-center pb-24 md:pb-16">
          <div className={`w-full ${getColumnWidthClass()} flex flex-col`}>
            {/* BOOK COVER PREVIEW BANNER (Klik untuk melihat preview sampul, nama penulis, copyright, sinopsis) */}
            {activeProject && (
              <div
                onClick={openCoverModal}
                className="mb-4 p-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-accent)] transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                title="Klik untuk melihat dan menyunting rincian sampul, penulis &amp; copyright buku"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-15 rounded-lg overflow-hidden bg-[var(--app-card-sub)] border border-[var(--app-border)] shrink-0 relative shadow-xs">
                    {activeProject.coverUrl ? (
                      <img
                        src={activeProject.coverUrl}
                        alt={activeProject.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--app-text-muted)]">
                        <BookMarked className="w-4 h-4 text-[var(--app-accent)]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[var(--app-accent)]">
                      <span>{activeProject.category === 'series' ? activeProject.seriesTitle || 'Seri Buku' : 'Standalone'}</span>
                      <span>·</span>
                      <span>{activeProject.genre}</span>
                    </div>
                    <h2 className="text-sm font-bold text-[var(--app-text)] truncate group-hover:text-[var(--app-accent)] transition-colors">
                      {activeProject.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] mt-0.5">
                      <span>Oleh: <strong className="text-[var(--app-text)] font-medium">{activeProject.authorName || 'Penulis'}</strong></span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">© {activeProject.copyrightYear || '2026'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] text-xs text-[var(--app-text)] group-hover:border-[var(--app-accent)] shrink-0 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span className="hidden sm:inline">Rincian Sampul</span>
                </div>
              </div>
            )}

            {/* If no chapters exist, show friendly prompt */}
            {projectChapters.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-card)] my-auto">
                <BookOpen className="w-10 h-10 text-[var(--app-accent)] mx-auto mb-2 opacity-75" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">Belum ada bab dalam naskah ini</h3>
                <p className="text-xs text-[var(--app-text-muted)] mt-1 mb-4">
                  Mulai bab pertama sekarang untuk mulai merangkai cerita.
                </p>
                <button
                  onClick={() => {
                    const arcId = projectArcs[0]?.id || createArc({ title: 'Arc I: Permulaan' }).id;
                    createChapter(arcId, 'Bab 1: Permulaan');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Buat Bab Pertama</span>
                </button>
              </div>
            ) : (
              <>
                {/* CLEAN READER MODE VIEW (ACTIVE WHEN isReaderMode IS TRUE) */}
                {isReaderMode && (
                  <div className="w-full space-y-6 animate-in fade-in duration-200">
                    <div className="pb-4 border-b border-[var(--app-border)]">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--app-accent)] block mb-1">
                        {activeProject?.category === 'series'
                          ? `${activeProject.seriesTitle || 'Seri'} · Bab ${activeChapter?.chapterNumber || 1}`
                          : `Bab ${activeChapter?.chapterNumber || 1}`}
                      </span>
                      <h1
                        className={`text-2xl sm:text-3xl font-bold text-[var(--app-text)] leading-tight ${getFontClass()}`}
                        style={{ fontFamily: getFontFamilyInline() }}
                      >
                        {title || `Bab ${activeChapter?.chapterNumber || 1}`}
                      </h1>
                      <p className="text-xs text-[var(--app-text-muted)] mt-1.5">
                        {activeProject?.title} · Oleh <strong className="text-[var(--app-text)]">{activeProject?.authorName || 'Penulis'}</strong>
                      </p>
                    </div>

                    <div
                      className={`editor-rich-content flex-1 text-[var(--app-text)] leading-relaxed select-text transition-colors ${getFontClass()} ${
                        typesetting.dropCap ? 'drop-cap' : ''
                      }`}
                      style={{
                        fontFamily: getFontFamilyInline(),
                        fontSize: `${typesetting.fontSize}px`,
                        lineHeight: typesetting.lineHeight,
                        textIndent: typesetting.paragraphIndent ? '2em' : '0px',
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          (editorRef.current?.innerHTML && editorRef.current.innerHTML !== '<p><br></p>')
                            ? editorRef.current.innerHTML
                            : (activeChapter?.content || '<p class="italic text-[var(--app-text-muted)]">Bab ini belum memiliki isi draf.</p>'),
                      }}
                    />
                  </div>
                )}

                {/* WRITE MODE EDITOR (KEPT PERMANENTLY MOUNTED IN DOM TO PREVENT ANY DATA LOSS) */}
                <div className={`w-full flex flex-col flex-1 ${isReaderMode ? 'hidden' : ''}`}>
                  {/* Chapter Title Input */}
                  <div className="mb-4 pb-2 border-b border-[var(--app-border)]">
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Judul Bab..."
                      style={{ fontFamily: getFontFamilyInline() }}
                      className={`w-full bg-transparent text-xl md:text-2xl font-bold text-[var(--app-text)] focus:outline-none placeholder-[var(--app-text-muted)] ${getFontClass()}`}
                    />
                  </div>

                  {/* Rich ContentEditable Manuscript Editor */}
                  <div
                    ref={editorRef}
                    contentEditable={!isReaderMode}
                    onInput={handleEditorInput}
                    data-placeholder="Mulai menulis draf ceritamu di sini..."
                    className={`editor-rich-content flex-1 min-h-[500px] bg-transparent text-[var(--app-text)] focus:outline-none leading-relaxed transition-colors ${getFontClass()} ${
                      typesetting.dropCap ? 'drop-cap' : ''
                    }`}
                    style={{
                      fontFamily: getFontFamilyInline(),
                      fontSize: `${typesetting.fontSize}px`,
                      lineHeight: typesetting.lineHeight,
                      textIndent: typesetting.paragraphIndent ? '2em' : '0px',
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* COVER PREVIEW & BOOK DETAILS MODAL */}
      {showCoverModal && activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl text-[var(--app-text)] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--app-accent)]" />
                <h2 className="text-sm font-bold text-[var(--app-text)]">
                  Rincian Sampul &amp; Informasi Buku
                </h2>
              </div>
              <button
                onClick={() => setShowCoverModal(false)}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCover} className="space-y-4">
              {/* Cover Preview Card */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start p-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)]">
                <div className="w-32 h-44 rounded-xl overflow-hidden border border-[var(--app-border)] bg-[var(--app-card)] shrink-0 relative shadow-md">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={activeProject.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--app-text-muted)]">
                      <BookMarked className="w-8 h-8 text-[var(--app-accent)] opacity-40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-accent)]">
                    {activeProject.genre}
                  </span>
                  <h3 className="text-base font-bold text-[var(--app-text)] leading-tight">
                    {activeProject.title}
                  </h3>
                  {activeProject.subtitle && (
                    <p className="text-xs text-[var(--app-text-muted)] italic">
                      {activeProject.subtitle}
                    </p>
                  )}

                  <div className="pt-1.5 text-xs text-[var(--app-text-muted)] space-y-1">
                    <p>Penerbit: <strong className="text-[var(--app-text)]">Shandwright Studio Publishing</strong></p>
                    {activeProject.subGenre && (
                      <p>Sub-Genre: <strong className="text-[var(--app-text)]">{activeProject.subGenre}</strong></p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverImageInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors"
                    >
                      <Upload className="w-3 h-3 text-[var(--app-accent)]" />
                      <span>Unggah Foto Sampul</span>
                    </button>
                    <input
                      ref={coverImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Editable Fields: Author Name, Copyright Year, Genre, Sub-Genre, Cover URL, Expanded Synopsis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Nama Penulis (Author Name)
                  </label>
                  <input
                    type="text"
                    value={coverAuthor}
                    onChange={(e) => setCoverAuthor(e.target.value)}
                    placeholder="Contoh: Shandra Cahya"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Tahun Copyright
                  </label>
                  <input
                    type="text"
                    value={coverCopyright}
                    onChange={(e) => setCoverCopyright(e.target.value)}
                    placeholder="Contoh: 2026"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Genre Cerita
                  </label>
                  <select
                    value={coverGenre}
                    onChange={(e) => setCoverGenre(e.target.value as DarkGenre)}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  >
                    <option value="General Fiction">Fiksi Umum</option>
                    <option value="Dark Fantasy">Dark Fantasy</option>
                    <option value="Fantasy">Fantasi</option>
                    <option value="Sci-Fi Thriller">Sci-Fi Thriller</option>
                    <option value="Dark Mystery">Dark Mystery</option>
                    <option value="Grimdark">Grimdark</option>
                    <option value="Romance">Romansa</option>
                    <option value="Cosmic Horror">Cosmic Horror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Sub-Genre Cerita
                  </label>
                  <input
                    type="text"
                    value={coverSubGenre}
                    onChange={(e) => setCoverSubGenre(e.target.value)}
                    placeholder="Contoh: Urban Fantasy, Supernatural..."
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    URL Gambar Sampul Buku
                  </label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://... atau /src/assets/..."
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Deskripsi / Sinopsis Utama Cerita (Diperluas)
                  </label>
                  <textarea
                    rows={7}
                    value={coverSynopsis}
                    onChange={(e) => setCoverSynopsis(e.target.value)}
                    placeholder="Tuliskan sinopsis lengkap cerita, premis semesta, dan latar belakang konflik utama..."
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-3 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] min-h-[160px] resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setShowCoverModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
                >
                  Simpan Rincian Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW STORY QUICK MODAL (GENRE & SUB-GENRE) */}
      {showNewStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl text-[var(--app-text)] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--app-accent)]" />
                <h2 className="text-sm font-bold text-[var(--app-text)]">
                  Tulis Cerita Baru (Pilih Genre &amp; Sub-Genre)
                </h2>
              </div>
              <button
                onClick={() => setShowNewStoryModal(false)}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Judul Cerita *
                </label>
                <input
                  type="text"
                  required
                  value={newStoryForm.title}
                  onChange={(e) => setNewStoryForm({ ...newStoryForm, title: e.target.value })}
                  placeholder="Contoh: Sang Pangeran Mahkota Terkutuk"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Genre Utama Cerita
                  </label>
                  <select
                    value={newStoryForm.genre}
                    onChange={(e) =>
                      setNewStoryForm({ ...newStoryForm, genre: e.target.value as DarkGenre })
                    }
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  >
                    <option value="General Fiction">Fiksi Umum</option>
                    <option value="Dark Fantasy">Dark Fantasy</option>
                    <option value="Fantasy">Fantasi</option>
                    <option value="Sci-Fi Thriller">Sci-Fi Thriller</option>
                    <option value="Dark Mystery">Dark Mystery</option>
                    <option value="Grimdark">Grimdark</option>
                    <option value="Romance">Romansa</option>
                    <option value="Cosmic Horror">Cosmic Horror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Sub-Genre Cerita
                  </label>
                  <input
                    type="text"
                    value={newStoryForm.subGenre}
                    onChange={(e) =>
                      setNewStoryForm({ ...newStoryForm, subGenre: e.target.value })
                    }
                    placeholder="Contoh: Urban Fantasy, Supernatural..."
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Sinopsis / Premis Cerita (Opsional)
                </label>
                <textarea
                  rows={4}
                  value={newStoryForm.synopsis}
                  onChange={(e) =>
                    setNewStoryForm({ ...newStoryForm, synopsis: e.target.value })
                  }
                  placeholder="Gambarkan premis cerita baru yang ingin kamu bangun..."
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-3 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setShowNewStoryModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
                >
                  Mulai Menulis Cerita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERSION HISTORY / TIME MACHINE MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl text-[var(--app-text)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--app-accent)]" />
                <h2 className="text-sm font-bold text-[var(--app-text)]">
                  Time Machine (Riwayat Versi Bab)
                </h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSnapshot} className="flex gap-2 my-4">
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="Catatan snapshot..."
                className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-1.5 text-xs text-[var(--app-text)] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-black text-xs font-semibold hover:opacity-90 transition-all whitespace-nowrap"
              >
                Buat Snapshot
              </button>
            </form>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {chapterSnapshots.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--app-text-muted)]">
                  Belum ada riwayat snapshot untuk bab ini.
                </div>
              ) : (
                chapterSnapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] hover:border-[var(--app-accent)] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[var(--app-accent)]" />
                        <span className="text-xs font-semibold text-[var(--app-text)]">
                          {new Date(snap.timestamp).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                          ({snap.wordCount} kata)
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">{snap.note}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: 'Pulihkan Versi Bab',
                            message: 'Kembalikan naskah bab ini ke versi snapshot tersebut? Perubahan terkini yang belum disimpan akan digantikan.',
                            confirmLabel: 'Pulihkan',
                            isDestructive: false,
                            onConfirm: () => {
                              restoreSnapshot(snap.id);
                              if (editorRef.current) {
                                editorRef.current.innerHTML = snap.content;
                                updateCounts();
                              }
                              setShowHistoryModal(false);
                            },
                          });
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-accent-bg)] text-xs text-[var(--app-accent)] hover:opacity-90 transition-colors"
                        title="Pulihkan naskah ke versi ini"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Pulihkan</span>
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="p-1 text-[var(--app-text-muted)] hover:text-red-400 rounded transition-colors"
                        title="Hapus snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TEXT COLOR PALETTE (10 Opsi Warna) */}
      {showTextColorMenu && textColorMenuPos && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShowTextColorMenu(false)}
          />
          <div
            className="fixed z-[101] p-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-2xl w-64 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: textColorMenuPos.top, left: textColorMenuPos.left }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--app-border)]">
              <span className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider">
                Warna Font (10 Opsi)
              </span>
              <button
                type="button"
                onClick={() => setShowTextColorMenu(false)}
                className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {TEXT_COLORS.map((tc) => (
                <button
                  key={tc.name}
                  type="button"
                  onClick={() => handleTextColor(tc.value)}
                  className="w-9 h-9 rounded-xl border-2 border-[var(--app-border)] hover:scale-110 hover:border-[var(--app-accent)] transition-all shadow-sm flex items-center justify-center cursor-pointer group"
                  style={{ backgroundColor: tc.value === 'inherit' ? 'var(--app-card-sub)' : tc.value }}
                  title={tc.name}
                >
                  {tc.value === 'inherit' && (
                    <span className="text-[10px] font-mono font-bold text-[var(--app-text)]">Def</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--app-text-muted)] text-center font-mono">
              Pilih warna untuk diterapkan ke teks terpilih
            </p>
          </div>
        </>
      )}

      {/* FLOATING HIGHLIGHT PALETTE (10 Opsi Warna) */}
      {showHighlightMenu && highlightMenuPos && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setShowHighlightMenu(false)}
          />
          <div
            className="fixed z-[101] p-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] shadow-2xl w-64 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
            style={{ top: highlightMenuPos.top, left: highlightMenuPos.left }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[var(--app-border)]">
              <span className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider">
                Highlight Teks (10 Opsi)
              </span>
              <button
                type="button"
                onClick={() => setShowHighlightMenu(false)}
                className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {HIGHLIGHT_COLORS.map((hc) => (
                <button
                  key={hc.name}
                  type="button"
                  onClick={() => handleHighlight(hc.value)}
                  className="w-9 h-9 rounded-xl border-2 border-[var(--app-border)] hover:scale-110 hover:border-[var(--app-accent)] transition-all shadow-sm cursor-pointer"
                  style={{ backgroundColor: hc.value }}
                  title={hc.name}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleHighlight('transparent')}
              className="w-full py-1.5 rounded-xl text-xs font-medium border border-[var(--app-border)] bg-[var(--app-card-sub)] text-[var(--app-text)] hover:border-red-400 hover:text-red-400 transition-colors text-center cursor-pointer"
            >
              Hapus Highlight (Bersihkan)
            </button>
          </div>
        </>
      )}
    </div>
  );
};
