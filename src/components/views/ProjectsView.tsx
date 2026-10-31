import React, { useState, useRef } from 'react';
import { useNovel } from '../../context/NovelContext';
import { Project, ProjectCategory, ProjectStatus, DarkGenre } from '../../types/novel';
import { parseDocxFile } from '../../utils/docxHelper';
import {
  FolderKanban,
  Plus,
  BookMarked,
  Edit3,
  Trash2,
  Upload,
  ArrowRight,
  X,
  FilePlus,
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
    requestConfirm,
  } = useNovel();

  const [filterCategory, setFilterCategory] = useState<'all' | 'standalone' | 'series'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states without forced word target
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    authorName: 'Shandra Cahya',
    copyrightYear: new Date().getFullYear().toString(),
    synopsis: '',
    category: 'series' as ProjectCategory,
    seriesTitle: '',
    seriesOrder: 1,
    genre: 'General Fiction' as DarkGenre,
    subGenre: '',
    status: 'Idea' as ProjectStatus,
    coverUrl: '',
  });

  const docxInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      subtitle: '',
      authorName: 'Shandra Cahya',
      copyrightYear: new Date().getFullYear().toString(),
      synopsis: '',
      category: 'series',
      seriesTitle: '',
      seriesOrder: 1,
      genre: 'General Fiction',
      subGenre: '',
      status: 'Idea',
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
      authorName: proj.authorName || 'Shandra Cahya',
      copyrightYear: proj.copyrightYear || new Date().getFullYear().toString(),
      synopsis: proj.synopsis,
      category: proj.category,
      seriesTitle: proj.seriesTitle || '',
      seriesOrder: proj.seriesOrder || 1,
      genre: proj.genre,
      subGenre: proj.subGenre || '',
      status: proj.status,
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

      const newProj = createProject({
        title: file.name.replace(/\.[^/.]+$/, ''),
        subtitle: 'Diimpor dari dokumen Word / WPS',
        synopsis: `Draf naskah hasil impor dari file ${file.name}. Terdiri dari ${parsedChapters.length} bab.`,
        category: 'standalone',
        genre: 'General Fiction',
        status: 'On Progress',
      });

      const projectArc = arcs.find((a) => a.projectId === newProj.id);
      const targetArcId = projectArc?.id || 'arc-1';

      parsedChapters.forEach((pc) => {
        createChapter(targetArcId, pc.title, pc.content);
      });

      showToast(`Berhasil mengimpor ${parsedChapters.length} bab dari Word!`, 'success');
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
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-5 pb-24 md:pb-12 transition-colors">
      {/* Simplified, eye-friendly Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--app-border)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--app-text)]">
            Daftar Cerita &amp; Proyek
          </h1>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            Kelola draf naskah tunggal maupun bersambung secara bebas tanpa batas kuota.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Docx Import Button */}
          <button
            onClick={() => docxInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs font-medium text-[var(--app-text)] hover:border-[var(--app-accent)] transition-all shadow-xs"
            title="Impor naskah dari Word / WPS (.docx)"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--app-accent)]" />
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-1 p-1 bg-[var(--app-card-sub)] border border-[var(--app-border)] rounded-xl">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              filterCategory === 'all'
                ? 'bg-[var(--app-card)] text-[var(--app-accent)] shadow-xs font-semibold'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            onClick={() => setFilterCategory('standalone')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              filterCategory === 'standalone'
                ? 'bg-[var(--app-card)] text-[var(--app-accent)] shadow-xs font-semibold'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            Standalone ({projects.filter((p) => p.category === 'standalone').length})
          </button>
          <button
            onClick={() => setFilterCategory('series')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              filterCategory === 'series'
                ? 'bg-[var(--app-card)] text-[var(--app-accent)] shadow-xs font-semibold'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            Series ({projects.filter((p) => p.category === 'series').length})
          </button>
        </div>

        {projects.length > 0 && (
          <div className="text-xs text-[var(--app-text-muted)]">
            <span>Aktif: </span>
            <strong className="text-[var(--app-text)] font-medium">
              {projects.find((p) => p.id === activeProjectId)?.title || 'Belum dipilih'}
            </strong>
          </div>
        )}
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="text-center py-16 px-4 my-6 rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-card)]">
          <FilePlus className="w-12 h-12 text-[var(--app-accent)] mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-semibold text-[var(--app-text)]">Belum ada proyek naskah</h3>
          <p className="text-xs text-[var(--app-text-muted)] max-w-sm mx-auto mt-1 mb-5">
            Mulai karya baru sekarang. Bebas menulis sebanyak apapun bab tanpa batasan minimum proyek.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Buat Cerita Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {filteredProjects.map((project) => {
            const isActive = project.id === activeProjectId;
            const statusColors: Record<ProjectStatus, string> = {
              Idea: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
              'On Progress': 'text-[var(--app-accent)] bg-[var(--app-accent-bg)] border-[var(--app-accent)]/30',
              Editing: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
              Completed: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            };

            return (
              <div
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  showToast(`Beralih ke proyek "${project.title}"`);
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? 'border-[var(--app-accent)] bg-[var(--app-card)] shadow-md ring-1 ring-[var(--app-accent)]/40'
                    : 'border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-border-hover)] hover:bg-[var(--app-card-sub)]'
                }`}
              >
                <div>
                  <div className="flex gap-3">
                    {/* Thumbnail Cover */}
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-[var(--app-card-sub)] border border-[var(--app-border)] shrink-0 relative shadow-xs">
                      {project.coverUrl ? (
                        <img
                          src={project.coverUrl}
                          alt={project.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--app-text-muted)]">
                          <BookMarked className="w-5 h-5 text-[var(--app-accent)] opacity-60" />
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute top-1 left-1 bg-[var(--app-accent)] text-black text-[8px] font-bold px-1 rounded">
                          AKTIF
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                            statusColors[project.status]
                          }`}
                        >
                          {project.status}
                        </span>
                        <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                          {project.category === 'series'
                            ? `Buku ${project.seriesOrder || 1}`
                            : 'Standalone'}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-[var(--app-text)] group-hover:text-[var(--app-accent)] transition-colors truncate">
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <p className="text-xs text-[var(--app-text-muted)] italic truncate">
                          {project.subtitle}
                        </p>
                      )}

                      <div className="mt-1 text-xs text-[var(--app-text-muted)]">
                        <span className="text-[var(--app-accent)] font-mono text-[11px] font-medium">
                          {project.genre}
                        </span>
                      </div>
                    </div>
                  </div>

                  {project.synopsis && (
                    <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 mt-3 leading-relaxed">
                      {project.synopsis}
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-2.5 border-t border-[var(--app-border)] flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProjectId(project.id);
                      setActiveTab('editor');
                    }}
                    className="flex items-center gap-1 text-xs text-[var(--app-accent)] hover:opacity-80 font-medium"
                  >
                    <span>Buka Naskah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditModal(project, e)}
                      className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)] rounded-lg transition-colors"
                      title="Ubah Rincian Proyek"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        requestConfirm({
                          title: 'Hapus Proyek Naskah',
                          message: `Yakin ingin menghapus naskah "${project.title}" beserta seluruh bab dan catatannya? Tindakan ini tidak dapat dibatalkan.`,
                          confirmLabel: 'Hapus Proyek',
                          onConfirm: () => deleteProject(project.id),
                        });
                      }}
                      className="p-1.5 text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
      )}

      {/* Modal: Create or Edit Project */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 shadow-2xl text-[var(--app-text)] my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <h2 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-[var(--app-accent)]" />
                {editingProject ? 'Perbarui Rincian Naskah' : 'Mulai Cerita / Naskah Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Judul Naskah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: The Obsidian Chronicles"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Sub-Judul (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Contoh: Volume 1"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Nama Penulis
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="Contoh: Shandra Cahya"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Tahun Copyright
                  </label>
                  <input
                    type="text"
                    value={formData.copyrightYear}
                    onChange={(e) => setFormData({ ...formData, copyrightYear: e.target.value })}
                    placeholder="Contoh: 2026"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Kategori Cerita
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProjectCategory })
                    }
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  >
                    <option value="standalone">Standalone (Buku Tunggal)</option>
                    <option value="series">Series (Cerita Bersambung)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Genre Cerita</label>
                  <select
                    value={formData.genre}
                    onChange={(e) =>
                      setFormData({ ...formData, genre: e.target.value as DarkGenre })
                    }
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
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
                    value={formData.subGenre}
                    onChange={(e) => setFormData({ ...formData, subGenre: e.target.value })}
                    placeholder="Contoh: Urban Fantasy, Supernatural..."
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                </div>

                {formData.category === 'series' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                        Nama Semesta / Seri
                      </label>
                      <input
                        type="text"
                        value={formData.seriesTitle}
                        onChange={(e) => setFormData({ ...formData, seriesTitle: e.target.value })}
                        placeholder="Contoh: Semesta Eldoria"
                        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                        Urutan Buku (#)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.seriesOrder}
                        onChange={(e) =>
                          setFormData({ ...formData, seriesOrder: parseInt(e.target.value) || 1 })
                        }
                        className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Status Pengerjaan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ProjectStatus })
                    }
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  >
                    <option value="Idea">Idea (Gagasan)</option>
                    <option value="On Progress">On Progress (Menulis)</option>
                    <option value="Editing">Editing (Penyuntingan)</option>
                    <option value="Completed">Completed (Tamat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    URL Sampul Buku (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                    placeholder="/src/assets/images/sample_book_cover_1793354596229.jpg"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Sinopsis / Premis Cerita
                  </label>
                  <textarea
                    rows={5}
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    placeholder="Gambarkan inti alur cerita..."
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-3 text-xs text-[var(--app-text)] focus:border-[var(--app-accent)] focus:outline-none resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all"
                >
                  {editingProject ? 'Simpan' : 'Mulai Menulis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
