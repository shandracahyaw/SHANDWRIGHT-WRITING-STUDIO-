import React, { useState, useEffect, useRef } from 'react';
import { useNovel } from '../../context/NovelContext';
import { exportNovelToDocx, parseDocxFile } from '../../utils/docxHelper';
import {
  Feather,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  History,
  FileDown,
  Upload,
  AlignJustify,
  AlignLeft,
  Type,
  ChevronDown,
  Layers,
  BookOpen,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  Sliders,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EditorView: React.FC = () => {
  const {
    activeProject,
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
    todayWords,
    dailyGoal,
    recordSessionWordDelta,
    showToast,
  } = useNovel();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTypesetPanel, setShowTypesetPanel] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState('');
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Local editor content buffer for smooth typing & tracking word delta
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const prevWordCountRef = useRef(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotTimerRef = useRef<NodeJS.Timeout | null>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  // Sync when activeChapter changes
  useEffect(() => {
    if (activeChapter) {
      setContent(activeChapter.content || '');
      setTitle(activeChapter.title || '');
      prevWordCountRef.current = activeChapter.wordCount || 0;
    }
  }, [activeChapterId, activeChapter?.id]);

  // Handle ESC key for Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode, setIsZenMode]);

  // Word & Character count calculation
  const currentWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const currentCharCount = content.length;
  const readingTime = Math.max(1, Math.ceil(currentWordCount / 200));

  // Auto-save logic
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    const newWords = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;
    const delta = newWords - prevWordCountRef.current;
    if (delta > 0) {
      recordSessionWordDelta(delta);
    }
    prevWordCountRef.current = newWords;

    // Check if daily goal reached
    if (todayWords + Math.max(0, delta) >= dailyGoal && todayWords < dailyGoal) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f472b6', '#fb7185', '#ffffff'],
      });
      showToast('Target menulis harian tercapai! Terus pertahankan ritme.');
    }

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      if (activeChapter) {
        updateChapter(activeChapter.id, {
          content: newContent,
          title: title,
        });
      }
    }, 800);

    // Periodic auto-snapshot every 15 minutes of activity
    if (!snapshotTimerRef.current && activeChapter) {
      snapshotTimerRef.current = setTimeout(() => {
        createSnapshot(activeChapter.id, 'Auto-save berkala Time Machine');
        snapshotTimerRef.current = null;
      }, 15 * 60 * 1000);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (activeChapter) {
      updateChapter(activeChapter.id, { title: newTitle });
    }
  };

  const handleManualSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter) return;
    createSnapshot(activeChapter.id, snapshotNote.trim() || undefined);
    setSnapshotNote('');
  };

  // Export to .docx
  const handleExportDocx = async () => {
    if (!activeProject) return;
    try {
      setIsExportingDocx(true);
      const blob = await exportNovelToDocx(
        activeProject.title,
        activeProject.subtitle,
        'Penulis Shandwright',
        projectChapters,
        projectArcs
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.title.toLowerCase().replace(/\s+/g, '_')}_naskah.docx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Naskah Word (.docx) berhasil diunduh!');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal mengekspor naskah: ' + err.message, 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Export current chapter to .txt / .md
  const handleExportText = (format: 'txt' | 'md') => {
    if (!activeChapter) return;
    const header = format === 'md' ? `# ${activeChapter.title}\n\n` : `${activeChapter.title}\n\n`;
    const textContent = header + activeChapter.content;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bab_${activeChapter.chapterNumber}_${activeChapter.title.replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Bab berhasil diunduh sebagai .${format}`);
  };

  // Import .docx into current project
  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;

    try {
      const parsed = await parseDocxFile(file);
      const firstArc = projectArcs[0] || createArc({ title: 'Arc I' });
      parsed.forEach((p) => {
        createChapter(firstArc.id, p.title, p.content);
      });
      showToast(`Berhasil menambahkan ${parsed.length} bab dari Word ke proyek!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengimpor file', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Font family selector class
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
      default:
        return 'font-garamond';
    }
  };

  // Column width class
  const getColumnWidthClass = () => {
    switch (typesetting.columnWidth) {
      case 'narrow':
        return 'max-w-xl'; // ~576px
      case 'wide':
        return 'max-w-4xl'; // ~896px
      case 'standard':
      default:
        return 'max-w-2xl'; // ~672px
    }
  };

  return (
    <div
      className={`relative flex min-h-[calc(100vh-57px)] bg-[#070709] text-[#e2e8f0] ${
        isZenMode ? 'fixed inset-0 z-50 overflow-y-auto bg-[#070709]' : ''
      }`}
    >
      {/* ZEN MODE FLOATING TOP CONTROLS */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#0d0e16]/80 backdrop-blur-md border border-[#222432] rounded-xl px-3 py-1.5 shadow-2xl transition-opacity hover:opacity-100 opacity-60">
          <span className="text-[11px] text-[#f472b6] font-mono">Zen Mode (ESC untuk keluar)</span>
          <button
            onClick={() => setIsZenMode(false)}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
            title="Keluar dari Zen Mode (ESC)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEFT SIDEBAR: ARCS & CHAPTERS NAVIGATOR (Hidden in Zen Mode) */}
      {!isZenMode && (
        <aside
          className={`shrink-0 border-r border-[#1a1c28] bg-[#090a0f] transition-all duration-300 flex flex-col z-20 ${
            sidebarOpen ? 'w-72 md:w-80' : 'w-0 overflow-hidden'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-[#1b1c28] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f472b6]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Struktur Naskah
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => docxInputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-[#f472b6] rounded-lg transition-colors"
                title="Impor Bab dari .docx"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={docxInputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={handleImportDocx}
              />
              <button
                onClick={() => {
                  const title = prompt('Judul Volume / Arc Baru:', `Arc ${projectArcs.length + 1}: `);
                  if (title) createArc({ title });
                }}
                className="p-1.5 text-gray-400 hover:text-[#f472b6] rounded-lg transition-colors"
                title="Tambah Volume / Arc Baru"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Arcs & Chapters List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {projectArcs.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-500">
                Belum ada volume naskah. Klik tombol + untuk menambahkan.
              </div>
            ) : (
              projectArcs.map((arc) => {
                const arcChapters = projectChapters.filter((c) => c.arcId === arc.id);
                return (
                  <div key={arc.id} className="space-y-1">
                    {/* Arc Header */}
                    <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 font-medium group">
                      <span className="truncate text-gray-300 font-semibold">{arc.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => createChapter(arc.id)}
                          className="p-1 text-[#f472b6] hover:bg-[#1a1c28] rounded"
                          title="Tambah Bab di Arc Ini"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        {projectArcs.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus "${arc.title}"?`)) deleteArc(arc.id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-400 hover:bg-[#1a1c28] rounded"
                            title="Hapus Arc"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chapters */}
                    <div className="space-y-0.5 pl-1.5 border-l border-[#1a1c28]">
                      {arcChapters.length === 0 ? (
                        <div className="text-[11px] text-gray-600 px-2.5 py-1">
                          Kosong. Klik + untuk membuat bab.
                        </div>
                      ) : (
                        arcChapters.map((chap) => {
                          const isSelected = chap.id === activeChapterId;
                          return (
                            <div
                              key={chap.id}
                              onClick={() => setActiveChapterId(chap.id)}
                              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#181926] text-[#f472b6] font-medium shadow-sm border border-[#2e3146]'
                                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#11121a]'
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="truncate">
                                  {chap.title || `Bab ${chap.chapterNumber}`}
                                </p>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {chap.wordCount || 0} kata
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Hapus "${chap.title}"?`)) deleteChapter(chap.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 rounded transition-opacity"
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

          {/* Export Full Manuscript Button */}
          <div className="p-3 border-t border-[#1b1c28] bg-[#0b0c12]">
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#242636] bg-[#12131d] text-xs font-medium text-gray-200 hover:text-white hover:border-[#f472b6]/50 transition-all shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5 text-[#f472b6]" />
              <span>{isExportingDocx ? 'Mengekspor Word...' : 'Unduh Buku (.docx)'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* TOGGLE SIDEBAR BUTTON ON MOBILE OR WHEN CLOSED */}
      {!isZenMode && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute top-3 z-30 items-center justify-center w-6 h-6 rounded-r bg-[#181926] border-y border-r border-[#2a2d3e] text-gray-400 hover:text-white transition-all"
          style={{ left: sidebarOpen ? '320px' : '0px' }}
          title={sidebarOpen ? 'Tutup Daftar Bab' : 'Buka Daftar Bab'}
        >
          {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* MAIN WRITING WORKBENCH */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Editor Top Bar (Hidden in Zen Mode) */}
        {!isZenMode && (
          <div className="border-b border-[#1b1c28] bg-[#08090d]/80 px-4 md:px-7 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-1.5 rounded-lg border border-[#222432] text-gray-300 hover:text-white"
                title="Buka Daftar Bab"
              >
                <Layers className="w-4 h-4 text-[#f472b6]" />
              </button>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-mono">
                  {currentWordCount} kata
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 font-mono">
                  {currentCharCount} karakter
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 font-mono">
                  ±{readingTime} mnt baca
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Typesetting Drawer Trigger */}
              <button
                onClick={() => setShowTypesetPanel(!showTypesetPanel)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  showTypesetPanel
                    ? 'border-[#f472b6] bg-[#f472b6]/10 text-[#f472b6]'
                    : 'border-[#222432] bg-[#101118] text-gray-300 hover:text-white'
                }`}
                title="Pengaturan Format Novel & Font"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Typesetting</span>
              </button>

              {/* Version History (Time Machine) */}
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#222432] bg-[#101118] text-xs font-medium text-gray-300 hover:text-white transition-colors"
                title="Riwayat Versi Naskah (Time Machine)"
              >
                <History className="w-3.5 h-3.5 text-[#f472b6]" />
                <span className="hidden sm:inline">Riwayat Versi</span>
                {chapterSnapshots.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#1f2130] text-[#f472b6] text-[10px] font-mono rounded">
                    {chapterSnapshots.length}
                  </span>
                )}
              </button>

              {/* Quick Export Chapter */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => handleExportText('md')}
                  className="px-2 py-1.5 rounded-lg border border-[#222432] bg-[#101118] text-xs text-gray-400 hover:text-white"
                  title="Unduh Bab (.md)"
                >
                  .md
                </button>
                <button
                  onClick={() => handleExportText('txt')}
                  className="px-2 py-1.5 rounded-lg border border-[#222432] bg-[#101118] text-xs text-gray-400 hover:text-white"
                  title="Unduh Bab (.txt)"
                >
                  .txt
                </button>
              </div>

              {/* Enter Zen Mode */}
              <button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f472b6]/10 border border-[#f472b6]/30 text-[#f472b6] text-xs font-medium hover:bg-[#f472b6]/20 transition-all"
                title="Masuk Mode Fokus Layar Penuh (Zen Mode)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Focus Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* FLOATING TYPESETTING CONTROLS DRAWER */}
        {showTypesetPanel && !isZenMode && (
          <div className="border-b border-[#1e202e] bg-[#0c0d15] px-4 md:px-7 py-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs animate-in slide-in-from-top-1">
            {/* Font Family */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                Font Naskah
              </label>
              <select
                value={typesetting.fontFamily}
                onChange={(e) =>
                  updateTypesetting({
                    fontFamily: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-[#222432] bg-[#12131c] px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="EB Garamond">EB Garamond (Klasik)</option>
                <option value="Baskervville">Baskerville (Elegan)</option>
                <option value="Merriweather">Merriweather (Tajam)</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Cinzel">Cinzel (Gothic Fantasy)</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                Ukuran Font: {typesetting.fontSize}px
              </label>
              <input
                type="range"
                min="14"
                max="24"
                step="1"
                value={typesetting.fontSize}
                onChange={(e) => updateTypesetting({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-[#f472b6]"
              />
            </div>

            {/* Line Spacing */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                Spasi Baris: {typesetting.lineHeight}
              </label>
              <select
                value={typesetting.lineHeight}
                onChange={(e) => updateTypesetting({ lineHeight: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-[#222432] bg-[#12131c] px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="1.4">1.4 (Kompak)</option>
                <option value="1.6">1.6 (Normal)</option>
                <option value="1.8">1.8 (Standar Buku)</option>
                <option value="2.0">2.0 (Longgar)</option>
              </select>
            </div>

            {/* Paragraph Indent */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                Indent Paragraf
              </label>
              <button
                type="button"
                onClick={() =>
                  updateTypesetting({ paragraphIndent: !typesetting.paragraphIndent })
                }
                className={`w-full py-1 px-2 rounded-lg border text-xs font-medium transition-colors ${
                  typesetting.paragraphIndent
                    ? 'border-[#f472b6] bg-[#f472b6]/15 text-[#f472b6]'
                    : 'border-[#222432] bg-[#12131c] text-gray-400'
                }`}
              >
                {typesetting.paragraphIndent ? 'Indent Aktif (Alinea)' : 'Tanpa Indent'}
              </button>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                Perataan Teks
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateTypesetting({ textAlignment: 'justify' })}
                  className={`flex-1 py-1 rounded-lg border flex items-center justify-center ${
                    typesetting.textAlignment === 'justify'
                      ? 'border-[#f472b6] bg-[#f472b6]/15 text-[#f472b6]'
                      : 'border-[#222432] bg-[#12131c] text-gray-400'
                  }`}
                  title="Justify (Rata Kiri-Kanan)"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateTypesetting({ textAlignment: 'left' })}
                  className={`flex-1 py-1 rounded-lg border flex items-center justify-center ${
                    typesetting.textAlignment === 'left'
                      ? 'border-[#f472b6] bg-[#f472b6]/15 text-[#f472b6]'
                      : 'border-[#222432] bg-[#12131c] text-gray-400'
                  }`}
                  title="Rata Kiri"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Drop Cap & Column Width */}
            <div>
              <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                Lebar Bidang Baca
              </label>
              <select
                value={typesetting.columnWidth}
                onChange={(e) => updateTypesetting({ columnWidth: e.target.value as any })}
                className="w-full rounded-lg border border-[#222432] bg-[#12131c] px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="narrow">Kompak (Saku)</option>
                <option value="standard">Standar Buku</option>
                <option value="wide">Lebar</option>
              </select>
            </div>
          </div>
        )}

        {/* EDITOR WRITING CANVAS */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex justify-center pb-24 md:pb-16">
          <div className={`w-full ${getColumnWidthClass()} flex flex-col`}>
            {/* Chapter Title Input */}
            <div className="mb-6 pb-3 border-b border-[#1b1c28]">
              <div className="text-xs uppercase tracking-widest text-[#f472b6] font-medium font-cinzel mb-1">
                {activeChapter
                  ? `Bab ${activeChapter.chapterNumber}`
                  : 'Naskah'}
              </div>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Judul Bab..."
                className={`w-full bg-transparent text-2xl md:text-3xl font-bold text-white focus:outline-none placeholder-gray-600 ${getFontClass()}`}
              />
            </div>

            {/* Manuscript Text Area */}
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Tulis draf bab naskah gelapmu di sini... Gunakan enter ganda untuk memisahkan alinea paragraf."
              className={`w-full flex-1 min-h-[550px] bg-transparent text-gray-200 focus:outline-none resize-none leading-relaxed placeholder-gray-600 ${getFontClass()}`}
              style={{
                fontSize: `${typesetting.fontSize}px`,
                lineHeight: typesetting.lineHeight,
                textAlign: typesetting.textAlignment,
                textIndent: typesetting.paragraphIndent ? '2em' : '0px',
              }}
            />
          </div>
        </div>
      </main>

      {/* VERSION HISTORY / TIME MACHINE MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[#2a2d3e] bg-[#0c0d14] p-6 shadow-2xl text-[#e2e8f0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c28]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#f472b6]" />
                <h2 className="text-base font-bold text-white">
                  Time Machine (Riwayat Versi Bab)
                </h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create manual snapshot */}
            <form onSubmit={handleManualSnapshot} className="flex gap-2 my-4">
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="Catatan snapshot (misal: Sebelum revisi duel...)"
                className="flex-1 rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:border-[#f472b6] focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#f472b6] text-black text-xs font-semibold hover:bg-[#ec4899] transition-all whitespace-nowrap"
              >
                Buat Snapshot
              </button>
            </form>

            {/* Snapshots list */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {chapterSnapshots.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  Belum ada snapshot untuk bab ini. Buat snapshot pertama untuk mengamankan naskah.
                </div>
              ) : (
                chapterSnapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#1e202c] bg-[#11121a] hover:border-[#2e3146] transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#f472b6]" />
                        <span className="text-xs font-semibold text-gray-200">
                          {new Date(snap.timestamp).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({snap.wordCount} kata)
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{snap.note}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Kembalikan naskah bab ini ke versi snapshot tersebut?')) {
                            restoreSnapshot(snap.id);
                            setShowHistoryModal(false);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#f472b6]/40 bg-[#f472b6]/10 text-xs text-[#f472b6] hover:bg-[#f472b6]/20 transition-colors"
                        title="Pulihkan naskah ke versi ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snap.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded transition-colors"
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
    </div>
  );
};
