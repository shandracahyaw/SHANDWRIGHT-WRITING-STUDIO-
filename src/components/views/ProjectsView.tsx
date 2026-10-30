import React, { useState, useRef } from 'react';
import { useNovel } from '../../context/NovelContext';
import { Project, ProjectCategory, ProjectStatus, DarkGenre } from '../../types/novel';
import { parseDocxFile } from '../../utils/docxHelper';
import {
  FolderKanban,
  Plus,
  BookMarked,
  Layers,
  Edit3,
  Trash2,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    setActiveTab,
    createChapter,
    arcs,
    showToast,
  } = useNovel();

  const [filterCategory, setFilterCategory] = useState<'all' | 'standalone' | 'series'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    synopsis: '',
    category: 'series' as ProjectCategory,
    seriesTitle: '',
    seriesOrder: 1,
    genre: 'Grimdark' as DarkGenre,
    status: 'Idea' as ProjectStatus,
    targetDailyWords: 1000,
    coverUrl: '',
  });

  const docxInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      subtitle: '',
      synopsis: '',
      category: 'series',
      seriesTitle: '',
      seriesOrder: 1,
      genre: 'Grimdark',
      status: 'Idea',
      targetDailyWords: 1000,
      coverUrl: '/src/assets/images/sample_book_cover_1793354596229.jpg',
    });
    setShowModal(true);
  };

  const openEditModal = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setFormData({
      title: proj.title,
      subtitle: proj.subtitle || '',
      synopsis: proj.synopsis,
      category: proj.category,
      seriesTitle: proj.seriesTitle || '',
      seriesOrder: proj.seriesOrder || 1,
      genre: proj.genre,
      status: proj.status,
      targetDailyWords: proj.targetDailyWords,
      coverUrl: proj.coverUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Judul naskah wajib diisi', 'error');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      createProject(formData);
    }
    setShowModal(false);
  };

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const parsedChapters = await parseDocxFile(file);

      // Create new standalone or series project from file
      const newProj = createProject({
        title: file.name.replace(/\.[^/.]+$/, ''),
        subtitle: 'Diimpor dari dokumen Word / WPS',
        synopsis: `Draf naskah hasil impor otomatis dari dokumen ${file.name}. Terdiri dari ${parsedChapters.length} bab terstruktur.`,
        category: 'standalone',
        genre: 'Dark Mystery',
        status: 'On Progress',
      });

      // Find the created arc
      const projectArc = arcs.find((a) => a.projectId === newProj.id);
      const targetArcId = projectArc?.id || 'arc-1';

      // Insert all parsed chapters
      parsedChapters.forEach((pc) => {
        createChapter(targetArcId, pc.title, pc.content);
      });

      showToast(`Sukses mengimpor ${parsedChapters.length} bab dari Word!`, 'success');
      setActiveProjectId(newProj.id);
      setActiveTab('editor');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal mengimpor file .docx', 'error');
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filterCategory === 'all') return true;
    return p.category === filterCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-6 pb-24 md:pb-12">
      {/* Header section with clean typography */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1b1c28]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#f472b6] font-medium">
            Manajemen Naskah &amp; Semesta
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Studio Proyek Naskah
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Kelola karya tunggal (Standalone) maupun semesta cerita bersambung (Series / Universe) dengan pelacakan target kata harian dan arsitektur bab.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Docx Import Button */}
          <button
            onClick={() => docxInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#2a2d3e] bg-[#0e0f17] text-xs font-medium text-gray-200 hover:border-[#f472b6]/40 hover:text-white transition-all shadow-sm"
            title="Impor naskah dari Word / WPS (.docx)"
          >
            <Upload className="w-4 h-4 text-[#f472b6]" />
            <span>{isImporting ? 'Mengurai...' : 'Impor .docx'}</span>
          </button>
          <input
            ref={docxInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleDocxImport}
          />

          {/* Create Project Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-xs font-semibold text-black hover:opacity-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(244,114,182,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-1 p-1 bg-[#0d0e14] border border-[#1b1c28] rounded-xl">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-[#1e202c] text-[#f472b6] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            onClick={() => setFilterCategory('standalone')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterCategory === 'standalone'
                ? 'bg-[#1e202c] text-[#f472b6] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Standalone ({projects.filter((p) => p.category === 'standalone').length})
          </button>
          <button
            onClick={() => setFilterCategory('series')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterCategory === 'series'
                ? 'bg-[#1e202c] text-[#f472b6] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Series / Universe ({projects.filter((p) => p.category === 'series').length})
          </button>
        </div>

        <div className="text-xs text-gray-500">
          <span>Proyek Aktif: </span>
          <strong className="text-white font-medium">
            {projects.find((p) => p.id === activeProjectId)?.title || 'Belum dipilih'}
          </strong>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          const statusColors: Record<ProjectStatus, string> = {
            Idea: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
            'On Progress': 'text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/20',
            Editing: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
            Completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
          };

          return (
            <div
              key={project.id}
              onClick={() => {
                setActiveProjectId(project.id);
                showToast(`Beralih ke proyek "${project.title}"`);
              }}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer overflow-hidden ${
                isActive
                  ? 'border-[#f472b6] bg-[#0d0e16] shadow-[0_0_30px_rgba(244,114,182,0.12)] ring-1 ring-[#f472b6]/50'
                  : 'border-[#1a1c28] bg-[#090a0f] hover:border-[#2a2d3e] hover:bg-[#0c0d14]'
              }`}
            >
              {/* Cover & Top Details */}
              <div>
                <div className="flex gap-4">
                  {/* Thumbnail Cover */}
                  <div className="w-16 h-24 rounded-lg overflow-hidden bg-[#141520] border border-[#222432] shrink-0 relative shadow-md">
                    {project.coverUrl ? (
                      <img
                        src={project.coverUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <BookMarked className="w-6 h-6 text-[#f472b6]/40" />
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute top-1 left-1 bg-[#f472b6] text-black text-[9px] font-bold px-1 rounded">
                        AKTIF
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          statusColors[project.status]
                        }`}
                      >
                        {project.status}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {project.category === 'series'
                          ? `Book ${project.seriesOrder || 1}`
                          : 'Standalone'}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-[#f472b6] transition-colors truncate">
                      {project.title}
                    </h3>
                    {project.subtitle && (
                      <p className="text-xs text-gray-400 italic truncate -mt-0.5">
                        {project.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="text-[#f472b6] font-mono text-[11px]">{project.genre}</span>
                      <span>·</span>
                      <span className="font-mono">{project.targetDailyWords}w target</span>
                    </div>
                  </div>
                </div>

                {/* Synopsis snippet */}
                <p className="text-xs text-gray-400 line-clamp-2 mt-4 leading-relaxed">
                  {project.synopsis}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-[#161824] flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveProjectId(project.id);
                    setActiveTab('editor');
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#f472b6] hover:text-[#fb7185] font-medium"
                >
                  <span>Buka Naskah</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => openEditModal(project, e)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1c1e2b] rounded-lg transition-colors"
                    title="Ubah Rincian Proyek"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Yakin ingin menghapus naskah "${project.title}" beserta seluruh babnya?`)) {
                        deleteProject(project.id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Hapus Proyek"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Project */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[#2a2d3e] bg-[#0c0d14] p-6 shadow-2xl text-[#e2e8f0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c28]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-[#f472b6]" />
                {editingProject ? 'Perbarui Rincian Naskah' : 'Inisiasi Proyek Naskah Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Judul Naskah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: The Obsidian Throne"
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white placeholder-gray-600 focus:border-[#f472b6] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sub-Judul / Kicker (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Contoh: Requiem for Mournhold"
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white placeholder-gray-600 focus:border-[#f472b6] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Kategori Cerita
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProjectCategory })
                    }
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white focus:border-[#f472b6] focus:outline-none"
                  >
                    <option value="standalone">Standalone (Buku Tunggal)</option>
                    <option value="series">Series / Universe (Bersambung)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Genre Gelap</label>
                  <select
                    value={formData.genre}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value as DarkGenre })
                    }
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white focus:border-[#f472b6] focus:outline-none"
                  >
                    <option value="Grimdark">Grimdark</option>
                    <option value="Dark Fantasy">Dark Fantasy</option>
                    <option value="Sci-Fi Thriller">Sci-Fi Thriller</option>
                    <option value="Dark Mystery">Dark Mystery</option>
                    <option value="Cosmic Horror">Cosmic Horror</option>
                  </select>
                </div>

                {formData.category === 'series' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Nama Seri / Semesta
                      </label>
                      <input
                        type="text"
                        value={formData.seriesTitle}
                        onChange={(e) => setFormData({ ...formData, seriesTitle: e.target.value })}
                        placeholder="Contoh: The Obsidian Chronicles"
                        className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Urutan Buku / Seri (#)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.seriesOrder}
                        onChange={(e) =>
                          setFormData({ ...formData, seriesOrder: parseInt(e.target.value) || 1 })
                        }
                        className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white focus:border-[#f472b6] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Status Pengerjaan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ProjectStatus })
                    }
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white focus:border-[#f472b6] focus:outline-none"
                  >
                    <option value="Idea">Idea (Gagasan)</option>
                    <option value="On Progress">On Progress (Sedang Menulis)</option>
                    <option value="Editing">Editing (Penyuntingan)</option>
                    <option value="Completed">Completed (Tamat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Target Kata Harian
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formData.targetDailyWords}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDailyWords: parseInt(e.target.value) || 1000 })
                    }
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white focus:border-[#f472b6] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    URL Gambar Sampul Buku (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    placeholder="/src/assets/images/sample_book_cover_1793354596229.jpg"
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3.5 py-2 text-sm text-white placeholder-gray-600 focus:border-[#f472b6] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Sinopsis / Premis Cerita
                  </label>
                  <textarea
                    rows={3}
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    placeholder="Gambarkan intrik gelap, taruhan moral, dan konflik utama..."
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-3 text-sm text-white placeholder-gray-600 focus:border-[#f472b6] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b1c28]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-xs font-semibold text-black hover:opacity-95"
                >
                  {editingProject ? 'Simpan Perubahan' : 'Mulai Menulis Naskah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
