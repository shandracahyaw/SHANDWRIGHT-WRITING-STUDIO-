import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNovel } from '../../context/NovelContext';
import { useLocalAuth } from '../auth/LocalAuthGate';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Share2,
  Type,
  Sparkles,
  Download,
  Copy,
  Check,
  X,
  Send,
  Heart,
  Trash2,
  BookMarked,
  Quote,
  Feather,
  ScrollText,
  BookText,
} from 'lucide-react';

interface LineComment {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  quotedText?: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

type ReaderTheme = 'default' | 'wattpad-dark' | 'wattpad-cream' | 'wattpad-white';
type ReadMode = 'scrolling' | 'paging';
type CardStyle = 'obsidian' | 'maroon' | 'parchment' | 'emerald' | 'violet';

// Editor font options for identical typography
const FONT_OPTIONS: { id: string; label: string; inline: string; className: string }[] = [
  { id: 'EB Garamond', label: 'EB Garamond (Klasik)', inline: "'EB Garamond', Garamond, Georgia, serif", className: 'font-garamond' },
  { id: 'Baskervville', label: 'Baskerville (Elegan)', inline: "'Baskervville', Baskerville, Georgia, serif", className: 'font-baskerville' },
  { id: 'Merriweather', label: 'Merriweather (Tajam)', inline: "'Merriweather', Georgia, serif", className: 'font-merriweather' },
  { id: 'Times New Roman', label: 'Times New Roman', inline: "'Times New Roman', Times, serif", className: 'font-times' },
  { id: 'Cinzel', label: 'Cinzel (Gothic)', inline: "'Cinzel', Georgia, serif", className: 'font-cinzel' },
  { id: 'Consolas', label: 'Consolas (Monospace)', inline: "'Consolas', monospace", className: 'font-consolas' },
  { id: 'Helvetica', label: 'Helvetica (Modern Clean)', inline: "'Helvetica Neue', Helvetica, Arial, sans-serif", className: 'font-helvetica' },
  { id: 'Poppins', label: 'Poppins (Geometris)', inline: "'Poppins', sans-serif", className: 'font-poppins' },
  { id: 'Questrial', label: 'Questrial (Minimalis)', inline: "'Questrial', sans-serif", className: 'font-questrial' },
];

export const ReaderView: React.FC = () => {
  const {
    activeProject,
    chapters,
    activeChapterId,
    setActiveChapterId,
    setActiveTab,
    typesetting,
    showToast,
    requestConfirm,
  } = useNovel();

  const { username } = useLocalAuth();

  // Reader Preferences
  const [readMode, setReadMode] = useState<ReadMode>('scrolling');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('default');
  const [selectedFont, setSelectedFont] = useState<string>(typesetting.fontFamily || 'EB Garamond');
  const [fontSize, setFontSize] = useState<number>(Math.max(10, typesetting.fontSize || 18));
  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Paging state
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Purely author's personal exploratory comments (no mock readers)
  const [comments, setComments] = useState<LineComment[]>(() => {
    try {
      const saved = localStorage.getItem('jaeyyyiii_author_reader_notes_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedParagraphIdx, setSelectedParagraphIdx] = useState<number | null>(null);
  const [selectedParagraphText, setSelectedParagraphText] = useState<string>('');
  const [filterBySelectedLine, setFilterBySelectedLine] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState(username || 'Catatan Pribadi');

  // Text selection & Quote Share Card Modal
  const [selectionRange, setSelectionRange] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareQuoteText, setShareQuoteText] = useState('');
  const [shareCardStyle, setShareCardStyle] = useState<CardStyle>('obsidian');
  const [isCopied, setIsCopied] = useState(false);

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);

  // Sorted chapters for current project
  const projectChapters = useMemo(() => {
    if (!activeProject) return [];
    return chapters
      .filter((c) => c.projectId === activeProject.id)
      .sort((a, b) => {
        const isPrologA = a.title.toLowerCase().includes('prolog');
        const isPrologB = b.title.toLowerCase().includes('prolog');
        if (isPrologA && !isPrologB) return -1;
        if (!isPrologA && isPrologB) return 1;

        const isEpilogA = a.title.toLowerCase().includes('epilog');
        const isEpilogB = b.title.toLowerCase().includes('epilog');
        if (isEpilogA && !isEpilogB) return 1;
        if (!isEpilogA && isEpilogB) return -1;

        return (a.chapterNumber || 0) - (b.chapterNumber || 0);
      });
  }, [chapters, activeProject]);

  const currentChapterIndex = useMemo(() => {
    return projectChapters.findIndex((c) => c.id === activeChapterId);
  }, [projectChapters, activeChapterId]);

  const activeChapter = projectChapters[currentChapterIndex] || projectChapters[0];

  // Save comments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jaeyyyiii_author_reader_notes_v2', JSON.stringify(comments));
    } catch (e) {
      console.error(e);
    }
  }, [comments]);

