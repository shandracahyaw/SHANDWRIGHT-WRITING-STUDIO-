import React, { useState } from 'react';
import { useNovel } from '../../context/NovelContext';
import { Chapter, ChapterPublishInfo } from '../../types/novel';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Smartphone,
  BookOpen,
  Send,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

type TargetPlatform = 'Wattpad' | 'Webnovel' | 'Royal Road' | 'Karyakarsa' | 'AO3';

export const PublishingView: React.FC = () => {
  const {
    activeProject,
    projectChapters,
    activeChapter,
    activeChapterId,
    setActiveChapterId,
    updateChapter,
    showToast,
  } = useNovel();

  const [platform, setPlatform] = useState<TargetPlatform>('Wattpad');
  const [includeOpeningNote, setIncludeOpeningNote] = useState(true);
  const [includeClosingNote, setIncludeClosingNote] = useState(true);
  const [includeContentWarning, setIncludeContentWarning] = useState(true);
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([
    'Dark Fantasy & Psychological Horror',
    'Graphic Violence & Blood',
    'Morally Gray Themes',
  ]);
  const [authorOpening, setAuthorOpening] = useState(
    'Halo pembaca! Terima kasih sudah membaca bab terbaru dari naskah ini. Jangan lupa tinggalkan vote dan komentar!'
  );
  const [authorClosing, setAuthorClosing] = useState(
    'Bagaimana menurutmu tentang twist di bab ini? Bab berikutnya akan tayang minggu depan.'
  );

  const [copied, setCopied] = useState(false);

  // Selected chapter for publishing
  const targetChapter = activeChapter || projectChapters[0];

  // Formatting engine based on platform preset
  const getFormattedPayload = (): string => {
    if (!targetChapter) return '';

    let output = '';

    // 1. Content Warnings (especially for Dark genres on Royal Road / Webnovel / AO3)
    if (includeContentWarning && selectedWarnings.length > 0) {
      if (platform === 'Royal Road' || platform === 'Webnovel') {
        output += `[b]⚠️ CONTENT WARNINGS:[/b]\n${selectedWarnings.map((w) => `• ${w}`).join('\n')}\n\n---\n\n`;
      } else {
        output += `⚠️ PERINGATAN KONTEN:\n${selectedWarnings.map((w) => `• ${w}`).join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━\n\n`;
      }
    }

    // 2. Author Opening Note
    if (includeOpeningNote && authorOpening.trim()) {
      if (platform === 'Royal Road') {
        output += `[i][b]Author's Note:[/b] ${authorOpening.trim()}[/i]\n\n`;
      } else {
        output += `[Catatan Penulis]: ${authorOpening.trim()}\n\n`;
      }
    }

    // 3. Chapter Title
    output += `${targetChapter.title.toUpperCase()}\n\n`;

    // 4. Chapter Body content formatted according to platform
    const rawParagraphs = targetChapter.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    if (platform === 'Wattpad') {
      // Wattpad standard: double newline spacing between paragraphs, no manual indent
      output += rawParagraphs.map((p) => p.trim()).join('\n\n');
    } else if (platform === 'Royal Road' || platform === 'Webnovel') {
      // Clean paragraphs with clean breaks
      output += rawParagraphs.map((p) => p.trim()).join('\n\n');
    } else {
      output += rawParagraphs.map((p) => p.trim()).join('\n\n');
    }

    // 5. Author Closing Note
    if (includeClosingNote && authorClosing.trim()) {
      if (platform === 'Royal Road') {
        output += `\n\n---\n[i]${authorClosing.trim()}[/i]`;
      } else {
        output += `\n\n━━━━━━━━━━━━━━━━━━━━\n${authorClosing.trim()}`;
      }
    }

    return output;
  };

  const handleCopyClean = () => {
    const text = getFormattedPayload();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`Naskah bab siap dipublikasikan di ${platform} disalin ke clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  // Update publishing status of chapter
  const handleUpdateStatus = (
    chapId: string,
    status: 'draft' | 'scheduled' | 'published',
    date?: string,
    url?: string
  ) => {
    const chap = projectChapters.find((c) => c.id === chapId);
    if (!chap) return;

    const existingList = chap.publishingStatus || [];
    const filtered = existingList.filter((p) => p.platform !== platform);

    filtered.push({
      platform,
      status,
      scheduledDate: date || new Date().toISOString().split('T')[0],
      publishedUrl: url || '',
    });

    updateChapter(chapId, { publishingStatus: filtered });
    showToast(`Status bab untuk ${platform} diperbarui menjadi: ${status}`);
  };

  const currentChapStatus = targetChapter?.publishingStatus?.find((p) => p.platform === platform);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-6 pb-24 md:pb-12 text-[#e2e8f0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#1b1c28]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#f472b6] font-medium font-cinzel">
            Publishing Connector &amp; Sync Helper
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Integrasi Platform Publikasi
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Format bersih satu klik untuk menyalin naskah langsung ke Wattpad, Webnovel, Royal Road, atau Karyakarsa tanpa kendala indentasi ganda.
          </p>
        </div>

        {/* Copy Clean Action */}
        <button
          onClick={handleCopyClean}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-black font-semibold text-xs hover:opacity-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(244,114,182,0.3)]"
        >
          {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Tersalin Bersih!' : `Salin Bersih untuk ${platform}`}</span>
        </button>
      </div>

      {/* Platform Presets Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6">
        {(['Wattpad', 'Royal Road', 'Webnovel', 'Karyakarsa', 'AO3'] as TargetPlatform[]).map((p) => {
          const isActive = platform === p;
          return (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`p-3 rounded-xl border text-center transition-all ${
                isActive
                  ? 'border-[#f472b6] bg-[#161725] text-[#f472b6] shadow-sm'
                  : 'border-[#1e202e] bg-[#0c0d14] text-gray-400 hover:text-white hover:bg-[#11121c]'
              }`}
            >
              <span className="text-xs font-bold block">{p}</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {p === 'Wattpad'
                  ? 'Spasi Ganda Tanpa Indent'
                  : p === 'Royal Road'
                  ? 'BBCode + Author Note'
                  : p === 'Webnovel'
                  ? 'Clean Paragraphs'
                  : 'Plain / Rich Text'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Chapter Select & Publishing Metadata */}
        <div className="lg:col-span-5 space-y-5">
          {/* Chapter Selector */}
          <div className="rounded-2xl border border-[#1b1c28] bg-[#090a0f] p-5">
            <label className="text-xs uppercase font-semibold text-gray-400 block mb-2">
              Pilih Bab yang Akan Dipublikasikan:
            </label>
            <select
              value={targetChapter?.id}
              onChange={(e) => setActiveChapterId(e.target.value)}
              className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-xs text-white focus:outline-none"
            >
              {projectChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  Bab {c.chapterNumber}: {c.title} ({c.wordCount} kata)
                </option>
              ))}
            </select>

            {/* Publication Status Card */}
            <div className="mt-4 p-3.5 rounded-xl border border-[#1e202e] bg-[#10111a] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Status di {platform}:</span>
                <span
                  className={`font-mono text-[11px] uppercase px-2 py-0.5 rounded border ${
                    currentChapStatus?.status === 'published'
                      ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                      : currentChapStatus?.status === 'scheduled'
                      ? 'text-sky-400 border-sky-400/20 bg-sky-400/10'
                      : 'text-amber-400 border-amber-400/20 bg-amber-400/10'
                  }`}
                >
                  {currentChapStatus?.status || 'Draft (Belum Tayang)'}
                </span>
              </div>

              {/* Status Selector Buttons */}
              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(targetChapter.id, 'draft')}
                  className="flex-1 py-1.5 rounded-lg border border-[#222432] bg-[#12131c] text-[11px] text-gray-300 hover:text-white hover:border-gray-500"
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(targetChapter.id, 'scheduled')}
                  className="flex-1 py-1.5 rounded-lg border border-[#222432] bg-[#12131c] text-[11px] text-sky-400 hover:border-sky-500"
                >
                  Jadwalkan
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(targetChapter.id, 'published')}
                  className="flex-1 py-1.5 rounded-lg border border-[#222432] bg-[#12131c] text-[11px] text-emerald-400 hover:border-emerald-500"
                >
                  Sudah Terbit
                </button>
              </div>

              {/* URL Input */}
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-medium block mb-1">
                  URL Tayang di {platform} (Opsional):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={currentChapStatus?.publishedUrl || ''}
                    onBlur={(e) =>
                      handleUpdateStatus(
                        targetChapter.id,
                        currentChapStatus?.status || 'published',
                        currentChapStatus?.scheduledDate,
                        e.target.value
                      )
                    }
                    placeholder={`https://${platform.toLowerCase().replace(/\s+/g, '')}.com/story/...`}
                    className="flex-1 rounded-lg border border-[#222432] bg-[#12131c] px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                  {currentChapStatus?.publishedUrl && (
                    <a
                      href={currentChapStatus.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-[#222432] bg-[#12131c] text-gray-300 hover:text-[#f472b6]"
                      title="Buka Halaman Publikasi"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preset Customization */}
          <div className="rounded-2xl border border-[#1b1c28] bg-[#090a0f] p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#f472b6]" />
              Pengaturan Tambahan Naskah
            </h3>

            {/* Content Warnings */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContentWarning}
                  onChange={(e) => setIncludeContentWarning(e.target.checked)}
                  className="accent-[#f472b6]"
                />
                <span className="font-semibold text-rose-300">
                  Sematkan Peringatan Konten (Content Warning)
                </span>
              </label>

              {includeContentWarning && (
                <div className="pl-5 space-y-1 text-xs text-gray-400">
                  {[
                    'Dark Fantasy & Psychological Horror',
                    'Graphic Violence & Blood',
                    'Morally Gray Themes',
                    'Substance & Blood Magic Rituals',
                  ].map((warn) => (
                    <label key={warn} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWarnings.includes(warn)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWarnings([...selectedWarnings, warn]);
                          } else {
                            setSelectedWarnings(selectedWarnings.filter((w) => w !== warn));
                          }
                        }}
                        className="accent-[#f472b6]"
                      />
                      <span>{warn}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Author Notes */}
            <div className="space-y-3 pt-2 border-t border-[#1a1c28]">
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-300 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOpeningNote}
                    onChange={(e) => setIncludeOpeningNote(e.target.checked)}
                    className="accent-[#f472b6]"
                  />
                  <span>Catatan Pembuka Penulis (Opening Note)</span>
                </label>
                {includeOpeningNote && (
                  <textarea
                    rows={2}
                    value={authorOpening}
                    onChange={(e) => setAuthorOpening(e.target.value)}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2 text-xs text-white focus:outline-none resize-none"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-gray-300 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeClosingNote}
                    onChange={(e) => setIncludeClosingNote(e.target.checked)}
                    className="accent-[#f472b6]"
                  />
                  <span>Catatan Penutup / Call to Action (Closing Note)</span>
                </label>
                {includeClosingNote && (
                  <textarea
                    rows={2}
                    value={authorClosing}
                    onChange={(e) => setAuthorClosing(e.target.value)}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2 text-xs text-white focus:outline-none resize-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Screen Simulator Preview */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#1b1c28] bg-[#090a0f] p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1c28]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#f472b6]" />
                <span className="text-xs font-bold uppercase text-white">
                  Pratinjau Format Bersih: {platform}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {targetChapter?.wordCount || 0} kata
              </span>
            </div>

            {/* Live payload container */}
            <div className="mt-4 flex-1 bg-[#050608] border border-[#1c1d28] rounded-xl p-4 md:p-6 overflow-y-auto max-h-[580px] font-sans text-xs md:text-sm leading-relaxed text-gray-300 whitespace-pre-wrap select-all">
              {getFormattedPayload()}
            </div>

            <div className="mt-4 pt-3 border-t border-[#181924] flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Format teks telah disanitasi: bebas tag formatting rusak, spasi rapi.
              </span>
              <button
                onClick={handleCopyClean}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f472b6] text-black font-semibold text-xs hover:bg-[#ec4899] transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Semua'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
