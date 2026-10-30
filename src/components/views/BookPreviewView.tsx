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
} from 'lucide-react';

export const BookPreviewView: React.FC = () => {
  const {
    activeProject,
    projectArcs,
    projectChapters,
    typesetting,
    updateTypesetting,
    showToast,
  } = useNovel();

  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<'a5' | 'pocket' | 'trade'>('a5');

  // Build the book pages array:
  // Page 0: Title Page / Hal Judul
  // Page 1: Epigraph / Sinopsis Pembuka
  // Page 2..N: Chapters content divided into pages
  const bookPages = useMemo(() => {
    const pages: Array<{
      type: 'title' | 'epigraph' | 'arc' | 'chapter';
      arcTitle?: string;
      chapterTitle?: string;
      chapterNum?: number;
      paragraphs: string[];
      pageNumber: number;
    }> = [];

    let pNum = 1;

    // 1. Title Page
    pages.push({
      type: 'title',
      paragraphs: [],
      pageNumber: pNum++,
    });

    // 2. Epigraph / Opening Dread
    pages.push({
      type: 'epigraph',
      paragraphs: [
        activeProject?.synopsis || 'Dunia telah lama melupakan belas kasihan.',
        '— Prasasti Katedral Bayangan, Tahun Terakhir Manusia',
      ],
      pageNumber: pNum++,
    });

    // Chapters chunking into pages (~280 - 350 words per page depending on size)
    const wordsPerPage = selectedFormat === 'pocket' ? 220 : selectedFormat === 'a5' ? 280 : 340;

    projectArcs.forEach((arc) => {
      const arcChaps = projectChapters.filter((c) => c.arcId === arc.id);
      if (arcChaps.length === 0) return;

      // Arc Hal Pembuka
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
            paragraphs: ['[Draf Bab Kosong]'],
            pageNumber: pNum++,
          });
          return;
        }

        let currentPageParagraphs: string[] = [];
        let currentWordTally = 0;
        let isFirstPageOfChapter = true;

        rawParagraphs.forEach((para) => {
          const paraWords = para.trim().split(/\s+/).length;
          if (currentWordTally + paraWords > wordsPerPage && currentPageParagraphs.length > 0) {
            pages.push({
              type: 'chapter',
              chapterTitle: chap.title,
              chapterNum: chap.chapterNumber,
              paragraphs: currentPageParagraphs,
              pageNumber: pNum++,
            });
            currentPageParagraphs = [para];
            currentWordTally = paraWords;
            isFirstPageOfChapter = false;
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
            paragraphs: currentPageParagraphs,
            pageNumber: pNum++,
          });
        }
      });
    });

    return pages;
  }, [activeProject, projectArcs, projectChapters, selectedFormat]);

  // Total spreads (in 2-page mode: 2 pages per spread; in single-page mode on mobile: 1 page per spread)
  const totalSpreads = Math.ceil(bookPages.length / 2);

  const prevSpread = () => {
    setCurrentSpreadIndex((prev) => Math.max(0, prev - 1));
  };

  const nextSpread = () => {
    setCurrentSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1));
  };

  const leftPage = bookPages[currentSpreadIndex * 2];
  const rightPage = bookPages[currentSpreadIndex * 2 + 1];

  const handlePrint = () => {
    window.print();
  };

  // Format dimensions styling
  const getFormatDimensions = () => {
    switch (selectedFormat) {
      case 'pocket':
        return 'w-[320px] h-[480px] md:w-[360px] md:h-[530px]'; // Saku / Pocket
      case 'trade':
        return 'w-[360px] h-[540px] md:w-[420px] md:h-[620px]'; // US Trade 6x9
      case 'a5':
      default:
        return 'w-[340px] h-[500px] md:w-[390px] md:h-[570px]'; // A5 Standar
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
      default:
        return 'font-garamond';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-6 pb-24 md:pb-12 text-[#e2e8f0]">
      {/* Top Header & Controls (Hidden in Print) */}
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#1b1c28]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#f472b6] font-medium font-cinzel">
            E-Book &amp; Print Typesetting
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Pratinjau Buku Fisik (Physical Book Simulation)
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Simulasi buku cetak nyata dengan layout margin buku, running header, nomor halaman, drop cap, dan penyesuaian format ukuran buku cetak.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Format selector */}
          <div className="flex items-center gap-1 p-1 bg-[#0d0e14] border border-[#222432] rounded-xl text-xs">
            <button
              onClick={() => setSelectedFormat('a5')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedFormat === 'a5'
                  ? 'bg-[#1e202c] text-[#f472b6] font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              A5 Standar
            </button>
            <button
              onClick={() => setSelectedFormat('pocket')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedFormat === 'pocket'
                  ? 'bg-[#1e202c] text-[#f472b6] font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Saku (Pocket)
            </button>
            <button
              onClick={() => setSelectedFormat('trade')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedFormat === 'trade'
                  ? 'bg-[#1e202c] text-[#f472b6] font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              US Trade 6x9
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f472b6] text-black font-semibold text-xs hover:bg-[#ec4899] active:scale-95 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Book Simulation Arena */}
      <div className="mt-8 flex flex-col items-center">
        {/* Book Container with Realistic Book Spine & Shadows */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-0 p-3 md:p-6 bg-[#040507] rounded-3xl border border-[#161720] shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-w-full overflow-hidden">
          {/* Left Page (Verso) */}
          {leftPage && (
            <div
              className={`${getFormatDimensions()} bg-[#0d0e15] border-y border-l border-[#1f2130] rounded-l-2xl p-7 md:p-9 flex flex-col justify-between book-page-left relative transition-all text-[#e0e3eb]`}
            >
              {/* Running Header (Judul Buku di Halaman Kiri) */}
              <div className="text-center pb-3 border-b border-[#1b1c28] text-[10px] uppercase tracking-widest text-gray-500 font-cinzel">
                {activeProject?.title}
              </div>

              {/* Page Content Body */}
              <div className={`flex-1 py-4 overflow-hidden leading-relaxed ${getFontFamily()}`}>
                {leftPage.type === 'title' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#f472b6] font-cinzel">
                      {activeProject?.seriesTitle ? `${activeProject.seriesTitle} — Buku ${activeProject.seriesOrder || 1}` : 'Edisi Naskah Pertama'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-wider font-cinzel text-white uppercase">
                      {activeProject?.title}
                    </h2>
                    {activeProject?.subtitle && (
                      <p className="text-xs text-gray-400 italic font-cinzel">{activeProject.subtitle}</p>
                    )}
                    <div className="w-12 h-px bg-[#f472b6]/40 mx-auto my-2" />
                    <p className="text-xs text-gray-500">Shandwright Dark Studio Publishing</p>
                  </div>
                ) : leftPage.type === 'epigraph' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <p className="text-sm md:text-base italic text-gray-300 leading-relaxed font-garamond">
                      "{leftPage.paragraphs[0]}"
                    </p>
                    <p className="text-xs text-[#f472b6] font-cinzel">{leftPage.paragraphs[1]}</p>
                  </div>
                ) : leftPage.type === 'arc' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-xs text-[#f472b6] uppercase font-cinzel">Bagian Novel</span>
                    <h3 className="text-xl md:text-2xl font-bold font-cinzel text-white uppercase">
                      {leftPage.arcTitle}
                    </h3>
                    {leftPage.paragraphs.length > 0 && (
                      <p className="text-xs text-gray-400 italic max-w-xs">{leftPage.paragraphs[0]}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 text-xs md:text-sm">
                    {leftPage.paragraphs.map((p, idx) => (
                      <p
                        key={idx}
                        className={`${
                          idx === 0 && leftPage.type === 'chapter' && typesetting.dropCap ? 'drop-cap' : ''
                        }`}
                        style={{
                          textAlign: typesetting.textAlignment,
                          textIndent: typesetting.paragraphIndent ? '1.8em' : '0',
                          lineHeight: typesetting.lineHeight,
                        }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Page Number (Left Bottom) */}
              <div className="text-left pt-2 border-t border-[#161722] text-[10px] font-mono text-gray-500">
                {leftPage.pageNumber}
              </div>
            </div>
          )}

          {/* Book Center Crease / Spine Shadow Divider */}
          <div className="hidden md:block w-3 h-full absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-black/80 via-black/40 to-black/80 z-20 pointer-events-none" />

          {/* Right Page (Recto) */}
          {rightPage ? (
            <div
              className={`${getFormatDimensions()} bg-[#0d0e15] border-y border-r border-[#1f2130] rounded-r-2xl p-7 md:p-9 flex flex-col justify-between book-page-right relative transition-all text-[#e0e3eb]`}
            >
              {/* Running Header (Judul Bab di Halaman Kanan) */}
              <div className="text-center pb-3 border-b border-[#1b1c28] text-[10px] uppercase tracking-widest text-[#f472b6] font-cinzel truncate">
                {rightPage.chapterTitle ? `Bab: ${rightPage.chapterTitle}` : activeProject?.genre}
              </div>

              {/* Page Content Body */}
              <div className={`flex-1 py-4 overflow-hidden leading-relaxed ${getFontFamily()}`}>
                {rightPage.type === 'title' ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-xs text-gray-500 italic">Halaman Dikosongkan Secara Sengaja</p>
                  </div>
                ) : rightPage.type === 'epigraph' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm italic text-gray-400">Daftar Isi &amp; Bab Pembuka Menanti</p>
                  </div>
                ) : rightPage.type === 'arc' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-xs text-[#f472b6] uppercase font-cinzel">Bagian Novel</span>
                    <h3 className="text-xl md:text-2xl font-bold font-cinzel text-white uppercase">
                      {rightPage.arcTitle}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs md:text-sm">
                    {rightPage.paragraphs.map((p, idx) => (
                      <p
                        key={idx}
                        className={`${
                          idx === 0 && rightPage.type === 'chapter' && typesetting.dropCap ? 'drop-cap' : ''
                        }`}
                        style={{
                          textAlign: typesetting.textAlignment,
                          textIndent: typesetting.paragraphIndent ? '1.8em' : '0',
                          lineHeight: typesetting.lineHeight,
                        }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Page Number (Right Bottom) */}
              <div className="text-right pt-2 border-t border-[#161722] text-[10px] font-mono text-gray-500">
                {rightPage.pageNumber}
              </div>
            </div>
          ) : (
            /* Blank back page if odd number */
            <div
              className={`hidden md:flex ${getFormatDimensions()} bg-[#0b0c12] border-y border-r border-[#1a1c28] rounded-r-2xl p-9 flex-col justify-between book-page-right`}
            >
              <div className="text-center text-[10px] text-gray-700 font-cinzel">SHANDWRIGHT</div>
              <div className="flex items-center justify-center text-gray-600 text-xs italic">
                Akhir Pratinjau
              </div>
              <div />
            </div>
          )}
        </div>

        {/* Page Flip Navigation Buttons (Thumb-Friendly) */}
        <div className="no-print flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prevSpread}
            disabled={currentSpreadIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#222432] bg-[#0d0e14] text-xs font-semibold text-gray-200 hover:text-white hover:border-[#f472b6]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Halaman Sebelumnya</span>
          </button>

          <span className="text-xs font-mono text-gray-400">
            Lembar {currentSpreadIndex + 1} / {totalSpreads} (Halaman {currentSpreadIndex * 2 + 1}–
            {Math.min(bookPages.length, (currentSpreadIndex + 1) * 2)})
          </span>

          <button
            onClick={nextSpread}
            disabled={currentSpreadIndex >= totalSpreads - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#222432] bg-[#0d0e14] text-xs font-semibold text-gray-200 hover:text-white hover:border-[#f472b6]/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <span>Halaman Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
