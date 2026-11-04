import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNovel } from '../../context/NovelContext';
import {
  ArrowLeft,
  List,
  Type,
  Sparkles,
  Download,
  Copy,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  ScrollText,
  BookText,
  Eye,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  RotateCcw,
} from 'lucide-react';

type ReaderTheme = 'default' | 'wattpad-dark' | 'wattpad-cream' | 'wattpad-white';
type ReadMode = 'scrolling' | 'paging';
type CardStyle = 'obsidian' | 'maroon' | 'parchment' | 'emerald' | 'violet';

// Editor font options for identical typography
const FONT_OPTIONS: { id: string; label: string; inline: string; className: string }[] = [
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond (Elegan)', inline: "'Cormorant Garamond', 'EB Garamond', Garamond, 'Times New Roman', Georgia, serif", className: 'font-cormorant' },
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
    updateChapter,
    setActiveTab,
    typesetting,
    showToast,
  } = useNovel();

  // Reader Preferences
  const [readMode, setReadMode] = useState<ReadMode>('paging');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('wattpad-dark');
  const [selectedFont, setSelectedFont] = useState<string>(typesetting.fontFamily || 'EB Garamond');
  const [fontSize, setFontSize] = useState<number>(Math.max(10, typesetting.fontSize || 18));
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Paging state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageTurnAnimation, setPageTurnAnimation] = useState<'next' | 'prev' | null>(null);

  // Touch gesture tracking for book-page swipe
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

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

  // Paging division: ~3 paragraphs per page for natural book-like density
  const paragraphsPerPage = 3;
  const totalPages = Math.max(1, Math.ceil(parsedParagraphs.length / paragraphsPerPage));

  const currentPageParagraphs = useMemo(() => {
    if (readMode === 'scrolling') return parsedParagraphs;
    const start = (currentPage - 1) * paragraphsPerPage;
    return parsedParagraphs.slice(start, start + paragraphsPerPage);
  }, [parsedParagraphs, readMode, currentPage]);

  // Turn Page handlers with animation
  const flipToNextPage = () => {
    if (currentPage < totalPages) {
      setPageTurnAnimation('next');
      setTimeout(() => {
        setCurrentPage((p) => p + 1);
        setPageTurnAnimation(null);
        contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 160);
    } else if (currentChapterIndex < projectChapters.length - 1) {
      // Last page of current chapter: advance to next chapter
      setActiveChapterId(projectChapters[currentChapterIndex + 1].id);
      setCurrentPage(1);
      showToast('Beralih ke chapter berikutnya');
    }
  };

  const flipToPrevPage = () => {
    if (currentPage > 1) {
      setPageTurnAnimation('prev');
      setTimeout(() => {
        setCurrentPage((p) => p - 1);
        setPageTurnAnimation(null);
        contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 160);
    } else if (currentChapterIndex > 0) {
      // First page: return to previous chapter
      setActiveChapterId(projectChapters[currentChapterIndex - 1].id);
      setCurrentPage(1);
      showToast('Kembali ke chapter sebelumnya');
    }
  };

  // Keyboard navigation for Paging mode (Arrow keys)
  useEffect(() => {
    if (readMode !== 'paging') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        flipToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        flipToPrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readMode, currentPage, totalPages, currentChapterIndex, projectChapters]);

  // Touch Swipe gestures (Buka buku pake geser jari / swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (readMode !== 'paging') return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (readMode !== 'paging' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    // Must be primarily horizontal swipe
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && elapsed < 800) {
      if (deltaX < 0) {
        // Swiped Left -> Next Page
        flipToNextPage();
      } else {
        // Swiped Right -> Previous Page
        flipToPrevPage();
      }
    }
  };

  // Screen Edge Tap Zones (Sentuh sisi kanan buka halaman selanjutnya, sentuh sisi kiri buka sebelumnya)
  const handlePageAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readMode !== 'paging') return;
    // Don't turn page if user is selecting text or clicking buttons
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, select')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX > width * 0.7) {
      // Right 30% -> Next Page
      flipToNextPage();
    } else if (clickX < width * 0.3) {
      // Left 30% -> Prev Page
      flipToPrevPage();
    }
  };

  // Banner image upload handler (Gambar Pendukung)
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChapter) return;
    if (!file.type.startsWith('image/')) {
      showToast('Pilih file gambar yang valid (JPG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateChapter(activeChapter.id, { bannerUrl: reader.result });
        showToast('Gambar pendukung bab berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveBanner = () => {
    if (!activeChapter) return;
    updateChapter(activeChapter.id, { bannerUrl: undefined });
    showToast('Gambar pendukung dihapus');
  };

  // Detect selection for floating action popover
  const handleSelectionDetect = () => {
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
        return 'bg-[#0b0c0e] text-[#f0f0f2] border-[#222429]';
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

  // Active banner image (either uploaded chapter banner or fallback to project cover)
  const bannerImageSrc = activeChapter?.bannerUrl || activeProject?.coverUrl;

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4.25rem)] overflow-hidden transition-colors ${themeClasses}`}>
      {/* ==============================================================
          TOP BAR (Wattpad Reader Navigation matching reference image)
          [←]   [PARANOIR]                  [Aa]  [daftar chapter list]
          ============================================================== */}
      <header className="border-b border-inherit px-3 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md bg-inherit/90 z-30">
        {/* Left: Back button + Book Title in uppercase */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setActiveTab('editor')}
            className="p-1.5 rounded-xl hover:bg-white/10 text-inherit transition-colors shrink-0"
            title="Kembali ke Editor Naskah"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide truncate text-inherit">
            {activeProject?.title || 'PARANOIR'}
          </h2>
        </div>

        {/* Right: Page Settings (Aa) & Daftar Chapter Menu List */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Settings Trigger (Aa) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center justify-center px-2.5 py-1.5 rounded-xl border text-sm font-serif font-bold transition-all ${
              showSettings
                ? 'border-[var(--app-accent)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-xs'
                : 'border-inherit hover:border-[var(--app-accent)] text-inherit'
            }`}
            title="Page setting: Ukuran Font, Jenis Font, Scroll/Paging & Tema"
          >
            <span>Aa</span>
          </button>

          {/* Daftar Chapter Menu Drawer Trigger */}
          <button
            onClick={() => setShowChapterDrawer(true)}
            className="p-1.5 rounded-xl border border-inherit hover:border-[var(--app-accent)] text-inherit hover:text-[var(--app-accent)] transition-all shrink-0"
            title="Buka Daftar Chapter"
          >
            <List className="w-5 h-5 stroke-[2.2]" />
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

      {/* ==============================================================
          PAGE SETTING DRAWER (Aa)
          Ukuran font, jenis font, page setting (scroll/paging), tema app
          ============================================================== */}
      {showSettings && (
        <div className="border-b border-inherit bg-inherit/98 px-4 sm:px-6 py-4 shrink-0 shadow-2xl animate-in slide-in-from-top-2 duration-150 z-30">
          <div className="max-w-2xl mx-auto space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-inherit/40 pb-2">
              <span className="font-extrabold text-xs uppercase tracking-wider text-[var(--app-accent)]">
                Pengaturan Tampilan Baca (Page Setting)
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-black/20 text-inherit opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Page Setting (Mode Baca: Scroll vs Paging Geser Buku) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-inherit opacity-75 block">
                  Mode Baca:
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl border border-inherit bg-inherit">
                  <button
                    type="button"
                    onClick={() => {
                      setReadMode('scrolling');
                      showToast('Mode Baca: Gulir (Scroll)');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      readMode === 'scrolling'
                        ? 'bg-[var(--app-accent)] text-black font-bold shadow-xs'
                        : 'opacity-70 hover:opacity-100 text-inherit'
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>Scroll</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReadMode('paging');
                      setCurrentPage(1);
                      showToast('Mode Paging: Geser / Sentuh layar untuk buka buku');
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      readMode === 'paging'
                        ? 'bg-[var(--app-accent)] text-black font-bold shadow-xs'
                        : 'opacity-70 hover:opacity-100 text-inherit'
                    }`}
                  >
                    <BookText className="w-3.5 h-3.5" />
                    <span>Paging</span>
                  </button>
                </div>
                <p className="text-[10px] text-inherit opacity-60">
                  {readMode === 'paging'
                    ? '💡 Paging: sentuh sisi layar atau swipe pake tangan kayak buka buku.'
                    : '💡 Scroll: membaca bergulir vertikal tanpa jeda.'}
                </p>
              </div>

              {/* 2. Jenis Font (Daftar font yang persis sama dengan Editor) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-inherit opacity-75 block">
                  Bentuk / Jenis Font:
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full bg-inherit border border-inherit rounded-xl px-2.5 py-2 text-xs text-inherit focus:outline-none focus:border-[var(--app-accent)]"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id} className="bg-neutral-900 text-white">
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Ukuran Font (Min 10px) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-inherit opacity-75">
                  <span>Ukuran Font:</span>
                  <span className="font-mono">{fontSize}px (Min 10)</span>
                </div>
                <div className="flex items-center gap-2">
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
                    max="28"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full accent-[var(--app-accent)] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setFontSize((s) => Math.min(28, s + 1))}
                    className="w-8 h-8 rounded-xl border border-inherit flex items-center justify-center font-bold hover:border-[var(--app-accent)] shrink-0"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 4. Tema App / Tema Baca */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-inherit opacity-75 block">
                  Tema Tampilan:
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl border border-inherit bg-inherit text-center">
                  <button
                    onClick={() => setReaderTheme('wattpad-dark')}
                    className={`py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      readerTheme === 'wattpad-dark' ? 'bg-neutral-800 text-amber-300 font-bold ring-1 ring-amber-300' : 'opacity-70'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setReaderTheme('wattpad-cream')}
                    className={`py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      readerTheme === 'wattpad-cream' ? 'bg-[#e2dcd0] text-black font-bold ring-1 ring-amber-700' : 'opacity-70'
                    }`}
                  >
                    Sepia
                  </button>
                  <button
                    onClick={() => setReaderTheme('wattpad-white')}
                    className={`py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      readerTheme === 'wattpad-white' ? 'bg-white text-black font-bold shadow-xs' : 'opacity-70'
                    }`}
                  >
                    Putih
                  </button>
                  <button
                    onClick={() => setReaderTheme('default')}
                    className={`py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                      readerTheme === 'default' ? 'bg-[var(--app-accent)] text-black font-bold' : 'opacity-70'
                    }`}
                  >
                    Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          DAFTAR CHAPTER DRAWER (Slide-over drawer on right)
          ============================================================== */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs sm:max-w-sm h-full bg-[var(--app-card)] border-l border-[var(--app-border)] p-4 sm:p-5 flex flex-col text-[var(--app-text)] shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)] shrink-0">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[var(--app-accent)]" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Daftar Chapter
                </h3>
              </div>
              <button
                onClick={() => setShowChapterDrawer(false)}
                className="p-1 rounded-lg hover:bg-[var(--app-card-sub)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
              {projectChapters.map((chap, idx) => {
                const isActive = chap.id === activeChapter?.id;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      setCurrentPage(1);
                      setShowChapterDrawer(false);
                      contentContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? 'border-[var(--app-accent)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-bold shadow-xs'
                        : 'border-transparent hover:border-[var(--app-border)] bg-[var(--app-card-sub)] text-[var(--app-text)]'
                    }`}
                  >
                    <span className="truncate">
                      {chap.title || `Chapter ${chap.chapterNumber}`}
                    </span>
                    <span className="text-[10px] font-mono opacity-60 shrink-0">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Popover on Highlighted Text (Share Card Kutipan) */}
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
        </div>
      )}

      {/* ==============================================================
          MAIN READER VIEWPORT
          Touch Swipe + Edge Tap gestures for Paging Mode
          ============================================================== */}
      <div
        ref={contentContainerRef}
        onMouseUp={handleSelectionDetect}
        onTouchEnd={(e) => {
          handleTouchEnd(e);
          handleSelectionDetect();
        }}
        onTouchStart={handleTouchStart}
        onClick={handlePageAreaClick}
        className={`flex-1 overflow-y-auto scroll-smooth select-text relative ${
          readMode === 'paging' ? 'cursor-pointer touch-pan-y' : ''
        }`}
      >
        <article className="max-w-2xl mx-auto pb-16">
          {/* ==============================================================
              HERO HEADER: GAMBAR PENDUKUNG BAB
              Annotation: "upload field gambar pendukung"
              ============================================================== */}
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-neutral-900 border-b border-inherit/40 group">
            {bannerImageSrc ? (
              <img
                src={bannerImageSrc}
                alt="Gambar Pendukung Bab"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-950 text-neutral-400">
                <ImageIcon className="w-12 h-12 opacity-30" />
              </div>
            )}

            {/* Dark gradient fade over banner bottom for cinematic mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Banner upload trigger button overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-[10px] font-semibold border border-white/20 backdrop-blur-md transition-all shadow-md"
                title="Unggah Gambar Pendukung / Header Bab"
              >
                <Upload className="w-3 h-3 text-[var(--app-accent)]" />
                <span>{activeChapter?.bannerUrl ? 'Ganti Gambar' : 'Upload Gambar Pendukung'}</span>
              </button>
              {activeChapter?.bannerUrl && (
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="p-1.5 rounded-xl bg-red-600/80 hover:bg-red-700 text-white text-[10px] transition-all shadow-md"
                  title="Hapus gambar pendukung"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
            </div>
          </div>

          {/* ==============================================================
              CHAPTER TITLE & STATS COUNTERS
              PROLOGUE - The Last Archives (Draft)
              👁 5   ⭐ 0   💬 0
              ============================================================== */}
          <div className="px-5 sm:px-8 pt-6 pb-6 text-center space-y-3">
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-inherit leading-snug"
              style={{ fontFamily: activeFontObj.inline }}
            >
              {activeChapter?.title || 'PROLOGUE - The Last Archives'} (Draft)
            </h1>

            {/* Wattpad Style Simple Stats Icons: 👁 5   ⭐ 0   💬 0 */}
            <div className="flex items-center justify-center gap-4 text-xs text-inherit opacity-75 font-mono">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>5</span>
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                <span>0</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>0</span>
              </span>
            </div>
          </div>

          {/* ==============================================================
              CHAPTER MANUSCRIPT CONTENT BODY
              In Paging Mode: Touch Swipe / Edge Tap to flip pages
              ============================================================== */}
          <div
            className={`px-5 sm:px-8 space-y-6 leading-relaxed selection:bg-[var(--app-accent)] selection:text-black transition-opacity duration-150 ${
              pageTurnAnimation ? 'opacity-30' : 'opacity-100'
            } ${activeFontObj.className}`}
            style={{
              fontFamily: activeFontObj.inline,
              fontSize: `${fontSize}px`,
              lineHeight: 1.85,
            }}
          >
            {currentPageParagraphs.map((paragraphHtml, idx) => (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: paragraphHtml }}
                className="cursor-text"
              />
            ))}
          </div>

          {/* ==============================================================
              PAGING HINT & BOTTOM CHAPTER FLIP
              (No >> buttons, natural book tap & swipe navigation)
              ============================================================== */}
          {readMode === 'paging' ? (
            <div className="mt-12 px-5 sm:px-8 text-center space-y-3 select-none">
              <div className="flex items-center justify-center gap-3 text-xs font-mono text-inherit opacity-60">
                <span>Hal {currentPage} dari {totalPages}</span>
              </div>
              <p className="text-[10px] text-inherit opacity-50 italic">
                (Sentuh sisi kiri/kanan layar atau geser jari untuk membalik halaman)
              </p>
            </div>
          ) : (
            /* Scrolling Mode bottom chapter indicator */
            <div className="mt-12 px-5 sm:px-8 pt-6 border-t border-inherit/40 text-center text-xs text-inherit opacity-60">
              <span>Akhir dari {activeChapter?.title || 'Chapter'}</span>
            </div>
          )}
        </article>
      </div>

      {/* ==============================================================
          SHARE CARD KUTIPAN MODAL
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