  // Reset page when chapter changes
  useEffect(() => {
    setCurrentPage(1);
    contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeChapter?.id]);

  // Track scroll reading progress in scrolling mode
  useEffect(() => {
    if (readMode !== 'scrolling') return;
    const handleScroll = () => {
      const el = contentContainerRef.current;
      if (!el) return;
      const total = el.scrollHeight - el.clientHeight;
      if (total <= 0) {
        setReadingProgress(100);
      } else {
        const current = el.scrollTop;
        const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
        setReadingProgress(pct);
      }
    };

    const container = contentContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeChapter, readMode]);

  // Parse HTML content into clean readable paragraphs / lines
  const parsedParagraphs = useMemo(() => {
    if (!activeChapter || !activeChapter.content) {
      return ['Belum ada teks naskah untuk chapter ini. Silakan tulis di tab Editor.'];
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = activeChapter.content;

    // Check if there are block elements like p, div, blockquote, figure
    const blocks = Array.from(tempDiv.querySelectorAll('p, blockquote, figure, .scene-divider'));
    if (blocks.length > 0) {
      return blocks
        .map((b) => b.outerHTML)
        .filter((html) => html.trim().length > 0 && html !== '<p><br></p>');
    }

    // Fallback: split by newlines
    const textLines = tempDiv.innerText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return textLines.length > 0 ? textLines.map((t) => `<p>${t}</p>`) : ['Chapter ini masih kosong.'];
  }, [activeChapter]);

  // Paging division: ~3-4 paragraphs per page
  const paragraphsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(parsedParagraphs.length / paragraphsPerPage));

  const currentPageParagraphs = useMemo(() => {
    if (readMode === 'scrolling') return parsedParagraphs;
    const start = (currentPage - 1) * paragraphsPerPage;
    return parsedParagraphs.slice(start, start + paragraphsPerPage);
  }, [parsedParagraphs, readMode, currentPage]);

