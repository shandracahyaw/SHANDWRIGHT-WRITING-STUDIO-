import React, { useState, useMemo } from 'react';
import { useNovel } from '../../context/NovelContext';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Printer,
  Maximize2,
  FileDown,
  Sparkles,
  Sliders,
  RotateCcw,
  Layers,
  X,
  FileText,
} from 'lucide-react';

export const BookPreviewView: React.FC = () => {
  const {
    activeProject,
    updateProject,
    projectArcs,
    projectChapters,
    updateChapter,
    typesetting,
    updateTypesetting,
    showToast,
  } = useNovel();

  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [singlePageIndex, setSinglePageIndex] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<'a5' | 'pocket' | 'trade'>('a5');
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'auto' | 'single' | 'spread'>('auto');

  // Build the book pages array:
  // Page 0: Title Page / Hal Judul
  // Page 1: Epigraph / Sinopsis Pembuka
  // Page 2..N: Chapters content divided into pages
  const bookPages = useMemo(() => {
    const pages: Array<{
      type: 'cover' | 'title' | 'epigraph' | 'arc' | 'chapter';
      arcTitle?: string;
      chapterTitle?: string;
      chapterNum?: number;
      chapterId?: string;
      paragraphs: string[];
      pageNumber: number;
    }> = [];

    let pNum = 1;

    // 0. Full Book Cover Preview Page (Sampul Buku)
    pages.push({
      type: 'cover',
      paragraphs: [],
      pageNumber: 0,
    });

    // 1. Title & Copyright Page
    pages.push({
      type: 'title',
      paragraphs: [],
      pageNumber: pNum++,
    });

    // 2. Epigraph / Sinopsis Premis
    pages.push({
      type: 'epigraph',
      paragraphs: [
        activeProject?.synopsis || 'Dunia telah lama melupakan belas kasihan.',
        '— Epigraf & Sinopsis Premis Buku',
      ],
      pageNumber: pNum++,
    });

    // Chapters chunking into pages (~220 - 340 words per page depending on size)
    const wordsPerPage = selectedFormat === 'pocket' ? 220 : selectedFormat === 'a5' ? 280 : 340;

    projectArcs.forEach((arc) => {
      const arcChaps = projectChapters.filter((c) => c.arcId === arc.id);
      if (arcChaps.length === 0) return;

      // Arc Opening Page
      pages.push({
        type: 'arc',
        arcTitle: arc.title,
        paragraphs: arc.description ? [arc.description] : [],
        pageNumber: pNum++,
      });

      arcChaps.forEach((chap) => {
        const rawParagraphs = chap.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
        if (rawParagraphs.length === 0) {
          pages.push({
            type: 'chapter',
            chapterTitle: chap.title,
            chapterNum: chap.chapterNumber,
            chapterId: chap.id,
            paragraphs: ['[Draf Bab Kosong]'],
            pageNumber: pNum++,
          });
          return;
        }

        let currentPageParagraphs: string[] = [];
        let currentWordTally = 0;

        rawParagraphs.forEach((para) => {
          const paraWords = para.trim().split(/\s+/).length;
          if (currentWordTally + paraWords > wordsPerPage && currentPageParagraphs.length > 0) {
            pages.push({
              type: 'chapter',
              chapterTitle: chap.title,
              chapterNum: chap.chapterNumber,
              chapterId: chap.id,
              paragraphs: currentPageParagraphs,
              pageNumber: pNum++,
            });
            currentPageParagraphs = [para];
            currentWordTally = paraWords;
          } else {
            currentPageParagraphs.push(para);
            currentWordTally += paraWords;
          }
        });

        if (currentPageParagraphs.length > 0) {
          pages.push({
            type: 'chapter',
            chapterTitle: chap.title,
            chapterNum: chap.chapterNumber,
            chapterId: chap.id,
            paragraphs: currentPageParagraphs,
            pageNumber: pNum++,
          });
        }
      });
    });

    return pages;
  }, [activeProject, projectArcs, projectChapters, selectedFormat]);

  // Map of chapter starting pages
  const chapterPageMap = useMemo(() => {
    const map: Record<string, number> = {};
    bookPages.forEach((page, idx) => {
      if (page.type === 'chapter' && page.chapterId && map[page.chapterId] === undefined) {
        map[page.chapterId] = idx;
      }
    });
    return map;
  }, [bookPages]);

  // Jump directly to chapter page
  const jumpToChapter = (chapId: string, chapTitle: string) => {
    const pageIdx = chapterPageMap[chapId];
    if (pageIdx !== undefined) {
      setCurrentSpreadIndex(Math.floor(pageIdx / 2));
      setSinglePageIndex(pageIdx);
      setTocDrawerOpen(false);
      showToast(`Membuka ${chapTitle}`);
    }
  };

  // Determine whether to show single page or spread
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const showSinglePage = viewMode === 'single' || (viewMode === 'auto' && isMobileScreen);

  const totalSpreads = Math.ceil(bookPages.length / 2);
  const totalPages = bookPages.length;

  const prevPage = () => {
    if (showSinglePage) {
      setSinglePageIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentSpreadIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const nextPage = () => {
    if (showSinglePage) {
      setSinglePageIndex((prev) => Math.min(totalPages - 1, prev + 1));
    } else {
      setCurrentSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1));
    }
  };

  const leftPage = showSinglePage ? bookPages[singlePageIndex] : bookPages[currentSpreadIndex * 2];
  const rightPage = showSinglePage ? null : bookPages[currentSpreadIndex * 2 + 1];

  const handlePrint = () => {
    window.print();
  };

  // Format dimensions styling with authentic A5 standard ratio (148mm × 210mm)
  const getFormatDimensions = () => {
    switch (selectedFormat) {
      case 'pocket':
        return 'w-[300px] sm:w-[330px] md:w-[360px] aspect-[110/178] max-h-[82vh]';
      case 'trade':
        return 'w-[320px] sm:w-[360px] md:w-[400px] aspect-[152/229] max-h-[82vh]';
      case 'a5':
      default:
        // Authentic A5 aspect ratio 148 / 210 (~1 : 1.414)
        return 'w-[320px] sm:w-[370px] md:w-[410px] aspect-[148/210] max-h-[82vh]';
    }
  };

  // Font family class
  const getFontFamily = () => {
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

  const renderPageContent = (page: (typeof bookPages)[0]) => {
    if (page.type === 'cover') {
      return (
        <div className="w-full h-full flex flex-col justify-between items-center text-center p-6 relative overflow-hidden select-text">
          {activeProject?.coverUrl ? (
            <div className="absolute inset-0 z-0">
              <img
                src={activeProject.coverUrl}
                alt={activeProject.title}
                className="w-full h-full object-cover filter brightness-75 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/75" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1a1c29] via-[#0e0f17] to-[#08090e]" />
          )}

          {/* Book Spine Edge Overlay */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-10" />

          {/* Top Series Info (Editable) */}
          <div className="relative z-10 pt-2 px-2">
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { seriesTitle: e.currentTarget.innerText });
                  showToast('Judul seri diperbarui!');
                }
              }}
              className="text-[10px] uppercase tracking-widest font-mono px-2.5 py-0.5 rounded border border-[#f472b6]/40 bg-black/60 text-[#f472b6] shadow-xs cursor-text"
              title="Klik untuk menyunting seri/genre cerita"
            >
              {activeProject?.category === 'series'
                ? `${activeProject.seriesTitle || 'Seri'} — Buku ${activeProject.seriesOrder || 1}`
                : activeProject?.genre || 'Standalone'}
            </span>
          </div>

          {/* Center Title & Subtitle & Author (Editable directly on cover) */}
          <div className="relative z-10 px-3 my-auto space-y-2 w-full">
            <h1
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { title: e.currentTarget.innerText });
                  showToast('Judul buku tersimpan!');
                }
              }}
              className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase font-cinzel text-white drop-shadow-lg leading-tight cursor-text focus:outline-none"
              style={{ fontFamily: getFontFamilyInline() }}
              title="Klik untuk menyunting judul buku"
            >
              {activeProject?.title}
            </h1>

            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { subtitle: e.currentTarget.innerText });
                  showToast('Sub-judul buku tersimpan!');
                }
              }}
              className="text-xs sm:text-sm text-gray-200 italic font-cinzel drop-shadow-md cursor-text focus:outline-none"
              style={{ fontFamily: getFontFamilyInline() }}
              title="Klik untuk menyunting sub-judul buku"
            >
              {activeProject?.subtitle || ''}
            </p>

            <div className="w-14 h-0.5 bg-[#f472b6] mx-auto my-2.5 shadow-xs" />

            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { authorName: e.currentTarget.innerText });
                  showToast('Nama penulis tersimpan!');
                }
              }}
              className="text-xs text-gray-200 tracking-widest font-mono uppercase font-semibold cursor-text focus:outline-none"
              title="Klik untuk menyunting nama penulis"
            >
              {activeProject?.authorName || ''}
            </p>
          </div>
        </div>
      );
    }

    if (page.type === 'title') {
      return (
        <div className="h-full flex flex-col justify-center py-6 px-4 text-center select-text">
          <div className="space-y-3 my-auto">
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { title: e.currentTarget.innerText });
                  showToast('Judul buku tersimpan!');
                }
              }}
              className="text-xl md:text-2xl font-bold tracking-wider font-cinzel text-[var(--app-book-text)] uppercase cursor-text focus:outline-none"
              style={{ fontFamily: getFontFamilyInline() }}
              title="Klik untuk menyunting judul buku"
            >
              {activeProject?.title}
            </h2>

            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { subtitle: e.currentTarget.innerText });
                  showToast('Sub-judul buku tersimpan!');
                }
              }}
              className="text-xs text-[var(--app-text-muted)] italic font-cinzel cursor-text focus:outline-none"
              style={{ fontFamily: getFontFamilyInline() }}
              title="Klik untuk menyunting sub-judul"
            >
              {activeProject?.subtitle || ''}
            </p>

            <div className="w-12 h-px bg-[#f472b6]/50 mx-auto my-3" />

            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                if (activeProject) {
                  updateProject(activeProject.id, { authorName: e.currentTarget.innerText });
                  showToast('Nama penulis tersimpan!');
                }
              }}
              className="text-xs font-semibold text-[var(--app-book-text)] uppercase tracking-wider cursor-text focus:outline-none"
              title="Klik untuk menyunting nama penulis"
            >
              {activeProject?.authorName || ''}
            </p>
          </div>
        </div>
      );
    }

    if (page.type === 'epigraph') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 select-text">
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              if (activeProject) {
                updateProject(activeProject.id, { synopsis: e.currentTarget.innerText });
                showToast('Epigraf / sinopsis buku tersimpan!');
              }
            }}
            className="text-sm md:text-base italic text-[var(--app-book-text)] leading-relaxed cursor-text focus:outline-none"
            style={{ fontFamily: getFontFamilyInline() }}
            title="Klik untuk menyunting epigraf cerita"
          >
            "{page.paragraphs[0]}"
          </p>
          <p className="text-xs text-[var(--app-accent)] font-cinzel font-semibold">
            {page.paragraphs[1] || '— Epigraf Buku'}
          </p>
        </div>
      );
    }

    if (page.type === 'arc') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 select-text">
          <span className="text-xs text-[var(--app-accent)] uppercase font-cinzel font-semibold">
            Bagian Novel
          </span>
          <h3
            contentEditable
            suppressContentEditableWarning
            className="text-xl md:text-2xl font-bold font-cinzel text-[var(--app-book-text)] uppercase cursor-text focus:outline-none"
            style={{ fontFamily: getFontFamilyInline() }}
            title="Klik untuk menyunting judul bagian"
          >
            {page.arcTitle}
          </h3>
          {page.paragraphs.length > 0 && (
            <p className="text-xs text-[var(--app-text-muted)] italic max-w-xs">{page.paragraphs[0]}</p>
          )}
        </div>
      );
    }

    return (
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          if (page.chapterId) {
            updateChapter(page.chapterId, { content: e.currentTarget.innerHTML });
            showToast('Perubahan halaman buku tersimpan otomatis!');
          }
        }}
        className="space-y-3 text-xs md:text-sm text-[var(--app-book-text)] cursor-text focus:outline-none select-text"
        style={{
          fontFamily: getFontFamilyInline(),
          textAlign: typesetting.textAlignment,
          lineHeight: typesetting.lineHeight,
        }}
        title="Klik di sini untuk menyunting isi buku langsung pada halaman pratinjau"
      >
        {page.paragraphs.map((p, idx) => (
          <div
            key={idx}
            className={`${idx === 0 && typesetting.dropCap ? 'drop-cap' : ''}`}
            style={{
              textIndent: typesetting.paragraphIndent ? '1.8em' : '0',
            }}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 lg:px-7 py-5 pb-24 md:pb-12 text-[var(--app-text)] transition-colors">
      {/* CHAPTER LIST (TABLE OF CONTENTS) DRAWER MODAL */}
      {tocDrawerOpen && (
        <>
          <div
            onClick={() => setTocDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-[var(--app-card)] border-r border-[var(--app-border)] shadow-2xl flex flex-col p-4 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--app-accent)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text)]">
                  Daftar Bab Buku
                </h3>
              </div>
              <button
                onClick={() => setTocDrawerOpen(false)}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg transition-colors"
                title="Tutup Daftar Bab"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {/* Front Matter Shortcuts */}
              <div className="space-y-1 pb-3 border-b border-[var(--app-border)]">
                <button
                  onClick={() => {
                    setCurrentSpreadIndex(0);
                    setSinglePageIndex(0);
                    setTocDrawerOpen(false);
                    showToast('Membuka Sampul Depan');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs bg-[var(--app-card-sub)] text-[var(--app-accent)] font-semibold border border-[var(--app-border)] hover:opacity-90 transition-colors"
                >
                  <span>Sampul Depan (Book Cover)</span>
                  <span className="text-[10px] font-mono">Sampul</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentSpreadIndex(0);
                    setSinglePageIndex(1);
                    setTocDrawerOpen(false);
                    showToast('Membuka Halaman Judul & Hak Cipta');
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors"
                >
                  <span>Halaman Judul &amp; Hak Cipta</span>
                  <span className="text-[10px] font-mono">Hal 1</span>
                </button>
              </div>

              {projectArcs.map((arc) => {
                const arcChaps = projectChapters.filter((c) => c.arcId === arc.id);
                return (
                  <div key={arc.id} className="space-y-1">
                    <span className="text-[11px] font-semibold text-[var(--app-accent)] uppercase block px-2">
                      {arc.title}
                    </span>
                    <div className="space-y-1 pl-1 border-l border-[var(--app-border)]">
                      {arcChaps.map((chap) => {
                        const startPage = chapterPageMap[chap.id];
                        return (
                          <button
                            key={chap.id}
                            onClick={() => jumpToChapter(chap.id, chap.title)}
                            className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)] transition-colors group"
                          >
                            <span className="truncate pr-2">
                              Bab {chap.chapterNumber}: {chap.title}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--app-text-muted)] group-hover:text-[var(--app-accent)] shrink-0">
                              Hal {startPage !== undefined ? startPage + 1 : '-'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--app-border)]">
              <button
                onClick={() => {
                  setCurrentSpreadIndex(0);
                  setSinglePageIndex(0);
                  setTocDrawerOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-[var(--app-card-sub)] text-xs font-semibold text-[var(--app-text)] hover:opacity-90 transition-colors"
              >
                Kembali ke Halaman Pertama (Hal 1)
              </button>
            </div>
          </div>
        </>
      )}

      {/* Simplified, eye-friendly Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--app-border)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--app-text)]">
            Pratinjau Buku Fisik
          </h1>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            Simulasi buku cetak nyata dengan tata letak margin, nomor halaman, dan pembalik lembaran.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chapter Drawer Toggle Button */}
          <button
            onClick={() => setTocDrawerOpen(!tocDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              tocDrawerOpen
                ? 'border-[var(--app-border)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-xs'
                : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] hover:border-[var(--app-accent)]'
            }`}
            title="Buka / Tutup Daftar Bab Buku"
          >
            <Layers className="w-3.5 h-3.5 text-[var(--app-accent)]" />
            <span>{tocDrawerOpen ? 'Tutup Bab' : 'Daftar Bab'}</span>
          </button>

          {/* View Mode Toggle (Single vs Spread) */}
          <div className="flex items-center gap-1 p-1 bg-[var(--app-card-sub)] border border-[var(--app-border)] rounded-xl text-xs">
            <button
              onClick={() => setViewMode(showSinglePage ? 'spread' : 'single')}
              className="px-2.5 py-1 text-[var(--app-text)] font-medium transition-colors"
              title="Beralih antara Tampilan 1 Halaman dan 2 Halaman"
            >
              {showSinglePage ? '1 Halaman' : '2 Halaman (Spread)'}
            </button>
          </div>

          {/* Format selector */}
          <div className="flex items-center gap-1 p-1 bg-[var(--app-card-sub)] border border-[var(--app-border)] rounded-xl text-xs">
            <button
              onClick={() => setSelectedFormat('a5')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedFormat === 'a5'
                  ? 'bg-[var(--app-card)] text-[var(--app-accent)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              A5
            </button>
            <button
              onClick={() => setSelectedFormat('pocket')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedFormat === 'pocket'
                  ? 'bg-[var(--app-card)] text-[var(--app-accent)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Saku
            </button>
            <button
              onClick={() => setSelectedFormat('trade')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedFormat === 'trade'
                  ? 'bg-[var(--app-card)] text-[var(--app-accent)] font-semibold shadow-xs'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Trade 6x9
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Book Simulation Arena */}
      <div className="mt-5 flex flex-col items-center">
        {/* Book Container with Realistic Book Spine & Shadows */}
        <div className="relative flex items-center justify-center gap-0 p-3 sm:p-5 md:p-6 bg-[var(--app-card-sub)] rounded-3xl border border-[var(--app-border)] shadow-md max-w-full overflow-hidden">
          {/* Main Page (Verso or Single Page) */}
          {leftPage && (
            <div
              className={`${getFormatDimensions()} bg-[var(--app-book-bg)] border border-[var(--app-book-border)] ${
                !showSinglePage ? 'rounded-l-2xl border-r-0 book-page-left' : 'rounded-2xl shadow-xl'
              } ${leftPage.type === 'cover' ? '!p-0 overflow-hidden' : 'p-5 sm:p-7 md:p-8'} flex flex-col justify-between relative transition-all text-[var(--app-book-text)]`}
              style={{ fontFamily: getFontFamilyInline() }}
            >
              {/* Running Header (hidden on cover) */}
              {leftPage.type !== 'cover' && (
                <div className="text-center pb-2.5 border-b border-[var(--app-border)] text-[10px] uppercase tracking-widest text-[var(--app-text-muted)] font-cinzel truncate">
                  {leftPage.chapterTitle ? `Bab: ${leftPage.chapterTitle}` : activeProject?.title}
                </div>
              )}

              {/* Page Content Body */}
              <div className={`flex-1 ${leftPage.type === 'cover' ? 'h-full p-0' : 'py-3'} overflow-hidden leading-relaxed ${getFontFamily()}`}>
                {renderPageContent(leftPage)}
              </div>

              {/* Page Number (hidden on cover) */}
              {leftPage.type !== 'cover' && (
                <div className="text-left pt-2 border-t border-[var(--app-border)] text-[10px] font-mono text-[var(--app-text-muted)]">
                  {leftPage.pageNumber}
                </div>
              )}
            </div>
          )}

          {/* Book Center Crease */}
          {!showSinglePage && (
            <div className="hidden md:block w-3 h-full absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-black/25 via-black/10 to-black/25 z-20 pointer-events-none" />
          )}

          {/* Right Page (Recto) */}
          {!showSinglePage && rightPage && (
            <div
              className={`${getFormatDimensions()} bg-[var(--app-book-bg)] border-y border-r border-[var(--app-book-border)] rounded-r-2xl p-5 sm:p-7 md:p-8 flex flex-col justify-between book-page-right relative transition-all text-[var(--app-book-text)]`}
              style={{ fontFamily: getFontFamilyInline() }}
            >
              {/* Running Header */}
              <div className="text-center pb-2.5 border-b border-[var(--app-border)] text-[10px] uppercase tracking-widest text-[var(--app-accent)] font-cinzel truncate">
                {rightPage.chapterTitle ? `Bab: ${rightPage.chapterTitle}` : activeProject?.genre}
              </div>

              {/* Page Content Body */}
              <div className={`flex-1 py-3 overflow-hidden leading-relaxed ${getFontFamily()}`}>
                {renderPageContent(rightPage)}
              </div>

              {/* Page Number */}
              <div className="text-right pt-2 border-t border-[var(--app-border)] text-[10px] font-mono text-[var(--app-text-muted)]">
                {rightPage.pageNumber}
              </div>
            </div>
          )}
        </div>

        {/* Page Flip Navigation Buttons */}
        <div className="no-print flex items-center justify-center gap-3 sm:gap-4 mt-5 flex-wrap">
          <button
            onClick={prevPage}
            disabled={showSinglePage ? singlePageIndex === 0 : currentSpreadIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-semibold text-[var(--app-text)] hover:border-[var(--app-accent)] disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs font-mono text-[var(--app-text-muted)]">
            {showSinglePage ? (
              <>
                Halaman {singlePageIndex + 1} / {totalPages}
              </>
            ) : (
              <>
                Lembar {currentSpreadIndex + 1} / {totalSpreads} (Hal {currentSpreadIndex * 2 + 1}–
                {Math.min(bookPages.length, (currentSpreadIndex + 1) * 2)})
              </>
            )}
          </span>

          <button
            onClick={nextPage}
            disabled={
              showSinglePage
                ? singlePageIndex >= totalPages - 1
                : currentSpreadIndex >= totalSpreads - 1
            }
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-semibold text-[var(--app-text)] hover:border-[var(--app-accent)] disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
          >
            <span>Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
