import React, { useState } from 'react';
import { useNovel } from '../../context/NovelContext';
import { Chapter, ChapterPublishInfo } from '../../types/novel';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sliders,
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
    'Bagaimana menurutmu tentang bab ini? Bab berikutnya akan tayang minggu depan.'
  );

  const [copied, setCopied] = useState(false);

  // Selected chapter for publishing
  const targetChapter = activeChapter || projectChapters[0];

  // Helper to strip HTML tags for plain external publishing platforms
  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.innerText || tmp.textContent || '';
  };

  // Formatting engine based on platform preset
  const getFormattedPayload = (): string => {
    if (!targetChapter) return '';

    let output = '';

    // 1. Content Warnings
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
    const cleanText = stripHtml(targetChapter.content || '');
    const rawParagraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    output += rawParagraphs.map((p) => p.trim()).join('\n\n');

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
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-5 pb-24 md:pb-12 text-[var(--app-text)] transition-colors">
      {/* Simplified Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--app-border)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--app-text)]">
            Publikasi Naskah
          </h1>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            Format bersih satu klik untuk platform baca luar (Wattpad, Webnovel, Royal Road, dll).
          </p>
        </div>

        {/* Copy Clean Action */}
        <button
          onClick={handleCopyClean}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Tersalin Bersih!' : `Salin untuk ${platform}`}</span>
        </button>
      </div>

      {/* Platform Presets Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
        {(['Wattpad', 'Royal Road', 'Webnovel', 'Karyakarsa', 'AO3'] as TargetPlatform[]).map((p) => {
          const isActive = platform === p;
          return (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isActive
                  ? 'border-[var(--app-accent)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-xs font-semibold'
                  : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
              }`}
            >
              <span className="text-xs font-bold block">{p}</span>
              <span className="text-[10px] opacity-75 block mt-0.5">
                {p === 'Wattpad'
                  ? 'Spasi Ganda'
                  : p === 'Royal Road'
                  ? 'BBCode Preset'
                  : p === 'Webnovel'
                  ? 'Clean Text'
                  : 'Clean Format'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: Chapter Select & Publishing Metadata */}
        <div className="lg:col-span-5 space-y-4">
          {/* Chapter Selector */}
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4">
            <label className="text-xs uppercase font-semibold text-[var(--app-text-muted)] block mb-1.5">
              Pilih Bab:
            </label>
            <select
              value={targetChapter?.id}
              onChange={(e) => setActiveChapterId(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
            >
              {projectChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  Bab {c.chapterNumber}: {c.title} ({c.wordCount} kata)
                </option>
              ))}
            </select>

            {/* Publication Status Card */}
            <div className="mt-3.5 p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--app-text-muted)]">Status di {platform}:</span>
                <span
                  className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                    currentChapStatus?.status === 'published'
                      ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
                      : currentChapStatus?.status === 'scheduled'
                      ? 'text-sky-500 border-sky-500/20 bg-sky-500/10'
                      : 'text-amber-500 border-amber-500/20 bg-amber-500/10'
                  }`}
                >
                  {currentChapStatus?.status || 'Draft'}
                </span>
              </div>

              {/* Status Selector Buttons */}
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(targetChapter?.id || '', 'draft')}
                  className="flex-1 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(targetChapter?.id || '', 'scheduled')}
                  className="flex-1 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[11px] text-sky-500"
                >
                  Jadwalkan
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(targetChapter?.id || '', 'published')}
                  className="flex-1 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[11px] text-emerald-500"
                >
                  Sudah Terbit
                </button>
              </div>

              {/* URL Input */}
              <div>
                <label className="text-[10px] text-[var(--app-text-muted)] uppercase font-medium block mb-1">
                  URL Tayang di {platform} (Opsional):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    defaultValue={currentChapStatus?.publishedUrl || ''}
                    onBlur={(e) =>
                      targetChapter &&
                      handleUpdateStatus(
                        targetChapter.id,
                        currentChapStatus?.status || 'published',
                        currentChapStatus?.scheduledDate,
                        e.target.value
                      )
                    }
                    placeholder={`https://${platform.toLowerCase().replace(/\s+/g, '')}.com/...`}
                    className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                  {currentChapStatus?.publishedUrl && (
                    <a
                      href={currentChapStatus.publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-accent)]"
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
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text)] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[var(--app-accent)]" />
              Pengaturan Tambahan Naskah
            </h3>

            {/* Content Warnings */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs text-[var(--app-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContentWarning}
                  onChange={(e) => setIncludeContentWarning(e.target.checked)}
                  className="accent-[var(--app-accent)]"
                />
                <span className="font-semibold text-rose-400">
                  Sematkan Peringatan Konten
                </span>
              </label>

              {includeContentWarning && (
                <div className="pl-5 space-y-1 text-xs text-[var(--app-text-muted)]">
                  {[
                    'Dark Fantasy & Psychological Horror',
                    'Graphic Violence & Blood',
                    'Morally Gray Themes',
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
                        className="accent-[var(--app-accent)]"
                      />
                      <span>{warn}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Author Notes */}
            <div className="space-y-2.5 pt-2 border-t border-[var(--app-border)]">
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--app-text)] mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOpeningNote}
                    onChange={(e) => setIncludeOpeningNote(e.target.checked)}
                    className="accent-[var(--app-accent)]"
                  />
                  <span>Catatan Pembuka Penulis</span>
                </label>
                {includeOpeningNote && (
                  <textarea
                    rows={2}
                    value={authorOpening}
                    onChange={(e) => setAuthorOpening(e.target.value)}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2 text-xs text-[var(--app-text)] focus:outline-none resize-none"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--app-text)] mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeClosingNote}
                    onChange={(e) => setIncludeClosingNote(e.target.checked)}
                    className="accent-[var(--app-accent)]"
                  />
                  <span>Catatan Penutup / Interaksi Pembaca</span>
                </label>
                {includeClosingNote && (
                  <textarea
                    rows={2}
                    value={authorClosing}
                    onChange={(e) => setAuthorClosing(e.target.value)}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2 text-xs text-[var(--app-text)] focus:outline-none resize-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Screen Simulator Preview */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 flex flex-col h-full">
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                <span className="text-xs font-bold uppercase text-[var(--app-text)]">
                  Pratinjau Format: {platform}
                </span>
              </div>
              <span className="text-xs text-[var(--app-text-muted)] font-mono">
                {targetChapter?.wordCount || 0} kata
              </span>
            </div>

            {/* Live payload container */}
            <div className="mt-3 flex-1 bg-[var(--app-card-sub)] border border-[var(--app-border)] rounded-xl p-4 md:p-5 overflow-y-auto max-h-[540px] font-sans text-xs md:text-sm leading-relaxed text-[var(--app-text)] whitespace-pre-wrap select-all">
              {getFormattedPayload()}
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--app-border)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--app-text-muted)]">
                Format teks telah disanitasi: rapi dan siap paste.
              </span>
              <button
                onClick={handleCopyClean}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 transition-all"
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
