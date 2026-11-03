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
  Quote,
  Image as ImageIcon,
  Tag,
  MapPin,
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
  const [coverTags, setCoverTags] = useState<string[]>([]);
  const [coverTagInput, setCoverTagInput] = useState('');
  const [coverSynopsis, setCoverSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const editorImageInputRef = useRef<HTMLInputElement>(null);

  // New Story Quick Modal directly in Editor tab
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newStoryForm, setNewStoryForm] = useState({
    title: '',
    genre: 'General Fiction' as DarkGenre,
    subGenre: '',
    tags: [] as string[],
    synopsis: '',
    authorName: 'Shandra Cahya',
    copyrightYear: new Date().getFullYear().toString(),
  });
  const [newStoryTagInput, setNewStoryTagInput] = useState('');

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

  // Inotes-style Quote / Callout Block for dialogue, monologues, or highlighted character words
  const handleInsertQuote = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      if (selectedText) {
        const quoteBlock = document.createElement('blockquote');
        quoteBlock.className = 'inote-quote';
        quoteBlock.innerHTML = `"${selectedText.replace(/^["“”']|["“”']$/g, '')}"`;
        range.deleteContents();
        range.insertNode(quoteBlock);

        // Add blank paragraph after quote block so writer can seamlessly continue typing
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        quoteBlock.parentNode?.insertBefore(p, quoteBlock.nextSibling);

        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      const quoteHtml = `<blockquote class="inote-quote">"Kutipan atau monolog tokoh di sini..."</blockquote><p><br></p>`;
      execCmd('insertHTML', quoteHtml);
    }
    handleEditorInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Continuous chapters list: Prolog first, followed by Chapter 1, 2, 3..., then Epilog last
  const sortedChapters = React.useMemo(() => {
    return [...projectChapters].sort((a, b) => {
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
  }, [projectChapters]);

  const getNextChapterNumber = () => {
    const numbered = projectChapters.filter(
      (c) =>
        !c.title.toLowerCase().includes('prolog') &&
        !c.title.toLowerCase().includes('epilog')
    );
    return numbered.length + 1;
  };

  const handleCreateProlog = () => {
    const hasProlog = projectChapters.some((c) => c.title.toLowerCase().includes('prolog'));
    if (hasProlog) {
      showToast('Prolog sudah ada dalam naskah', 'info');
      return;
    }
    createChapter(undefined, 'Prolog', '<p>Tulis prolog cerita di sini...</p>');
  };

  const handleCreateEpilog = () => {
    const hasEpilog = projectChapters.some((c) => c.title.toLowerCase().includes('epilog'));
    if (hasEpilog) {
      showToast('Epilog sudah ada dalam naskah', 'info');
      return;
    }
    createChapter(undefined, 'Epilog', '<p>Tulis epilog penutup cerita di sini...</p>');
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
    setCoverTags(activeProject.tags || []);
    setCoverTagInput('');
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
      tags: coverTags,
      synopsis: coverSynopsis,
      coverUrl: coverUrl,
    });
    setShowCoverModal(false);
    showToast('Rincian sampul, tag, genre & buku berhasil diperbarui!');
  };

  const handleAddCoverTag = () => {
    const clean = coverTagInput.trim().replace(/^#/, '');
    if (clean && !coverTags.includes(clean)) {
      setCoverTags([...coverTags, clean]);
    }
    setCoverTagInput('');
  };

  const handleRemoveCoverTag = (tagToRemove: string) => {
    setCoverTags(coverTags.filter((t) => t !== tagToRemove));
  };

  const handleAddNewStoryTag = () => {
    const clean = newStoryTagInput.trim().replace(/^#/, '');
    if (clean && !newStoryForm.tags.includes(clean)) {
      setNewStoryForm((prev) => ({
        ...prev,
        tags: [...prev.tags, clean],
      }));
    }
    setNewStoryTagInput('');
  };

  const handleRemoveNewStoryTag = (tagToRemove: string) => {
    setNewStoryForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
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
      tags: newStoryForm.tags,
      synopsis: newStoryForm.synopsis.trim() || 'Dunia naskah baru.',
      authorName: newStoryForm.authorName || 'Shandra Cahya',
      copyrightYear: newStoryForm.copyrightYear || new Date().getFullYear().toString(),
      category: 'series',
      status: 'On Progress',
      coverUrl: '/src/assets/images/sample_book_cover_1793354596229.jpg',
    });
    // Create initial chapter for the new story
    createChapter(undefined, 'Chapter 1: Permulaan');
    setActiveProjectId(created.id);
    setShowNewStoryModal(false);
    setNewStoryForm({
      title: '',
      genre: 'General Fiction',
      subGenre: '',
      tags: [],
      synopsis: '',
      authorName: 'Shandra Cahya',
      copyrightYear: new Date().getFullYear().toString(),
    });
    setNewStoryTagInput('');
    showToast(`Cerita "${created.title}" berhasil dibuat! Siap menulis.`);
  };

  // State for Tempat & Tanggal Penulisan modal
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateLocationForm, setDateLocationForm] = useState({
    city: 'Jakarta',
    date: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
  });

  // Offline automatic photo upload directly into the editor with built-in revision delete button
  const handleEditorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Pilih file gambar (JPG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;

      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const imgHtml = `<figure class="my-4 text-center relative group inline-block max-w-full" contenteditable="false"><div class="relative inline-block max-w-full"><img src="${base64Url}" alt="${cleanName}" class="max-w-full max-h-[480px] rounded-2xl mx-auto shadow-md border border-[var(--app-border)] object-contain" /><button type="button" class="chapter-img-del-btn absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-sans px-2.5 py-1 rounded-lg shadow-md cursor-pointer transition-all flex items-center gap-1 z-20" title="Hapus foto ini untuk revisi">✕ Hapus Foto</button></div><figcaption class="text-[11px] text-[var(--app-text-muted)] italic mt-1.5 font-mono">Ilustrasi: ${cleanName}</figcaption></figure><p><br></p>`;

      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertHTML', false, imgHtml);
        handleEditorInput();
      }
      showToast(`Foto "${file.name}" berhasil diunggah! Tombol "Hapus Foto" tersedia jika ingin revisi.`);
    };

    reader.onerror = () => {
      showToast('Gagal memproses file foto', 'error');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Click handler to delete uploaded photos or inject revision delete button
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const delBtn = target.closest('.chapter-img-del-btn');
    if (delBtn) {
      e.preventDefault();
      e.stopPropagation();
      const figure = delBtn.closest('figure');
      if (figure) {
        figure.remove();
        handleEditorInput();
        showToast('Foto berhasil dihapus dari naskah!');
      }
      return;
    }

    // If an image inside figure is clicked and lacks a delete button, inject one for easy revision
    if (target.tagName.toLowerCase() === 'img') {
      const figure = target.closest('figure');
      if (figure && !figure.querySelector('.chapter-img-del-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'chapter-img-del-btn absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-sans px-2.5 py-1 rounded-lg shadow-md cursor-pointer transition-all flex items-center gap-1 z-20';
        btn.innerHTML = '✕ Hapus Foto';
        target.parentElement?.classList.add('relative');
        target.parentElement?.appendChild(btn);
        showToast('Tombol "✕ Hapus Foto" ditambahkan di atas gambar untuk revisi.', 'info');
      }
    }
  };

  // Delete current active chapter
  const handleDeleteCurrentChapter = () => {
    if (!activeChapter) return;
    requestConfirm({
      title: 'Hapus Chapter Naskah',
      message: `Yakin ingin menghapus "${activeChapter.title || `Chapter ${activeChapter.chapterNumber}`}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Hapus Chapter',
      onConfirm: () => {
        deleteChapter(activeChapter.id);
        showToast(`Chapter berhasil dihapus.`);
      },
    });
  };

  // Toggle or Insert To Be Continued (ukuran 7-9px) at end of manuscript
  const handleToggleToBeContinued = () => {
    if (!editorRef.current) return;
    const existing = editorRef.current.querySelector('.tbc-marker');
    if (existing) {
      existing.remove();
      handleEditorInput();
      showToast('Penutup "To Be Continued" dihapus.');
    } else {
      const tbcHtml = `<div class="tbc-marker my-8 text-center select-none" contenteditable="false"><span class="text-[8px] font-mono font-bold uppercase tracking-[0.25em] text-[var(--app-accent)] px-3 py-1 rounded-full border border-[var(--app-accent)]/40 bg-[var(--app-accent-bg)] inline-block">— TO BE CONTINUED —</span></div><p><br></p>`;
      editorRef.current.innerHTML += tbcHtml;
      handleEditorInput();
      showToast('Penutup "— TO BE CONTINUED —" berhasil disisipkan di akhir naskah!');
    }
  };

  // Insert Tempat & Tanggal Penulisan (ukuran 6-7px) at end of manuscript
  const handleApplyDateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;
    const cleanCity = dateLocationForm.city.trim() || 'Jakarta';
    const cleanDate = dateLocationForm.date.trim() || new Date().getFullYear().toString();
    const dateLocHtml = `<div class="writing-date-location my-5 text-right select-none" contenteditable="false"><span class="text-[6.5px] font-mono italic text-[var(--app-text-muted)] tracking-wider">— ${cleanCity}, ${cleanDate}</span></div><p><br></p>`;
    editorRef.current.innerHTML += dateLocHtml;
    handleEditorInput();
    setShowDateModal(false);
    showToast(`Tempat & tanggal "${cleanCity}, ${cleanDate}" berhasil disisipkan!`);
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

      {/* LEFT SIDEBAR: CHAPTERS NAVIGATOR (NO ARCS) */}
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
                Daftar Chapter
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => docxInputRef.current?.click()}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] rounded-lg transition-colors"
                title="Impor Chapter dari .docx"
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
                onClick={handleCreateProlog}
                className="px-2 py-1 text-[10px] font-semibold text-[var(--app-accent)] bg-[var(--app-accent-bg)] border border-[var(--app-border)] hover:opacity-90 rounded-lg transition-colors"
                title="Tambah Halaman Prolog"
              >
                + Prolog
              </button>
              <button
                onClick={handleCreateEpilog}
                className="px-2 py-1 text-[10px] font-semibold text-[var(--app-accent)] bg-[var(--app-accent-bg)] border border-[var(--app-border)] hover:opacity-90 rounded-lg transition-colors"
                title="Tambah Halaman Epilog"
              >
                + Epilog
              </button>
              <button
                onClick={() => createChapter(undefined, `Chapter ${getNextChapterNumber()}`)}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] rounded-lg transition-colors"
                title="Tambah Chapter Baru"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg transition-colors ml-0.5"
                title="Tutup Daftar Chapter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Continuous Chapters List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {sortedChapters.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--app-text-muted)] space-y-2">
                <p>Belum ada chapter naskah.</p>
                <div className="flex flex-col gap-1.5 items-center justify-center">
                  <button
                    onClick={() => createChapter(undefined, 'Chapter 1: Permulaan')}
                    className="text-[var(--app-accent)] underline font-semibold text-xs"
                  >
                    + Buat Chapter 1
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateProlog}
                      className="text-[var(--app-text-muted)] hover:text-[var(--app-accent)] text-[11px]"
                    >
                      + Prolog
                    </button>
                    <span>·</span>
                    <button
                      onClick={handleCreateEpilog}
                      className="text-[var(--app-text-muted)] hover:text-[var(--app-accent)] text-[11px]"
                    >
                      + Epilog
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              sortedChapters.map((chap) => {
                const isSelected = chap.id === activeChapterId;
                const isProlog = chap.title.toLowerCase().includes('prolog');
                const isEpilog = chap.title.toLowerCase().includes('epilog');
                return (
                  <div
                    key={chap.id}
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[var(--app-accent-bg)] text-[var(--app-accent)] font-medium shadow-sm border border-[var(--app-border)]'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        {isProlog && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[var(--app-accent)] text-black font-semibold">
                            Prolog
                          </span>
                        )}
                        {isEpilog && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[var(--app-accent)] text-black font-semibold">
                            Epilog
                          </span>
                        )}
                        <p className="truncate font-medium">
                          {chap.title || `Chapter ${chap.chapterNumber}`}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--app-text-muted)] mt-0.5 block">
                        {chap.wordCount || 0} kata
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm({
                          title: 'Hapus Chapter Naskah',
                          message: `Yakin ingin menghapus "${chap.title || `Chapter ${chap.chapterNumber}`}"? Tindakan ini tidak dapat dibatalkan.`,
                          confirmLabel: 'Hapus Chapter',
                          onConfirm: () => {
                            deleteChapter(chap.id);
                            showToast(`Chapter berhasil dihapus.`);
                          },
                        });
                      }}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-colors shrink-0"
                      title={`Hapus ${chap.title || `Chapter ${chap.chapterNumber}`}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}

            {/* Quick Add Chapter & Epilog at the bottom */}
            {sortedChapters.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => createChapter(undefined, `Chapter ${getNextChapterNumber()}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:border-[var(--app-accent)] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Chapter Baru</span>
                </button>
                <button
                  onClick={handleCreateEpilog}
                  className="px-3 py-2 rounded-xl border border-dashed border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:border-[var(--app-accent)] transition-colors shrink-0"
                  title="Tambah Epilog"
                >
                  <span>+ Epilog</span>
                </button>
              </div>
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
        {/* Editor Top Bar - Left Stack & Right Stack */}
        {!isZenMode && (
          <div className="border-b border-[var(--app-border)] bg-[var(--app-header-bg)] px-3 sm:px-6 py-2.5 transition-colors">
            <div className="w-full flex items-start justify-between gap-3">
              {/* Left Stack (Rata Kiri):
                  1. Fitur Tambah Cerita (tepat diatas toggle daftar chapter)
                  2. Toggle Daftar Chapter
                  3. Mode Baca (tepat dibawah daftar chapter) */}
              <div className="flex flex-col items-start gap-1.5 shrink-0">
                {/* 1. Fitur Tambah Cerita (tepat diatas toggle daftar chapter) */}
                <button
                  onClick={() => setShowNewStoryModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-semibold text-[var(--app-accent)] hover:border-[var(--app-accent)] transition-all shadow-2xs"
                  title="Tulis Cerita Baru (Pilih Genre & Sub-Genre)"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah Cerita</span>
                </button>

                {/* 2. Toggle Daftar Chapter */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    sidebarOpen
                      ? 'border-[var(--app-border)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-sm'
                      : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] hover:border-[var(--app-accent)]'
                  }`}
                  title={sidebarOpen ? 'Tutup Daftar Chapter' : 'Buka Daftar Chapter'}
                >
                  <Layers className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span className="font-semibold">{sidebarOpen ? 'Tutup Chapter' : 'Daftar Chapter'}</span>
                  {activeChapter && (
                    <span className="font-mono text-[10px] text-[var(--app-text-muted)] border-l border-[var(--app-border)] pl-1.5 max-w-[120px] truncate hidden sm:inline">
                      {activeChapter.title || `Chapter ${activeChapter.chapterNumber}`}
                    </span>
                  )}
                </button>

                {/* 3. Mode Baca (rata kiri tepat dibawah daftar chapter) */}
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
              </div>

              {/* Right Stack (Rata Kanan):
                  1. Typesetting
                  2. Riwayat (dibawah typesetting)
                  3. Focus Mode (dibawah riwayat) */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-auto">
                {/* 1. Typesetting */}
                <button
                  onClick={() => setShowTypesetPanel(!showTypesetPanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    showTypesetPanel
                      ? 'border-[var(--app-border)] bg-[var(--app-accent-bg)] text-[var(--app-accent)] shadow-xs'
                      : 'border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] hover:border-[var(--app-accent)]'
                  }`}
                  title="Format Font, Ukuran & Typesetting"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Typesetting</span>
                </button>

                {/* 2. Riwayat (dibawah typesetting) */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-all shadow-2xs"
                  title="Riwayat Versi (Time Machine)"
                >
                  <History className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span>Riwayat</span>
                  {chapterSnapshots.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-[var(--app-card-sub)] text-[var(--app-accent)] text-[10px] font-mono rounded">
                      {chapterSnapshots.length}
                    </span>
                  )}
                </button>

                {/* 3. Focus Mode (dibawah riwayat) */}
                <button
                  onClick={() => setIsZenMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--app-accent-bg)] border border-[var(--app-border)] text-[var(--app-accent)] text-xs font-medium hover:opacity-90 transition-all shadow-2xs"
                  title="Mode Fokus Layar Penuh (Zen Mode)"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Focus Mode</span>
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

              {/* Kutipan / Quote Tokoh (inotes style blockquote) */}
              <div className="border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={handleInsertQuote}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] hover:text-[var(--app-accent)] transition-colors"
                  title="Kutipan / Quote Tokoh (Format Inotes)"
                >
                  <Quote className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span className="text-[11px] font-medium hidden sm:inline">Kutipan</span>
                </button>
              </div>

              {/* Sisipkan Foto Ilustrasi Otomatis (Offline) */}
              <div className="border-r border-[var(--app-border)] pr-2 shrink-0">
                <button
                  type="button"
                  onClick={() => editorImageInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[var(--app-text)] hover:bg-[var(--app-card-sub)] hover:text-[var(--app-accent)] transition-colors"
                  title="Sisipkan Foto Ilustrasi (Otomatis & Offline)"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span className="text-[11px] font-medium hidden sm:inline">Foto</span>
                </button>
                <input
                  ref={editorImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditorImageUpload}
                />
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
            {/* If no chapters exist, show friendly prompt */}
            {projectChapters.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-card)] my-auto">
                <BookOpen className="w-10 h-10 text-[var(--app-accent)] mx-auto mb-2 opacity-75" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">Belum ada chapter dalam naskah ini</h3>
                <p className="text-xs text-[var(--app-text-muted)] mt-1 mb-4">
                  Mulai chapter pertama sekarang untuk mulai merangkai cerita.
                </p>
                <button
                  onClick={() => {
                    createChapter(undefined, 'Chapter 1: Permulaan');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Buat Chapter Pertama</span>
                </button>
              </div>
            ) : (
              <>
                {/* CLEAN READER MODE VIEW (ACTIVE WHEN isReaderMode IS TRUE) */}
                {isReaderMode && (
                  <div className="w-full space-y-6 animate-in fade-in duration-200">
                    <div className="pb-4 border-b border-[var(--app-border)] flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--app-accent)] block mb-1">
                          {activeProject?.category === 'series'
                            ? `${activeProject.seriesTitle || 'Seri'} · ${activeChapter?.title || `Chapter ${activeChapter?.chapterNumber || 1}`}`
                            : (activeChapter?.title || `Chapter ${activeChapter?.chapterNumber || 1}`)}
                        </span>
                        <h1
                          className={`text-2xl sm:text-3xl font-bold text-[var(--app-text)] leading-tight ${getFontClass()}`}
                          style={{ fontFamily: getFontFamilyInline() }}
                        >
                          {title || activeChapter?.title || `Chapter ${activeChapter?.chapterNumber || 1}`}
                        </h1>
                        <p className="text-xs text-[var(--app-text-muted)] mt-1.5">
                          {activeProject?.title} · Oleh <strong className="text-[var(--app-text)]">{activeProject?.authorName || 'Penulis'}</strong>
                        </p>
                      </div>

                      {activeChapter && (
                        <button
                          type="button"
                          onClick={handleDeleteCurrentChapter}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-500/30 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors shrink-0"
                          title="Hapus Chapter ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      )}
                    </div>

                    <div
                      className={`editor-rich-content flex-1 text-[var(--app-text)] leading-relaxed select-text transition-colors ${getFontClass()}`}
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
                            : (activeChapter?.content || '<p class="italic text-[var(--app-text-muted)]">Chapter ini belum memiliki isi draf.</p>'),
                      }}
                    />

                    {/* Bottom Manuscript Accessories for Reader Mode */}
                    <div className="mt-8 pt-4 border-t border-[var(--app-border)]/50 flex flex-wrap items-center justify-between gap-3 select-none">
                      <button
                        type="button"
                        onClick={() => setShowDateModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[7px] font-mono text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-accent)] transition-all shadow-2xs"
                        title="Atur / Sisipkan Tempat & Tanggal Penulisan (Ukuran 6-7px)"
                      >
                        <MapPin className="w-2.5 h-2.5 text-[var(--app-accent)]" />
                        <span>+ Tempat &amp; Tanggal Penulisan</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleToBeContinued}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--app-accent)]/50 bg-[var(--app-accent-bg)] text-[8px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--app-accent)] hover:opacity-90 active:scale-95 transition-all shadow-xs"
                        title="Sisipkan penutup To Be Continued (Ukuran 7-9px)"
                      >
                        <span>— TO BE CONTINUED —</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* WRITE MODE EDITOR (KEPT PERMANENTLY MOUNTED IN DOM TO PREVENT ANY DATA LOSS) */}
                <div className={`w-full flex flex-col flex-1 ${isReaderMode ? 'hidden' : ''}`}>
                  {/* Chapter Title Input & Delete Button */}
                  <div className="mb-4 pb-2 border-b border-[var(--app-border)] flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Judul Chapter (misal: Prolog, Chapter 1, atau Epilog)..."
                      style={{ fontFamily: getFontFamilyInline() }}
                      className={`w-full bg-transparent text-xl md:text-2xl font-bold text-[var(--app-text)] focus:outline-none placeholder-[var(--app-text-muted)] ${getFontClass()}`}
                    />
                    {activeChapter && (
                      <button
                        type="button"
                        onClick={handleDeleteCurrentChapter}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors shrink-0 shadow-2xs"
                        title="Hapus Chapter yang sedang aktif ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Hapus Bab</span>
                      </button>
                    )}
                  </div>

                  {/* Rich ContentEditable Manuscript Editor */}
                  <div
                    ref={editorRef}
                    contentEditable={!isReaderMode}
                    onInput={handleEditorInput}
                    onClick={handleEditorClick}
                    data-placeholder="Mulai menulis draf ceritamu di sini..."
                    className={`editor-rich-content flex-1 min-h-[500px] bg-transparent text-[var(--app-text)] focus:outline-none leading-relaxed transition-colors ${getFontClass()}`}
                    style={{
                      fontFamily: getFontFamilyInline(),
                      fontSize: `${typesetting.fontSize}px`,
                      lineHeight: typesetting.lineHeight,
                      textIndent: typesetting.paragraphIndent ? '2em' : '0px',
                    }}
                  />

                  {/* Bottom Manuscript Accessories (To Be Continued & Tempat Tanggal Penulisan) */}
                  <div className="mt-8 pt-4 border-t border-[var(--app-border)]/50 flex flex-wrap items-center justify-between gap-3 select-none">
                    {/* Add Tempat & Tanggal Penulisan (Ukuran Font 6-7px) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowDateModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] text-[7px] font-mono text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-accent)] transition-all shadow-2xs"
                        title="Sisipkan Tempat & Tanggal Penulisan di akhir naskah (Ukuran 6-7px)"
                      >
                        <MapPin className="w-2.5 h-2.5 text-[var(--app-accent)]" />
                        <span>+ Tempat &amp; Tanggal Penulisan</span>
                      </button>
                    </div>

                    {/* Tombol To Be Continued (Ukuran 7-9px) */}
                    <div>
                      <button
                        type="button"
                        onClick={handleToggleToBeContinued}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--app-accent)]/50 bg-[var(--app-accent-bg)] text-[8px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--app-accent)] hover:opacity-90 active:scale-95 transition-all shadow-xs"
                        title="Sisipkan penutup To Be Continued (Ukuran 7-9px) di akhir naskah"
                      >
                        <span>— TO BE CONTINUED —</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Editor Bottom Footer - Word & Char Counter (Rata Kanan, Ukuran 7-8px) */}
        {!isZenMode && (
          <footer className="border-t border-[var(--app-border)] bg-[var(--app-card)] px-4 sm:px-6 py-1 flex items-center justify-end shrink-0 z-10 transition-colors">
            <span className="text-[7.5px] font-mono text-[var(--app-text-muted)] tracking-wider">
              {wordCount} kata · {charCount} kar
            </span>
          </footer>
        )}
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

                {/* Custom Tags Section */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Tag Cerita (Ketik sendiri &amp; tekan Enter atau tombol Tambah)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--app-text-muted)]" />
                      <input
                        type="text"
                        value={coverTagInput}
                        onChange={(e) => setCoverTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCoverTag();
                          }
                        }}
                        placeholder="Ketik tag cerita (contoh: Grimdark, Plot Twist, Time Travel)..."
                        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] pl-9 pr-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCoverTag}
                      className="px-3 py-2 rounded-xl bg-[var(--app-card-sub)] border border-[var(--app-border)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors shrink-0"
                    >
                      + Tambah
                    </button>
                  </div>
                  {coverTags.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {coverTags.map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--app-accent)]/15 text-[var(--app-accent)] border border-[var(--app-accent)]/30"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveCoverTag(t)}
                            className="hover:text-red-400 p-0.5 rounded transition-colors"
                            title="Hapus tag"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--app-text-muted)] italic">
                      Belum ada tag cerita. Ketik kata kunci tag di atas.
                    </p>
                  )}
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

              {/* Custom Tags Section */}
              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Tag Cerita (Ketik sendiri &amp; tekan Enter atau tombol Tambah)
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--app-text-muted)]" />
                    <input
                      type="text"
                      value={newStoryTagInput}
                      onChange={(e) => setNewStoryTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewStoryTag();
                        }
                      }}
                      placeholder="Ketik tag cerita (contoh: Dark Fantasy, Anti-hero, Mystery)..."
                      className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] pl-9 pr-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewStoryTag}
                    className="px-3 py-2 rounded-xl bg-[var(--app-card-sub)] border border-[var(--app-border)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-colors shrink-0"
                  >
                    + Tambah
                  </button>
                </div>
                {newStoryForm.tags.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {newStoryForm.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--app-accent)]/15 text-[var(--app-accent)] border border-[var(--app-accent)]/30"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveNewStoryTag(t)}
                          className="hover:text-red-400 p-0.5 rounded transition-colors"
                          title="Hapus tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[var(--app-text-muted)] italic">
                    Belum ada tag cerita. Ketik kata kunci tag di atas.
                  </p>
                )}
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

      {/* MODAL: SISIPKAN TEMPAT & TANGGAL PENULISAN (UKURAN 6-7px) */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl text-[var(--app-text)] space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--app-accent)]" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Tempat &amp; Tanggal Penulisan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyDateLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Tempat / Kota Penulisan
                </label>
                <input
                  type="text"
                  value={dateLocationForm.city}
                  onChange={(e) => setDateLocationForm({ ...dateLocationForm, city: e.target.value })}
                  placeholder="Contoh: Jakarta, Bandung, Yogyakarta..."
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Tanggal Penulisan
                </label>
                <input
                  type="text"
                  value={dateLocationForm.date}
                  onChange={(e) => setDateLocationForm({ ...dateLocationForm, date: e.target.value })}
                  placeholder="Contoh: 3 November 2026"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                />
              </div>

              <p className="text-[10px] text-[var(--app-text-muted)] italic leading-tight">
                Akan disisipkan rapi di bagian kanan bawah naskah dengan ukuran tipografi 6-7px.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
                >
                  Sisipkan ke Naskah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