  // Keyboard navigation for Paging mode
  useEffect(() => {
    if (readMode !== 'paging') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (currentPage < totalPages) {
          setCurrentPage((p) => p + 1);
          contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPage > 1) {
          setCurrentPage((p) => p - 1);
          contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readMode, currentPage, totalPages]);

  // Detect selection for floating action popover
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionRange(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 3) {
      setSelectionRange(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRange({
        text,
        x: rect.left + rect.width / 2,
        y: Math.max(10, rect.top - 12),
      });
    } catch {
      setSelectionRange(null);
    }
  };

  const handleOpenShareCard = (textToShare?: string) => {
    const quote = textToShare || selectionRange?.text;
    if (!quote) return;
    setShareQuoteText(quote);
    setShowShareModal(true);
    setSelectionRange(null);
  };

  const handleCommentOnSelectedText = (textToComment?: string) => {
    const snippet = textToComment || selectionRange?.text;
    if (snippet) {
      setSelectedParagraphText(snippet);
      setSelectedParagraphIdx(999);
      setFilterBySelectedLine(true);
      setSelectionRange(null);
      commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add Comment (Card Ketikan)
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      showToast('Tuliskan catatan terlebih dahulu', 'error');
      return;
    }

    const newComment: LineComment = {
      id: 'c_' + Date.now(),
      chapterId: activeChapter?.id || '',
      paragraphIndex: selectedParagraphIdx ?? 0,
      quotedText: selectedParagraphText ? selectedParagraphText.slice(0, 160) : undefined,
      author: commentAuthor.trim() || username || 'Catatan Pribadi',
      content: newCommentText.trim(),
      timestamp: 'Baru saja',
      likes: 1,
      isLiked: true,
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText('');
    showToast('Card ketikan berhasil disimpan!');
  };

  // Like comment
  const handleToggleLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  };

  // Delete comment
  const handleDeleteComment = (id: string) => {
    requestConfirm({
      title: 'Hapus Card Ketikan',
      message: 'Hapus catatan komentar ketikan ini dari daftar eksplorasi?',
      confirmLabel: 'Hapus',
      onConfirm: () => {
        setComments((prev) => prev.filter((c) => c.id !== id));
        showToast('Card ketikan berhasil dihapus');
      },
    });
  };

  // Filtered comments for this chapter
  const chapterComments = useMemo(() => {
    return comments.filter(
      (c) => !c.chapterId || !activeChapter || c.chapterId === activeChapter.id
    );
  }, [comments, activeChapter]);

  const displayedComments = useMemo(() => {
    if (filterBySelectedLine && selectedParagraphText) {
      return chapterComments.filter((c) => c.quotedText === selectedParagraphText.slice(0, 160));
    }
    return chapterComments;
  }, [chapterComments, filterBySelectedLine, selectedParagraphText]);

  // Navigate chapters
  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      setActiveChapterId(projectChapters[currentChapterIndex - 1].id);
      contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < projectChapters.length - 1) {
      setActiveChapterId(projectChapters[currentChapterIndex + 1].id);
      contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Copy share card text
  const handleCopyCardText = () => {
    const text = `"${shareQuoteText}"\n\n— Dari novel "${activeProject?.title || 'Karya'}" (${activeChapter?.title || 'Chapter'})\nOleh: ${activeProject?.authorName || 'Penulis'}\nBaca di: jaeyyyiii`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast('Teks kutipan berhasil disalin ke clipboard!');
  };

  // Download card as high-res PNG via HTML5 Canvas
  const handleDownloadCardImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgStyles = {
      obsidian: { bg1: '#09090b', bg2: '#18181b', accent: '#f59e0b', text: '#f3f4f6', sub: '#a1a1aa' },
      maroon: { bg1: '#1b0509', bg2: '#3d0c15', accent: '#fb7185', text: '#fff1f2', sub: '#fecdd3' },
      parchment: { bg1: '#faf7ee', bg2: '#f3ece0', accent: '#b45309', text: '#27272a', sub: '#71717a' },
      emerald: { bg1: '#041610', bg2: '#062d21', accent: '#34d399', text: '#ecfdf5', sub: '#a7f3d0' },
      violet: { bg1: '#12071f', bg2: '#280c47', accent: '#c084fc', text: '#faf5ff', sub: '#d8b4fe' },
    };

    const s = bgStyles[shareCardStyle];

    const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
    grad.addColorStop(0, s.bg1);
    grad.addColorStop(1, s.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.strokeStyle = s.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, 1000, 1270);

    ctx.strokeStyle = s.accent + '44';
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, 970, 1240);

    ctx.fillStyle = s.accent;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ JAEYYYIII · LITERARY UNIVERSE ✦', 540, 140);

    ctx.fillStyle = s.accent;
    ctx.font = 'italic 120px Georgia, serif';
    ctx.fillText('“', 540, 290);

    ctx.fillStyle = s.text;
    ctx.font = 'italic 38px Georgia, serif';
    ctx.textAlign = 'center';

    const words = shareQuoteText.split(' ');
    let line = '';
    const lines: string[] = [];
    const maxWidth = 840;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    const lineHeight = 56;
    const startY = 380 + Math.max(0, (500 - lines.length * lineHeight) / 2);
    lines.slice(0, 10).forEach((l, idx) => {
      ctx.fillText(l, 540, startY + idx * lineHeight);
    });

    ctx.fillStyle = s.accent;
    ctx.font = 'italic 100px Georgia, serif';
    ctx.fillText('”', 540, Math.min(960, startY + lines.length * lineHeight + 50));

