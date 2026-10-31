import React, { useState, useRef } from 'react';
import { useNovel, BibleSubTab } from '../../context/NovelContext';
import {
  CharacterProfile,
  WorldSetting,
  ClueItem,
  VisualScene,
  MacroPlotBeat,
  CharacterRole,
  CharacterAliveStatus,
  ClueType,
  ClueStatus,
} from '../../types/novel';
import {
  Compass,
  Users,
  MapPin,
  HelpCircle,
  Eye,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Upload,
  X,
  ShieldAlert,
  Skull,
  HeartCrack,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';

export const WorldBibleView: React.FC = () => {
  const {
    activeProject,
    bibleSubTab,
    setBibleSubTab,
    projectCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    projectSettings,
    createSetting,
    updateSetting,
    deleteSetting,
    projectClues,
    createClue,
    updateClue,
    deleteClue,
    projectMacroBeats,
    updateMacroBeat,
    projectScenes,
    createScene,
    updateScene,
    deleteScene,
    showToast,
    requestConfirm,
  } = useNovel();

  // Modals state
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfile | null>(null);

  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<WorldSetting | null>(null);

  const [clueModalOpen, setClueModalOpen] = useState(false);
  const [editingClue, setEditingClue] = useState<ClueItem | null>(null);

  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<VisualScene | null>(null);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Character Form
  const [charForm, setCharForm] = useState({
    name: '',
    alias: '',
    role: 'Morally Gray' as CharacterRole,
    darkMotivation: '',
    traumaAndFatalFlaw: '',
    faction: '',
    aliveStatus: 'Alive' as CharacterAliveStatus,
    secretNotes: '',
    imageUrl: '',
    relationships: [] as Array<{ id: string; targetCharacterId: string; targetName: string; relationType: string }>,
  });

  // Setting Form
  const [settingForm, setSettingForm] = useState({
    name: '',
    realmType: 'Gothic Citadel',
    atmosphereAndClimate: '',
    cruelMoralLaws: '',
    magicOrTechRules: '',
    rulingFactions: '',
    imageUrl: '',
    notes: '',
  });

  // Clue Form
  const [clueForm, setClueForm] = useState({
    title: '',
    type: 'clue' as ClueType,
    status: 'Planted' as ClueStatus,
    chapterPlanted: '',
    chapterPayoff: '',
    revelationNotes: '',
    relatedCharacter: '',
  });

  // Scene Form
  const [sceneForm, setSceneForm] = useState({
    title: '',
    chapterRef: '',
    moodAndAtmosphere: '',
    lightingAndWeather: '',
    tensionLevel: 'Mencekam' as any,
    imageUrl: '',
    notes: '',
  });

  // Helper for file base64
  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Character Modal
  const openCharModal = (char?: CharacterProfile) => {
    if (char) {
      setEditingCharacter(char);
      setCharForm({
        name: char.name,
        alias: char.alias || '',
        role: char.role,
        darkMotivation: char.darkMotivation,
        traumaAndFatalFlaw: char.traumaAndFatalFlaw,
        faction: char.faction,
        aliveStatus: char.aliveStatus,
        secretNotes: char.secretNotes,
        imageUrl: char.imageUrl || '',
        relationships: char.relationships || [],
      });
    } else {
      setEditingCharacter(null);
      setCharForm({
        name: '',
        alias: '',
        role: 'Morally Gray',
        darkMotivation: '',
        traumaAndFatalFlaw: '',
        faction: '',
        aliveStatus: 'Alive',
        secretNotes: '',
        imageUrl: '/src/assets/images/character_lucian_1793354596738.jpg',
        relationships: [],
      });
    }
    setCharacterModalOpen(true);
  };

  // Open Setting Modal
  const openSettingModal = (s?: WorldSetting) => {
    if (s) {
      setEditingSetting(s);
      setSettingForm({
        name: s.name,
        realmType: s.realmType,
        atmosphereAndClimate: s.atmosphereAndClimate,
        cruelMoralLaws: s.cruelMoralLaws,
        magicOrTechRules: s.magicOrTechRules,
        rulingFactions: s.rulingFactions,
        imageUrl: s.imageUrl || '',
        notes: s.notes || '',
      });
    } else {
      setEditingSetting(null);
      setSettingForm({
        name: '',
        realmType: 'Gothic Citadel',
        atmosphereAndClimate: '',
        cruelMoralLaws: '',
        magicOrTechRules: '',
        rulingFactions: '',
        imageUrl: '/src/assets/images/world_map_obsidian_1793354598729.jpg',
        notes: '',
      });
    }
    setSettingModalOpen(true);
  };

  // Open Clue Modal
  const openClueModal = (c?: ClueItem) => {
    if (c) {
      setEditingClue(c);
      setClueForm({
        title: c.title,
        type: c.type,
        status: c.status,
        chapterPlanted: c.chapterPlanted || '',
        chapterPayoff: c.chapterPayoff || '',
        revelationNotes: c.revelationNotes,
        relatedCharacter: c.relatedCharacter || '',
      });
    } else {
      setEditingClue(null);
      setClueForm({
        title: '',
        type: 'clue',
        status: 'Planted',
        chapterPlanted: '',
        chapterPayoff: '',
        revelationNotes: '',
        relatedCharacter: '',
      });
    }
    setClueModalOpen(true);
  };

  // Open Scene Modal
  const openSceneModal = (sc?: VisualScene) => {
    if (sc) {
      setEditingScene(sc);
      setSceneForm({
        title: sc.title,
        chapterRef: sc.chapterRef || '',
        moodAndAtmosphere: sc.moodAndAtmosphere,
        lightingAndWeather: sc.lightingAndWeather,
        tensionLevel: sc.tensionLevel,
        imageUrl: sc.imageUrl || '',
        notes: sc.notes,
      });
    } else {
      setEditingScene(null);
      setSceneForm({
        title: '',
        chapterRef: '',
        moodAndAtmosphere: '',
        lightingAndWeather: '',
        tensionLevel: 'Mencekam',
        imageUrl: '/src/assets/images/scene_cathedral_ruins_1793354597832.jpg',
        notes: '',
      });
    }
    setSceneModalOpen(true);
  };

  const handleSaveCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charForm.name.trim()) return;
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, charForm);
    } else {
      createCharacter(charForm);
    }
    setCharacterModalOpen(false);
  };

  const handleSaveSetting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingForm.name.trim()) return;
    if (editingSetting) {
      updateSetting(editingSetting.id, settingForm);
    } else {
      createSetting(settingForm);
    }
    setSettingModalOpen(false);
  };

  const handleSaveClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueForm.title.trim()) return;
    if (editingClue) {
      updateClue(editingClue.id, clueForm);
    } else {
      createClue(clueForm);
    }
    setClueModalOpen(false);
  };

  const handleSaveScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sceneForm.title.trim()) return;
    if (editingScene) {
      updateScene(editingScene.id, sceneForm);
    } else {
      createScene(sceneForm);
    }
    setSceneModalOpen(false);
  };

  const subTabs: { id: BibleSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'characters', label: `Karakter (${projectCharacters.length})`, icon: Users },
    { id: 'settings', label: `Latar & Peta (${projectSettings.length})`, icon: MapPin },
    { id: 'clues', label: `Misteri & Clues (${projectClues.length})`, icon: HelpCircle },
    { id: 'scenes', label: `Papan Adegan (${projectScenes.length})`, icon: Eye },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-5 pb-24 md:pb-12 text-[var(--app-text)] transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--app-border)]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--app-text)]">
            World Bible: {activeProject?.title || 'Semesta Cerita'}
          </h1>
          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
            Pusat database tokoh, latar dunia, misteri alur, dan adegan visual.
          </p>
        </div>

        {/* Sub-tab quick actions */}
        <div>
          {bibleSubTab === 'characters' && (
            <button
              onClick={() => openCharModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Tokoh</span>
            </button>
          )}
          {bibleSubTab === 'settings' && (
            <button
              onClick={() => openSettingModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Latar</span>
            </button>
          )}
          {bibleSubTab === 'clues' && (
            <button
              onClick={() => openClueModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Clue</span>
            </button>
          )}
          {bibleSubTab === 'scenes' && (
            <button
              onClick={() => openSceneModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--app-accent)] text-xs font-semibold text-black hover:opacity-90 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Adegan</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab navigation buttons */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-[var(--app-border)]">
        {subTabs.map((st) => {
          const Icon = st.icon;
          const isActive = bibleSubTab === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setBibleSubTab(st.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--app-card)] text-[var(--app-accent)] border border-[var(--app-border)] shadow-xs font-semibold'
                  : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-sub)]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--app-accent)]' : 'text-[var(--app-text-muted)]'}`} />
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 1. CHARACTER DIRECTORY SUB-TAB */}
      {/* ============================================================ */}
      {bibleSubTab === 'characters' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectCharacters.map((char) => {
              const roleColors: Record<CharacterRole, string> = {
                Protagonist: 'text-sky-400 border-sky-400/20 bg-sky-400/10',
                Antagonist: 'text-red-400 border-red-400/20 bg-red-400/10',
                'Anti-Hero': 'text-[#f472b6] border-[#f472b6]/20 bg-[#f472b6]/10',
                Deuteragonist: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
                'Morally Gray': 'text-purple-400 border-purple-400/20 bg-purple-400/10',
                Secondary: 'text-gray-400 border-gray-400/20 bg-gray-400/10',
              };

              return (
                <div
                  key={char.id}
                  className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 flex flex-col justify-between hover:border-[var(--app-accent)] transition-all shadow-xs"
                >
                  <div>
                    {/* Top Character Header with Portrait */}
                    <div className="flex gap-4 items-start">
                      <div
                        onClick={() => char.imageUrl && setLightboxImage(char.imageUrl)}
                        className="w-18 h-18 rounded-2xl bg-[var(--app-card-sub)] border border-[var(--app-border)] shrink-0 overflow-hidden relative cursor-pointer group shadow-xs"
                      >
                        {char.imageUrl ? (
                          <>
                            <img
                              src={char.imageUrl}
                              alt={char.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--app-text-muted)]">
                            <Users className="w-6 h-6 text-[var(--app-accent)]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                              roleColors[char.role]
                            }`}
                          >
                            {char.role}
                          </span>
                          <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                            {char.aliveStatus}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[var(--app-text)] truncate">{char.name}</h3>
                        {char.alias && (
                          <p className="text-xs text-[var(--app-accent)] italic truncate">{char.alias}</p>
                        )}
                        <p className="text-xs text-[var(--app-text-muted)] truncate mt-0.5">{char.faction}</p>
                      </div>
                    </div>

                    {/* Dark Trait & Motivation */}
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="bg-[var(--app-card-sub)] rounded-xl p-2.5 border border-[var(--app-border)]">
                        <span className="text-[10px] uppercase font-semibold text-[var(--app-accent)] flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Motivasi Gelap / Dendam:
                        </span>
                        <p className="text-[var(--app-text)] mt-1 leading-relaxed">{char.darkMotivation}</p>
                      </div>

                      <div className="bg-[var(--app-card-sub)] rounded-xl p-2.5 border border-[var(--app-border)]">
                        <span className="text-[10px] uppercase font-semibold text-rose-500 flex items-center gap-1">
                          <Skull className="w-3 h-3" />
                          Trauma &amp; Fatal Flaw:
                        </span>
                        <p className="text-[var(--app-text)] mt-1 leading-relaxed">
                          {char.traumaAndFatalFlaw}
                        </p>
                      </div>

                      {char.relationships && char.relationships.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-semibold text-[var(--app-text-muted)] block mb-1">
                            Relasi Tokoh:
                          </span>
                          <div className="space-y-1">
                            {char.relationships.map((rel) => (
                              <div
                                key={rel.id}
                                className="flex items-center justify-between text-[11px] text-[var(--app-text-muted)] bg-[var(--app-card-sub)] px-2.5 py-1 rounded-lg border border-[var(--app-border)]"
                              >
                                <span className="text-[var(--app-text)] font-medium">{rel.targetName}</span>
                                <span className="text-[var(--app-accent)] italic">{rel.relationType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-end gap-1">
                    <button
                      onClick={() => openCharModal(char)}
                      className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                      title="Ubah Profil Tokoh"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        requestConfirm({
                          title: 'Hapus Karakter',
                          message: `Yakin ingin menghapus tokoh "${char.name}"?`,
                          confirmLabel: 'Hapus',
                          onConfirm: () => deleteCharacter(char.id),
                        });
                      }}
                      className="p-1.5 text-[var(--app-text-muted)] hover:text-red-400 rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                      title="Hapus Tokoh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SETTINGS & WORLD BUILDING SUB-TAB */}
      {/* ============================================================ */}
      {bibleSubTab === 'settings' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projectSettings.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 flex flex-col justify-between hover:border-[var(--app-accent)] transition-all shadow-xs"
              >
                <div>
                  {/* Setting visual map or sketch */}
                  {s.imageUrl && (
                    <div
                      onClick={() => setLightboxImage(s.imageUrl || null)}
                      className="w-full h-48 rounded-xl overflow-hidden bg-[var(--app-card-sub)] border border-[var(--app-border)] mb-4 relative cursor-pointer group shadow-md"
                    >
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="flex items-center gap-1.5 text-xs text-white font-medium bg-black/70 px-3 py-1.5 rounded-lg border border-white/20">
                          <ZoomIn className="w-3.5 h-3.5 text-[#f472b6]" />
                          Perbesar Peta / Sketsa
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[var(--app-accent)] uppercase px-2 py-0.5 rounded border border-[var(--app-border)] bg-[var(--app-card-sub)]">
                      {s.realmType}
                    </span>
                    <span className="text-xs text-[var(--app-text-muted)] truncate">{s.rulingFactions}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[var(--app-text)]">{s.name}</h3>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">
                    {s.atmosphereAndClimate}
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-[var(--app-card-sub)] rounded-xl p-3 border border-[var(--app-border)]">
                      <span className="text-[10px] uppercase font-semibold text-rose-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Hukum &amp; Moralitas Dunia Kejam (Taboo):
                      </span>
                      <p className="text-[var(--app-text)] mt-1 leading-relaxed">{s.cruelMoralLaws}</p>
                    </div>

                    <div className="bg-[var(--app-card-sub)] rounded-xl p-3 border border-[var(--app-border)]">
                      <span className="text-[10px] uppercase font-semibold text-[var(--app-accent)] flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Aturan Sihir / Batasan Teknologi:
                      </span>
                      <p className="text-[var(--app-text)] mt-1 leading-relaxed">{s.magicOrTechRules}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-end gap-1">
                  <button
                    onClick={() => openSettingModal(s)}
                    className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      requestConfirm({
                        title: 'Hapus Latar Dunia',
                        message: `Yakin ingin menghapus setting "${s.name}"?`,
                        confirmLabel: 'Hapus',
                        onConfirm: () => deleteSetting(s.id),
                      });
                    }}
                    className="p-1.5 text-[var(--app-text-muted)] hover:text-red-400 rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MYSTERY & CLUE BOARD SUB-TAB */}
      {/* ============================================================ */}
      {bibleSubTab === 'clues' && (
        <div className="mt-6 space-y-8">
          {/* Macro Plot Arc Beats */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--app-text)]">
                  Pemetaan Alur Makro Cerita (Macro Beat Sheet)
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Kerangka struktural cerita dari Inciting Incident hingga Resolusi untuk mencegah plot hole.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projectMacroBeats.map((beat) => (
                <div
                  key={beat.id}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-3.5 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--app-accent)] mb-1">
                      <span>{beat.stage}</span>
                      <span className="text-[var(--app-text-muted)]">{beat.targetChapter}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={beat.description}
                      onChange={(e) =>
                        updateMacroBeat(beat.id, { description: e.target.value })
                      }
                      className="w-full bg-[var(--app-card-sub)] border border-[var(--app-border)] text-xs text-[var(--app-text)] resize-none focus:outline-none focus:border-[var(--app-accent)] rounded-lg p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clues & Foreshadowing Tracker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--app-text)]">
                  Papan Petunjuk, Foreshadowing &amp; Plot Twist (Mikro)
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Lacak di bab mana petunjuk ditanam dan di mana kebenaran terungkap agar tidak terjadi inkonsistensi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectClues.map((clue) => {
                const statusStyles: Record<ClueStatus, { color: string; label: string }> = {
                  Planted: { color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', label: 'Ditanam (Planted)' },
                  'Dropping Hints': { color: 'text-sky-500 border-sky-500/20 bg-sky-500/10', label: 'Petunjuk Terselubung' },
                  Revealed: { color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', label: 'Terungkap (Revealed)' },
                  Unresolved: { color: 'text-[var(--app-accent)] border-[var(--app-accent)]/20 bg-[var(--app-accent-bg)]', label: 'Belum Terpecahkan' },
                };

                return (
                  <div
                    key={clue.id}
                    className="rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 flex flex-col justify-between hover:border-[var(--app-accent)] transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                            statusStyles[clue.status].color
                          }`}
                        >
                          {statusStyles[clue.status].label}
                        </span>
                        <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                          {clue.type.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[var(--app-text)]">{clue.title}</h4>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-[var(--app-card-sub)] p-2.5 rounded-lg border border-[var(--app-border)]">
                        <div>
                          <span className="text-[10px] text-[var(--app-text-muted)] uppercase block font-semibold">
                            Ditanam di:
                          </span>
                          <span className="text-[var(--app-text)] font-medium">{clue.chapterPlanted || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[var(--app-text-muted)] uppercase block font-semibold">
                            Terungkap di:
                          </span>
                          <span className="text-[var(--app-accent)] font-semibold">{clue.chapterPayoff || '-'}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-[var(--app-text-muted)] block mb-1">
                          Catatan Twist &amp; Relevansi:
                        </span>
                        <p className="text-[var(--app-text)] leading-relaxed bg-[var(--app-card-sub)] p-2.5 rounded-lg border border-[var(--app-border)]">
                          {clue.revelationNotes}
                        </p>
                      </div>

                      {clue.relatedCharacter && (
                        <div className="mt-2 text-[11px] text-[var(--app-text-muted)]">
                          Tokoh Terkait: <strong className="text-[var(--app-text)]">{clue.relatedCharacter}</strong>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[var(--app-border)] flex items-center justify-end gap-1">
                      <button
                        onClick={() => openClueModal(clue)}
                        className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: 'Hapus Petunjuk Alur',
                            message: `Yakin ingin menghapus petunjuk "${clue.title}"?`,
                            confirmLabel: 'Hapus',
                            onConfirm: () => deleteClue(clue.id),
                          });
                        }}
                        className="p-1.5 text-[var(--app-text-muted)] hover:text-red-400 rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. VISUAL SCENE BOARD SUB-TAB */}
      {/* ============================================================ */}
      {bibleSubTab === 'scenes' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectScenes.map((scene) => (
              <div
                key={scene.id}
                className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-5 flex flex-col justify-between hover:border-[var(--app-accent)] transition-all shadow-xs"
              >
                <div>
                  {scene.imageUrl && (
                    <div
                      onClick={() => setLightboxImage(scene.imageUrl || null)}
                      className="w-full h-52 rounded-xl overflow-hidden bg-[var(--app-card-sub)] border border-[var(--app-border)] mb-4 relative cursor-pointer group shadow-md"
                    >
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="flex items-center gap-1.5 text-xs text-white font-medium bg-black/70 px-3 py-1.5 rounded-lg border border-white/20">
                          <ZoomIn className="w-3.5 h-3.5 text-[#f472b6]" />
                          Lihat Resolusi Penuh
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-[var(--app-accent)] uppercase px-2 py-0.5 rounded border border-[var(--app-border)] bg-[var(--app-card-sub)]">
                      Tensi: {scene.tensionLevel}
                    </span>
                    <span className="text-xs text-[var(--app-text-muted)] font-mono">{scene.chapterRef}</span>
                  </div>

                  <h3 className="text-base font-bold text-[var(--app-text)]">{scene.title}</h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-[var(--app-card-sub)] rounded-xl p-2.5 border border-[var(--app-border)]">
                      <span className="text-[10px] uppercase font-semibold text-[var(--app-text-muted)] block mb-0.5">
                        Mood &amp; Atmosfer:
                      </span>
                      <p className="text-[var(--app-text)]">{scene.moodAndAtmosphere}</p>
                    </div>

                    <div className="bg-[var(--app-card-sub)] rounded-xl p-2.5 border border-[var(--app-border)]">
                      <span className="text-[10px] uppercase font-semibold text-[var(--app-text-muted)] block mb-0.5">
                        Pencahayaan &amp; Cuaca:
                      </span>
                      <p className="text-[var(--app-text)]">{scene.lightingAndWeather}</p>
                    </div>

                    {scene.notes && (
                      <div className="bg-[var(--app-card-sub)] rounded-xl p-2.5 border border-[var(--app-border)]">
                        <span className="text-[10px] uppercase font-semibold text-[var(--app-accent)] block mb-0.5">
                          Catatan Teknis Penulis:
                        </span>
                        <p className="text-[var(--app-text)]">{scene.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--app-border)] flex items-center justify-end gap-1">
                  <button
                    onClick={() => openSceneModal(scene)}
                    className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      requestConfirm({
                        title: 'Hapus Adegan Visual',
                        message: `Yakin ingin menghapus adegan "${scene.title}"?`,
                        confirmLabel: 'Hapus',
                        onConfirm: () => deleteScene(scene.id),
                      });
                    }}
                    className="p-1.5 text-[var(--app-text-muted)] hover:text-red-400 rounded-lg hover:bg-[var(--app-card-sub)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CHARACTER PROFILE */}
      {/* ============================================================ */}
      {characterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl text-[var(--app-text)] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
              <h3 className="text-base font-bold text-[var(--app-text)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--app-accent)]" />
                {editingCharacter ? 'Edit Profil Tokoh' : 'Tambah Tokoh Baru'}
              </h3>
              <button onClick={() => setCharacterModalOpen(false)} className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCharacter} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Nama Tokoh *</label>
                  <input
                    type="text"
                    required
                    value={charForm.name}
                    onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Gelar / Alias</label>
                  <input
                    type="text"
                    value={charForm.alias}
                    onChange={(e) => setCharForm({ ...charForm, alias: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Peran Arketipe</label>
                  <select
                    value={charForm.role}
                    onChange={(e) => setCharForm({ ...charForm, role: e.target.value as CharacterRole })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  >
                    <option value="Protagonist">Protagonist</option>
                    <option value="Anti-Hero">Anti-Hero</option>
                    <option value="Morally Gray">Morally Gray</option>
                    <option value="Antagonist">Antagonist</option>
                    <option value="Deuteragonist">Deuteragonist</option>
                    <option value="Secondary">Secondary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Status Keberadaan</label>
                  <select
                    value={charForm.aliveStatus}
                    onChange={(e) => setCharForm({ ...charForm, aliveStatus: e.target.value as CharacterAliveStatus })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  >
                    <option value="Alive">Hidup (Alive)</option>
                    <option value="Deceased">Tewas (Deceased)</option>
                    <option value="Missing">Hilang (Missing)</option>
                    <option value="Cursed / Undead">Terkutuk / Mayat Hidup</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Faksi / Guild / Wangsa</label>
                  <input
                    type="text"
                    value={charForm.faction}
                    onChange={(e) => setCharForm({ ...charForm, faction: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Motivasi Gelap / Obsesi / Balas Dendam
                  </label>
                  <textarea
                    rows={2}
                    value={charForm.darkMotivation}
                    onChange={(e) => setCharForm({ ...charForm, darkMotivation: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Trauma Masa Lalu &amp; Fatal Flaw (Kelemahan Fatal)
                  </label>
                  <textarea
                    rows={2}
                    value={charForm.traumaAndFatalFlaw}
                    onChange={(e) => setCharForm({ ...charForm, traumaAndFatalFlaw: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)] resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">URL Foto Tokoh</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={charForm.imageUrl}
                      onChange={(e) => setCharForm({ ...charForm, imageUrl: e.target.value })}
                      placeholder="/src/assets/images/character_lucian_1793354596738.jpg"
                      className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none focus:border-[var(--app-accent)]"
                    />
                    <label className="cursor-pointer px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] text-xs text-[var(--app-text)] hover:border-[var(--app-accent)] flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, (url) => setCharForm({ ...charForm, imageUrl: url }));
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setCharacterModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
                >
                  Simpan Tokoh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: SETTING & WORLD BUILDING */}
      {/* ============================================================ */}
      {settingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl text-[var(--app-text)] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
              <h3 className="text-base font-bold text-[var(--app-text)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--app-accent)]" />
                {editingSetting ? 'Edit Latar / Wilayah' : 'Tambah Latar Baru'}
              </h3>
              <button onClick={() => setSettingModalOpen(false)} className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSetting} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Nama Wilayah / Tempat *</label>
                  <input
                    type="text"
                    required
                    value={settingForm.name}
                    onChange={(e) => setSettingForm({ ...settingForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Tipe Wilayah</label>
                  <input
                    type="text"
                    value={settingForm.realmType}
                    onChange={(e) => setSettingForm({ ...settingForm, realmType: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Atmosfer, Iklim &amp; Bahaya</label>
                  <textarea
                    rows={2}
                    value={settingForm.atmosphereAndClimate}
                    onChange={(e) => setSettingForm({ ...settingForm, atmosphereAndClimate: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Hukum &amp; Moralitas Dunia Kejam (Taboo)
                  </label>
                  <textarea
                    rows={2}
                    value={settingForm.cruelMoralLaws}
                    onChange={(e) => setSettingForm({ ...settingForm, cruelMoralLaws: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                    Aturan Sihir / Batasan Teknologi (Cost &amp; Consequence)
                  </label>
                  <textarea
                    rows={2}
                    value={settingForm.magicOrTechRules}
                    onChange={(e) => setSettingForm({ ...settingForm, magicOrTechRules: e.target.value })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">URL Gambar Peta / Sketsa</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settingForm.imageUrl}
                      onChange={(e) => setSettingForm({ ...settingForm, imageUrl: e.target.value })}
                      className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                    />
                    <label className="cursor-pointer px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] text-xs text-[var(--app-text)] hover:opacity-80 flex items-center gap-1.5 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, (url) => setSettingForm({ ...settingForm, imageUrl: url }));
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setSettingModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
                >
                  Simpan Latar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CLUE & MYSTERY */}
      {/* ============================================================ */}
      {clueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl text-[var(--app-text)] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
              <h3 className="text-base font-bold text-[var(--app-text)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--app-accent)]" />
                {editingClue ? 'Edit Petunjuk / Twist' : 'Tambah Petunjuk Misteri'}
              </h3>
              <button onClick={() => setClueModalOpen(false)} className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClue} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Nama Petunjuk / Objek Kunci *</label>
                <input
                  type="text"
                  required
                  value={clueForm.title}
                  onChange={(e) => setClueForm({ ...clueForm, title: e.target.value })}
                  placeholder="Contoh: Belati Perak Bertoreh 7 Simbol"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Kategori</label>
                  <select
                    value={clueForm.type}
                    onChange={(e) => setClueForm({ ...clueForm, type: e.target.value as ClueType })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  >
                    <option value="clue">Clue (Petunjuk)</option>
                    <option value="foreshadowing">Foreshadowing</option>
                    <option value="plot-twist">Plot Twist</option>
                    <option value="red-herring">Red Herring (Pengecoh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Status Progres</label>
                  <select
                    value={clueForm.status}
                    onChange={(e) => setClueForm({ ...clueForm, status: e.target.value as ClueStatus })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  >
                    <option value="Planted">Ditanam (Planted)</option>
                    <option value="Dropping Hints">Petunjuk Terselubung</option>
                    <option value="Revealed">Terungkap (Revealed)</option>
                    <option value="Unresolved">Belum Terpecahkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Ditanam di Bab</label>
                  <input
                    type="text"
                    value={clueForm.chapterPlanted}
                    onChange={(e) => setClueForm({ ...clueForm, chapterPlanted: e.target.value })}
                    placeholder="Misal: Bab 1 &amp; 2"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Terungkap di Bab</label>
                  <input
                    type="text"
                    value={clueForm.chapterPayoff}
                    onChange={(e) => setClueForm({ ...clueForm, chapterPayoff: e.target.value })}
                    placeholder="Misal: Bab 8"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Karakter Terkait</label>
                <input
                  type="text"
                  value={clueForm.relatedCharacter}
                  onChange={(e) => setClueForm({ ...clueForm, relatedCharacter: e.target.value })}
                  placeholder="Misal: Dame Vespera"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Catatan Rahasia &amp; Fakta Sejati Twist
                </label>
                <textarea
                  rows={3}
                  value={clueForm.revelationNotes}
                  onChange={(e) => setClueForm({ ...clueForm, revelationNotes: e.target.value })}
                  placeholder="Jelaskan apa arti sejati petunjuk ini dan bagaimana hal ini mengecoh pembaca..."
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] p-2.5 text-xs text-[var(--app-text)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setClueModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
                >
                  Simpan Clue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VISUAL SCENE */}
      {/* ============================================================ */}
      {sceneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl text-[var(--app-text)] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
              <h3 className="text-base font-bold text-[var(--app-text)] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[var(--app-accent)]" />
                {editingScene ? 'Edit Moodboard Adegan' : 'Tambah Adegan Baru'}
              </h3>
              <button onClick={() => setSceneModalOpen(false)} className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScene} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Judul Adegan *</label>
                <input
                  type="text"
                  required
                  value={sceneForm.title}
                  onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })}
                  placeholder="Misal: Konfrontasi di Jembatan Katedral"
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Bab Terkait</label>
                  <input
                    type="text"
                    value={sceneForm.chapterRef}
                    onChange={(e) => setSceneForm({ ...sceneForm, chapterRef: e.target.value })}
                    placeholder="Misal: Bab 11"
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Tingkat Tensi</label>
                  <select
                    value={sceneForm.tensionLevel}
                    onChange={(e) => setSceneForm({ ...sceneForm, tensionLevel: e.target.value as any })}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  >
                    <option value="Rendah">Rendah (Pacing santai)</option>
                    <option value="Mencekam">Mencekam (Dread)</option>
                    <option value="Tinggi">Tinggi (Aksi / Intrik)</option>
                    <option value="Puncak Klimaks">Puncak Klimaks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Mood &amp; Suasana</label>
                <input
                  type="text"
                  value={sceneForm.moodAndAtmosphere}
                  onChange={(e) => setSceneForm({ ...sceneForm, moodAndAtmosphere: e.target.value })}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">Pencahayaan &amp; Cuaca</label>
                <input
                  type="text"
                  value={sceneForm.lightingAndWeather}
                  onChange={(e) => setSceneForm({ ...sceneForm, lightingAndWeather: e.target.value })}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">URL Gambar Referensi Adegan</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sceneForm.imageUrl}
                    onChange={(e) => setSceneForm({ ...sceneForm, imageUrl: e.target.value })}
                    className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] px-3 py-2 text-xs text-[var(--app-text)] focus:outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-sub)] text-xs text-[var(--app-text)] hover:opacity-80 flex items-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (url) => setSceneForm({ ...sceneForm, imageUrl: url }));
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setSceneModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--app-accent)] text-black font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
                >
                  Simpan Adegan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX FOR HIGH-RESOLUTION MAPS / SCENES */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Visual Preview"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-[#333] shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#f472b6] flex items-center gap-1 text-xs"
            >
              <X className="w-4 h-4" />
              <span>Tutup (ESC)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