    ctx.strokeStyle = s.accent + '66';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, 1040);
    ctx.lineTo(740, 1040);
    ctx.stroke();

    ctx.fillStyle = s.accent;
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText(activeProject?.title || 'Karya Naskah', 540, 1100);

    ctx.fillStyle = s.sub;
    ctx.font = '26px sans-serif';
    ctx.fillText(
      `${activeChapter?.title || 'Chapter'} · Oleh ${activeProject?.authorName || 'Shandra Cahya'}`,
      540,
      1150
    );

    ctx.font = '20px monospace';
    ctx.fillStyle = s.accent + 'aa';
    ctx.fillText(`©${activeProject?.copyrightYear || '2026'} · jaeyyyiii`, 540, 1220);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `quote_${(activeProject?.title || 'novel').toLowerCase().replace(/\s+/g, '_')}.png`;
    a.click();
    showToast('Kartu kutipan berhasil diunduh (format PNG kualitas tinggi)!');
  };

  // Reader theme colors
  const themeClasses = useMemo(() => {
    switch (readerTheme) {
      case 'wattpad-dark':
        return 'bg-[#0b0c0e] text-[#e4e5e7] border-[#222429]';
      case 'wattpad-cream':
        return 'bg-[#fbf7ed] text-[#2b2b2b] border-[#e2dcd0]';
      case 'wattpad-white':
        return 'bg-[#ffffff] text-[#1a1a1a] border-[#e5e7eb]';
      default:
        return 'bg-[var(--app-bg)] text-[var(--app-text)] border-[var(--app-border)]';
    }
  }, [readerTheme]);

  const activeFontObj = useMemo(() => {
    return FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];
  }, [selectedFont]);

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4.25rem)] overflow-hidden transition-colors ${themeClasses}`}>
      {/* Top Wattpad Reader Bar (Hapus waktu baca, vote, dan emot komentar) */}
      <header className="border-b border-inherit px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md bg-inherit/90 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setActiveTab('editor')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-inherit hover:border-[var(--app-accent)] text-xs font-semibold hover:text-[var(--app-accent)] transition-all shrink-0"
            title="Kembali ke Editor Naskah"
          >
            <Feather className="w-3.5 h-3.5 text-[var(--app-accent)]" />
            <span className="hidden sm:inline">Editor</span>
          </button>

          <div className="h-4 w-px bg-inherit opacity-40 shrink-0" />

          {/* Chapter Selector Dropdown */}
          <div className="flex items-center gap-1.5 min-w-0">
            <BookMarked className="w-4 h-4 text-[var(--app-accent)] shrink-0 hidden xs:inline" />
            <select
              value={activeChapter?.id || ''}
              onChange={(e) => {
                setActiveChapterId(e.target.value);
                setCurrentPage(1);
                contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-inherit border border-inherit rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-[var(--app-accent)] max-w-[150px] sm:max-w-[260px] truncate"
            >
              {projectChapters.map((c) => (
                <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                  {c.title || `Chapter ${c.chapterNumber}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Mode Baca (Scrolling / Paging) & Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mode Baca Toggle: Scrolling vs Paging */}
          <div className="inline-flex items-center p-0.5 rounded-xl border border-inherit bg-inherit">
            <button
              type="button"
              onClick={() => {
                setReadMode('scrolling');
                showToast('Mode Baca: Gulir Kontinu (Scrolling)');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                readMode === 'scrolling'
                  ? 'bg-[var(--app-accent)] text-black shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100 text-inherit'
              }`}
              title="Mode Baca: Gulir Kontinu (Scrolling)"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gulir</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setReadMode('paging');
                setCurrentPage(1);
                showToast('Mode Baca: Halaman demi Halaman (Paging)');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                readMode === 'paging'
                  ? 'bg-[var(--app-accent)] text-black shadow-xs font-bold'
                  : 'opacity-70 hover:opacity-100 text-inherit'
              }`}
              title="Mode Baca: Halaman demi Halaman (Paging)"
            >
              <BookText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paging</span>
            </button>
          </div>

          {/* Quick jump to Card Komentar */}
          <button
            onClick={() => commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-inherit hover:border-[var(--app-accent)] text-xs font-medium transition-all"
            title="Buka Card Komentar & Catatan"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--app-accent)]" />
            <span className="text-[10px] font-bold hidden sm:inline">Komentar</span>
          </button>

          {/* Settings Menu Toggle (Font, Ukuran, Tema) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-xl border transition-colors ${
              showSettings
                ? 'border-[var(--app-accent)] bg-[var(--app-accent-bg)] text-[var(--app-accent)]'
                : 'border-inherit text-inherit hover:border-[var(--app-accent)]'
            }`}
            title="Pengaturan Bentuk Font, Ukuran & Tema"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Reading Progress Indicator Bar in Scrolling Mode */}
      {readMode === 'scrolling' && (
        <div className="h-0.5 w-full bg-inherit/30 shrink-0 relative overflow-hidden">
          <div
            className="h-full bg-[var(--app-accent)] transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Reader Settings Drawer (collapsible) */}
      {showSettings && (
        <div className="border-b border-inherit bg-inherit/95 px-4 sm:px-6 py-3.5 shrink-0 shadow-lg animate-in slide-in-from-top-2 duration-150 z-20">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* 1. Bentuk Font (Daftar font yang persis sama dengan di Editor) */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-inherit opacity-75 block">
                Bentuk Font:
              </label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full bg-inherit border border-inherit rounded-xl px-2.5 py-1.5 text-xs text-inherit focus:outline-none focus:border-[var(--app-accent)]"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Ukuran Font (Batas Terkecil 10px) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-inherit opacity-75">
                <span>Ukuran Font:</span>
                <span className="font-mono">{fontSize}px (Min 10px)</span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.max(10, s - 1))}
                  className="w-8 h-8 rounded-xl border border-inherit flex items-center justify-center font-bold hover:border-[var(--app-accent)] shrink-0"
                >
                  A-
                </button>
                <input
                  type="range"
                  min="10"
                  max="26"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full accent-[var(--app-accent)] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                  className="w-8 h-8 rounded-xl border border-inherit flex items-center justify-center font-bold hover:border-[var(--app-accent)] shrink-0"
                >
                  A+
                </button>
              </div>
            </div>

            {/* 3. Tema Warna Tampilan */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-inherit opacity-75 block">
                Tema Membaca:
              </label>
              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-xl border border-inherit bg-inherit text-center">
                <button
                  onClick={() => setReaderTheme('default')}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    readerTheme === 'default' ? 'bg-[var(--app-accent)] text-black font-bold' : 'opacity-70'
                  }`}
                >
                  Studio
                </button>
                <button
                  onClick={() => setReaderTheme('wattpad-dark')}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    readerTheme === 'wattpad-dark' ? 'bg-neutral-800 text-amber-300 font-bold' : 'opacity-70'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setReaderTheme('wattpad-cream')}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    readerTheme === 'wattpad-cream' ? 'bg-[#e2dcd0] text-black font-bold' : 'opacity-70'
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => setReaderTheme('wattpad-white')}
                  className={`py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                    readerTheme === 'wattpad-white' ? 'bg-white text-black font-bold shadow-xs' : 'opacity-70'
                  }`}
                >
                  Putih
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Popover on Highlighted Text */}
      {selectionRange && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full mb-2 flex items-center gap-1 p-1 rounded-2xl bg-black/90 text-white backdrop-blur-md border border-[var(--app-accent)]/50 shadow-2xl animate-in zoom-in-95 duration-100"
          style={{ left: `${selectionRange.x}px`, top: `${selectionRange.y}px` }}
        >
          <button
            onClick={() => handleOpenShareCard()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--app-accent)] text-black font-bold text-xs hover:opacity-90 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Share Card Kutipan</span>
          </button>
          <button
            onClick={() => handleCommentOnSelectedText()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--app-accent)]" />
            <span>Komentari</span>
          </button>
        </div>
      )}

      {/* Main Reader Scroll View */}
      <div
        ref={contentContainerRef}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-8 scroll-smooth"
      >
        <article className="max-w-2xl mx-auto space-y-6">
          {/* Chapter Title Banner (Tanpa waktu baca, vote, dan emot komentar) */}
          <div className="pb-6 border-b border-inherit space-y-3">
            <div className="flex items-center gap-3">
              {activeProject?.coverUrl && (
                <div className="w-14 h-20 rounded-lg overflow-hidden border border-inherit shadow-md shrink-0 bg-neutral-900">
                  <img
                    src={activeProject.coverUrl}
                    alt={activeProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--app-accent)] font-bold">
                  {activeProject?.genre} · {activeProject?.status || 'Sedang Ditulis'}
                </div>
                <h2 className="text-sm font-bold text-inherit opacity-80 truncate">
                  {activeProject?.title || 'Judul Naskah'}
                </h2>
                <p className="text-xs text-inherit opacity-60">
                  Karya <strong className="text-inherit opacity-90">{activeProject?.authorName || 'Shandra Cahya'}</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-inherit leading-tight"
                style={{ fontFamily: activeFontObj.inline }}
              >
                {activeChapter?.title || `Chapter ${activeChapter?.chapterNumber || 1}`}
              </h1>

              {/* In Paging mode: show Page indicator at top */}
              {readMode === 'paging' && (
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full border border-inherit bg-inherit shrink-0">
                  Hal {currentPage} / {totalPages}
                </span>
              )}
            </div>
          </div>

          {/* Chapter Paragraphs (Rendered for Scrolling OR Paging) */}
          <div
            className={`space-y-6 leading-relaxed selection:bg-[var(--app-accent)] selection:text-black ${activeFontObj.className}`}
            style={{
              fontFamily: activeFontObj.inline,
              fontSize: `${fontSize}px`,
              lineHeight: 1.85,
            }}
          >
            {currentPageParagraphs.map((paragraphHtml, idx) => {
              const actualIdx = readMode === 'paging' ? (currentPage - 1) * paragraphsPerPage + idx : idx;

              const tempEl = document.createElement('div');
              tempEl.innerHTML = paragraphHtml;
              const textContent = tempEl.innerText.trim();

              const lineComments = chapterComments.filter(
                (c) =>
                  c.paragraphIndex === actualIdx ||
                  (c.quotedText && textContent.includes(c.quotedText.slice(0, 40)))
              );

              const isSelectedLine =
                selectedParagraphIdx === actualIdx ||
                (selectedParagraphText && textContent.includes(selectedParagraphText.slice(0, 40)));

              return (
                <div
                  key={actualIdx}
                  className={`group relative rounded-xl p-1.5 transition-all ${
                    isSelectedLine
                      ? 'bg-[var(--app-accent)]/10 ring-1 ring-[var(--app-accent)]/40'
                      : 'hover:bg-inherit/40'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: paragraphHtml }}
                    className="cursor-text"
                  />

                  {/* Inline Comment Bubble Button (on right edge) */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 sm:opacity-80 transition-opacity flex items-center gap-1 z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedParagraphIdx(actualIdx);
                        setSelectedParagraphText(textContent.slice(0, 140));
                        setFilterBySelectedLine(true);
                        commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-sm transition-transform active:scale-90 ${
                        lineComments.length > 0
                          ? 'bg-[var(--app-accent)] text-black'
                          : 'bg-inherit border border-inherit text-inherit opacity-70 hover:opacity-100'
                      }`}
                      title={
                        lineComments.length > 0
                          ? `${lineComments.length} catatan pada baris ini`
                          : 'Beri catatan pada baris ini'
                      }
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>{lineComments.length > 0 ? lineComments.length : '+'}</span>
                    </button>

                    {textContent.length > 10 && (
                      <button
                        type="button"
                        onClick={() => handleOpenShareCard(textContent)}
                        className="p-1 rounded-full bg-inherit border border-inherit text-inherit opacity-60 hover:opacity-100 hover:text-[var(--app-accent)] transition-colors shadow-2xs hidden sm:flex"
                        title="Buat Share Card Kutipan dari baris ini"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paging Mode: Page-by-Page Navigator */}
          {readMode === 'paging' && (
            <div className="pt-6 border-t border-inherit flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((p) => p - 1);
                    contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-inherit text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--app-accent)] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Halaman Sebelumnya</span>
              </button>

              <span className="text-xs font-mono font-bold text-inherit">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage((p) => p + 1);
                    contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-inherit text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--app-accent)] transition-all"
              >
                <span>Halaman Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chapter Navigation & Share Card Quick Trigger (Tanpa vote) */}
          <div className="pt-8 pb-4 border-t border-inherit space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handlePrevChapter}
                disabled={currentChapterIndex <= 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-inherit text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--app-accent)] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Chapter Sebelumnya</span>
                <span className="sm:hidden">Sebelumnya</span>
              </button>

              <button
                onClick={() => {
                  const firstQuote = parsedParagraphs[0]?.replace(/<[^>]+>/g, '') || 'Kutipan cerita';
                  handleOpenShareCard(firstQuote);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-inherit hover:border-[var(--app-accent)] text-xs font-semibold transition-all hover:text-[var(--app-accent)]"
              >
                <Share2 className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                <span>Share Card Kutipan</span>
              </button>

              <button
                onClick={handleNextChapter}
                disabled={currentChapterIndex >= projectChapters.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--app-accent)] text-black font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-95 transition-all shadow-md ml-auto"
              >
                <span>Chapter Selanjutnya</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* ==============================================================
              SUB-FITUR KOMENTAR / CATATAN (GAYA CARD KETIKAN EKSPLORATIF)
              ============================================================== */}
          <section
            ref={commentsSectionRef}
            className="pt-8 border-t-2 border-inherit space-y-5 pb-16"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--app-accent)]" />
                <h3 className="text-base sm:text-lg font-extrabold text-inherit">
                  Card Komentar &amp; Catatan Eksplorasi (Per Baris)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-bold border border-[var(--app-accent)]/30">
                {displayedComments.length} Catatan
              </span>
            </div>

            {/* Selected Line Snippet Indicator */}
            {selectedParagraphText && (
              <div className="p-3 rounded-xl border border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 flex items-start justify-between gap-3 animate-in fade-in">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--app-accent)]">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Baris yang sedang dikomentari:</span>
                  </div>
                  <p className="italic text-inherit opacity-90 line-clamp-2">
                    "{selectedParagraphText}"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedParagraphIdx(null);
                    setSelectedParagraphText('');
                    setFilterBySelectedLine(false);
                  }}
                  className="p-1 rounded-lg hover:bg-black/20 text-inherit opacity-70 hover:opacity-100"
                  title="Hapus pilihan baris"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Filter Toggle: All vs Selected Line */}
            <div className="flex items-center gap-2 border-b border-inherit pb-2 text-xs">
              <button
                type="button"
                onClick={() => setFilterBySelectedLine(false)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  !filterBySelectedLine
                    ? 'bg-[var(--app-accent)] text-black shadow-xs'
                    : 'text-inherit opacity-70 hover:opacity-100'
                }`}
              >
                Semua Card ({chapterComments.length})
              </button>
              {selectedParagraphText && (
                <button
                  type="button"
                  onClick={() => setFilterBySelectedLine(true)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    filterBySelectedLine
                      ? 'bg-[var(--app-accent)] text-black shadow-xs'
                      : 'text-inherit opacity-70 hover:opacity-100'
                  }`}
                >
                  Hanya Baris Ini
                </button>
              )}
            </div>

            {/* TYPEWRITER COMMENT INPUT FORM */}
            <form onSubmit={handleAddComment} className="p-4 rounded-2xl border border-inherit bg-inherit/70 shadow-sm space-y-3 font-mono">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--app-accent)]">
                    Penulis Card:
                  </span>
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="Nama / Label Catatan"
                    className="bg-inherit border-b border-inherit px-2 py-0.5 text-xs text-inherit focus:outline-none focus:border-[var(--app-accent)] w-36 sm:w-48 font-mono"
                  />
                </div>
                <span className="text-[10px] text-inherit opacity-60">Format Card Ketikan</span>
              </div>

              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={
                  selectedParagraphText
                    ? 'Tuliskan catatan atau reaksi eksploratif untuk baris ini...'
                    : 'Tuliskan catatan eksplorasi atau revisi untuk bab ini...'
                }
                className="w-full bg-inherit border border-inherit rounded-xl p-3 text-xs text-inherit focus:outline-none focus:border-[var(--app-accent)] resize-y leading-relaxed"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-inherit opacity-60 font-sans hidden sm:block">
                  Tips: Anda bisa klik tombol (+) di samping kanan baris kalimat mana pun untuk menyisipkan catatan spesifik pada baris itu.
                </p>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--app-accent)] text-black font-bold text-xs hover:opacity-90 transition-all shadow-xs ml-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan Card Ketikan</span>
                </button>
              </div>
            </form>

            {/* LIST OF COMMENTS IN VINTAGE TYPEWRITER CARD STYLE ("CARD KETIKAN") */}
            <div className="space-y-3 pt-2">
              {displayedComments.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-inherit opacity-70 space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-50 mb-2 text-[var(--app-accent)]" />
                  <p className="text-xs font-semibold">Belum ada card ketikan untuk bagian ini.</p>
                  <p className="text-[10px]">Tuliskan catatan atau reaksi eksploratif pertamamu pada formulir di atas!</p>
                </div>
              ) : (
                displayedComments.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-inherit bg-inherit/40 shadow-xs space-y-2.5 transition-all hover:border-[var(--app-accent)]/50 relative group"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-inherit/40 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--app-accent)]/20 text-[var(--app-accent)] flex items-center justify-center text-xs font-bold font-mono">
                          {item.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold font-mono text-inherit">
                          {item.author}
                        </span>
                        <span className="text-[10px] font-mono text-inherit opacity-50">
                          · {item.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(item.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                            item.isLiked
                              ? 'text-rose-500 bg-rose-500/10 font-bold'
                              : 'text-inherit opacity-60 hover:opacity-100 hover:text-rose-500'
                          }`}
                          title="Tandai suka / penting"
                        >
                          <Heart className={`w-3 h-3 ${item.isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{item.likes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(item.id)}
                          className="p-1 rounded-lg text-inherit opacity-40 hover:opacity-100 hover:text-red-400 transition-colors"
                          title="Hapus card ketikan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {item.quotedText && (
                      <div className="p-2 rounded-lg bg-inherit/60 border-l-2 border-[var(--app-accent)] text-[10px] italic text-inherit opacity-85 font-serif">
                        "{item.quotedText}"
                      </div>
                    )}

                    <p className="text-xs sm:text-sm font-mono text-inherit leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>
      </div>

      {/* ==============================================================
          SHARE CARD KUTIPAN MODAL (WATT PAD & KINDLE QUOTE SHARE CARD)
          ============================================================== */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 md:p-6 shadow-2xl text-[var(--app-text)] my-auto max-h-[92dvh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--app-accent)]" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Share Card Kutipan Novel
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0 pr-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--app-text-muted)]">
                  Pilih Tema Kartu:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShareCardStyle('obsidian')}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                      shareCardStyle === 'obsidian'
                        ? 'border-amber-400 bg-amber-400/20 text-amber-300 ring-1 ring-amber-400'
                        : 'border-[var(--app-border)] bg-black/40 text-[var(--app-text-muted)]'
                    }`}
                  >
                    Obsidian
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareCardStyle('maroon')}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                      shareCardStyle === 'maroon'
                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 ring-1 ring-rose-400'
                        : 'border-[var(--app-border)] bg-rose-950/20 text-[var(--app-text-muted)]'
                    }`}
                  >
                    Maroon
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareCardStyle('parchment')}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                      shareCardStyle === 'parchment'
                        ? 'border-amber-600 bg-amber-100 text-stone-900 ring-1 ring-amber-600'
                        : 'border-[var(--app-border)] bg-amber-50/10 text-[var(--app-text-muted)]'
                    }`}
                  >
                    Vintage
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareCardStyle('emerald')}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                      shareCardStyle === 'emerald'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400'
                        : 'border-[var(--app-border)] bg-emerald-950/20 text-[var(--app-text-muted)]'
                    }`}
                  >
                    Emerald
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareCardStyle('violet')}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all ${
                      shareCardStyle === 'violet'
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300 ring-1 ring-purple-400'
                        : 'border-[var(--app-border)] bg-purple-950/20 text-[var(--app-text-muted)]'
                    }`}
                  >
                    Violet
                  </button>
                </div>
              </div>

              <div
                className={`p-6 sm:p-8 rounded-2xl border transition-all shadow-xl space-y-4 relative overflow-hidden ${
                  shareCardStyle === 'obsidian'
                    ? 'bg-gradient-to-b from-[#0a0a0c] to-[#18181b] text-neutral-100 border-amber-400/40'
                    : shareCardStyle === 'maroon'
                    ? 'bg-gradient-to-b from-[#1b0509] to-[#360912] text-rose-50 border-rose-400/40'
                    : shareCardStyle === 'parchment'
                    ? 'bg-gradient-to-b from-[#FAF7EE] to-[#EFE8DA] text-neutral-900 border-amber-700/30'
                    : shareCardStyle === 'emerald'
                    ? 'bg-gradient-to-b from-[#03150f] to-[#08291f] text-emerald-50 border-emerald-400/40'
                    : 'bg-gradient-to-b from-[#11051c] to-[#250b3d] text-purple-50 border-purple-400/40'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase opacity-75">
                  <span>jaeyyyiii · Literary Universe</span>
                  <span>✦</span>
                </div>

                <div className="space-y-2 py-2">
                  <span className="text-3xl font-serif text-[var(--app-accent)] opacity-80 leading-none block">
                    “
                  </span>
                  <p className="text-base sm:text-lg font-serif italic font-medium leading-relaxed px-2">
                    {shareQuoteText}
                  </p>
                  <span className="text-3xl font-serif text-[var(--app-accent)] opacity-80 leading-none block text-right">
                    ”
                  </span>
                </div>

                <div className="pt-3 border-t border-current/20 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold font-serif truncate">
                      {activeProject?.title || 'Judul Naskah'}
                    </h4>
                    <p className="text-[10px] opacity-75 truncate">
                      {activeChapter?.title || 'Chapter'} · Oleh {activeProject?.authorName || 'Shandra Cahya'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono opacity-60 shrink-0">
                    ©{activeProject?.copyrightYear || '2026'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--app-text-muted)]">
                  Edit Kutipan:
                </label>
                <textarea
                  rows={2}
                  value={shareQuoteText}
                  onChange={(e) => setShareQuoteText(e.target.value)}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[var(--app-border)] shrink-0">
              <button
                type="button"
                onClick={handleCopyCardText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] hover:border-[var(--app-accent)] text-xs font-semibold text-[var(--app-text)] transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCardImage}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--app-accent)] text-black font-bold text-xs hover:opacity-90 transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Unduh Gambar (.PNG)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
