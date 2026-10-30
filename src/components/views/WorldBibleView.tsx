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
    <div className="max-w-7xl mx-auto px-4 lg:px-7 py-6 pb-24 md:pb-12 text-[#e2e8f0]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#1b1c28]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#f472b6] font-medium font-cinzel">
            Story Mapping Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            World Bible: {activeProject?.title}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            Pusat semesta cerita gotik &amp; thriller: kelola motif trauma tokoh, hukum dunia kejam, foreshadowing misteri, dan moodboard adegan.
          </p>
        </div>

        {/* Sub-tab quick actions */}
        <div>
          {bibleSubTab === 'characters' && (
            <button
              onClick={() => openCharModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-xs font-semibold text-black hover:opacity-95 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Tokoh</span>
            </button>
          )}
          {bibleSubTab === 'settings' && (
            <button
              onClick={() => openSettingModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-xs font-semibold text-black hover:opacity-95 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Latar / Peta</span>
            </button>
          )}
          {bibleSubTab === 'clues' && (
            <button
              onClick={() => openClueModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-xs font-semibold text-black hover:opacity-95 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Clue / Twist</span>
            </button>
          )}
          {bibleSubTab === 'scenes' && (
            <button
              onClick={() => openSceneModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#ec4899] text-xs font-semibold text-black hover:opacity-95 transition-all shadow-[0_0_15px_rgba(244,114,182,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Adegan</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab navigation buttons */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-[#181924]">
        {subTabs.map((st) => {
          const Icon = st.icon;
          const isActive = bibleSubTab === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setBibleSubTab(st.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#181926] text-[#f472b6] border border-[#2e3146] shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#101118]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#f472b6]' : 'text-gray-500'}`} />
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
                  className="rounded-2xl border border-[#1b1c28] bg-[#090a0f] p-5 flex flex-col justify-between hover:border-[#2a2d3e] transition-all"
                >
                  <div>
                    {/* Top Character Header with Portrait */}
                    <div className="flex gap-4 items-start">
                      <div
                        onClick={() => char.imageUrl && setLightboxImage(char.imageUrl)}
                        className="w-18 h-18 rounded-2xl bg-[#141520] border border-[#232535] shrink-0 overflow-hidden relative cursor-pointer group shadow-md"
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
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Users className="w-6 h-6 text-gray-500" />
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
                          <span className="text-[10px] text-gray-500 font-mono">
                            {char.aliveStatus}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white truncate">{char.name}</h3>
                        {char.alias && (
                          <p className="text-xs text-[#f472b6] italic truncate">{char.alias}</p>
                        )}
                        <p className="text-xs text-gray-400 truncate mt-0.5">{char.faction}</p>
                      </div>
                    </div>

                    {/* Dark Trait & Motivation */}
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="bg-[#10111a] rounded-xl p-2.5 border border-[#1b1d2a]">
                        <span className="text-[10px] uppercase font-semibold text-[#f472b6] flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Motivasi Gelap / Dendam:
                        </span>
                        <p className="text-gray-300 mt-1 leading-relaxed">{char.darkMotivation}</p>
                      </div>

                      <div className="bg-[#10111a] rounded-xl p-2.5 border border-[#1b1d2a]">
                        <span className="text-[10px] uppercase font-semibold text-[#fb7185] flex items-center gap-1">
                          <Skull className="w-3 h-3" />
                          Trauma &amp; Fatal Flaw:
                        </span>
                        <p className="text-gray-300 mt-1 leading-relaxed">
                          {char.traumaAndFatalFlaw}
                        </p>
                      </div>

                      {char.relationships && char.relationships.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                            Relasi Tokoh:
                          </span>
                          <div className="space-y-1">
                            {char.relationships.map((rel) => (
                              <div
                                key={rel.id}
                                className="flex items-center justify-between text-[11px] text-gray-400 bg-[#0e0f17] px-2 py-1 rounded-lg border border-[#1b1c28]"
                              >
                                <span className="text-white font-medium">{rel.targetName}</span>
                                <span className="text-[#f472b6] italic">{rel.relationType}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#171824] flex items-center justify-end gap-1">
                    <button
                      onClick={() => openCharModal(char)}
                      className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1c28] transition-colors"
                      title="Ubah Profil Tokoh"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus tokoh "${char.name}"?`)) deleteCharacter(char.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#1a1c28] transition-colors"
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
                className="rounded-2xl border border-[#1b1c28] bg-[#090a0f] p-5 flex flex-col justify-between hover:border-[#2a2d3e] transition-all"
              >
                <div>
                  {/* Setting visual map or sketch */}
                  {s.imageUrl && (
                    <div
                      onClick={() => setLightboxImage(s.imageUrl || null)}
                      className="w-full h-48 rounded-xl overflow-hidden bg-[#12131d] border border-[#222434] mb-4 relative cursor-pointer group shadow-lg"
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
                    <span className="text-[10px] font-mono text-[#f472b6] uppercase px-2 py-0.5 rounded border border-[#f472b6]/20 bg-[#f472b6]/10">
                      {s.realmType}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{s.rulingFactions}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {s.atmosphereAndClimate}
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-[#10111a] rounded-xl p-3 border border-[#1a1c2a]">
                      <span className="text-[10px] uppercase font-semibold text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Hukum &amp; Moralitas Dunia Kejam (Taboo):
                      </span>
                      <p className="text-gray-300 mt-1 leading-relaxed">{s.cruelMoralLaws}</p>
                    </div>

                    <div className="bg-[#10111a] rounded-xl p-3 border border-[#1a1c2a]">
                      <span className="text-[10px] uppercase font-semibold text-[#f472b6] flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Aturan Sihir / Batasan Teknologi:
                      </span>
                      <p className="text-gray-300 mt-1 leading-relaxed">{s.magicOrTechRules}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#171824] flex items-center justify-end gap-1">
                  <button
                    onClick={() => openSettingModal(s)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1c28] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus setting "${s.name}"?`)) deleteSetting(s.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#1a1c28] transition-colors"
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Pemetaan Alur Makro Cerita (Macro Beat Sheet)
                </h3>
                <p className="text-xs text-gray-400">
                  Kerangka struktural dark story dari Inciting Incident hingga Grim Resolution untuk mencegah plot hole.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projectMacroBeats.map((beat) => (
                <div
                  key={beat.id}
                  className="rounded-xl border border-[#1b1c28] bg-[#0c0d14] p-3.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#f472b6] mb-1">
                      <span>{beat.stage}</span>
                      <span className="text-gray-500">{beat.targetChapter}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={beat.description}
                      onChange={(e) =>
                        updateMacroBeat(beat.id, { description: e.target.value })
                      }
                      className="w-full bg-transparent text-xs text-gray-300 resize-none focus:outline-none focus:bg-[#12131d] rounded p-1"
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Papan Petunjuk, Foreshadowing &amp; Plot Twist (Mikro)
                </h3>
                <p className="text-xs text-gray-400">
                  Lacak di bab mana petunjuk ditanam dan di mana kebenaran terungkap agar tidak terjadi inkonsistensi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectClues.map((clue) => {
                const statusStyles: Record<ClueStatus, { color: string; label: string }> = {
                  Planted: { color: 'text-amber-400 border-amber-400/20 bg-amber-400/10', label: 'Ditanam (Planted)' },
                  'Dropping Hints': { color: 'text-sky-400 border-sky-400/20 bg-sky-400/10', label: 'Petunjuk Terselubung' },
                  Revealed: { color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10', label: 'Terungkap (Revealed)' },
                  Unresolved: { color: 'text-[#f472b6] border-[#f472b6]/20 bg-[#f472b6]/10', label: 'Belum Terpecahkan' },
                };

                return (
                  <div
                    key={clue.id}
                    className="rounded-xl border border-[#1b1c28] bg-[#090a0f] p-4 flex flex-col justify-between hover:border-[#2a2d3e] transition-all"
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
                        <span className="text-[10px] text-gray-500 font-mono">
                          {clue.type.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{clue.title}</h4>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-[#10111a] p-2.5 rounded-lg border border-[#1b1c28]">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                            Ditanam di:
                          </span>
                          <span className="text-gray-200">{clue.chapterPlanted || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase block font-semibold">
                            Terungkap di:
                          </span>
                          <span className="text-[#f472b6] font-semibold">{clue.chapterPayoff || '-'}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                          Catatan Twist &amp; Relevansi:
                        </span>
                        <p className="text-gray-300 leading-relaxed bg-[#10111a] p-2.5 rounded-lg border border-[#1b1c28]">
                          {clue.revelationNotes}
                        </p>
                      </div>

                      {clue.relatedCharacter && (
                        <div className="mt-2 text-[11px] text-gray-400">
                          Tokoh Terkait: <strong className="text-white">{clue.relatedCharacter}</strong>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#171824] flex items-center justify-end gap-1">
                      <button
                        onClick={() => openClueModal(clue)}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1c28] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus petunjuk "${clue.title}"?`)) deleteClue(clue.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#1a1c28] transition-colors"
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
                className="rounded-2xl border border-[#1b1c28] bg-[#090a0f] p-5 flex flex-col justify-between hover:border-[#2a2d3e] transition-all"
              >
                <div>
                  {scene.imageUrl && (
                    <div
                      onClick={() => setLightboxImage(scene.imageUrl || null)}
                      className="w-full h-52 rounded-xl overflow-hidden bg-[#12131d] border border-[#222434] mb-4 relative cursor-pointer group shadow-lg"
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
                    <span className="text-[10px] font-mono text-[#f472b6] uppercase px-2 py-0.5 rounded border border-[#f472b6]/20 bg-[#f472b6]/10">
                      Tensi: {scene.tensionLevel}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{scene.chapterRef}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{scene.title}</h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="bg-[#10111a] rounded-xl p-2.5 border border-[#1b1d2a]">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-0.5">
                        Mood &amp; Atmosfer:
                      </span>
                      <p className="text-gray-300">{scene.moodAndAtmosphere}</p>
                    </div>

                    <div className="bg-[#10111a] rounded-xl p-2.5 border border-[#1b1d2a]">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-0.5">
                        Pencahayaan &amp; Cuaca:
                      </span>
                      <p className="text-gray-300">{scene.lightingAndWeather}</p>
                    </div>

                    {scene.notes && (
                      <div className="bg-[#10111a] rounded-xl p-2.5 border border-[#1b1d2a]">
                        <span className="text-[10px] uppercase font-semibold text-[#f472b6] block mb-0.5">
                          Catatan Teknis Penulis:
                        </span>
                        <p className="text-gray-300">{scene.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#171824] flex items-center justify-end gap-1">
                  <button
                    onClick={() => openSceneModal(scene)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1c28] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus adegan "${scene.title}"?`)) deleteScene(scene.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#1a1c28] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[#2a2d3e] bg-[#0c0d14] p-6 shadow-2xl text-[#e2e8f0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c28]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#f472b6]" />
                {editingCharacter ? 'Edit Profil Tokoh' : 'Tambah Tokoh Baru'}
              </h3>
              <button onClick={() => setCharacterModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCharacter} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nama Tokoh *</label>
                  <input
                    type="text"
                    required
                    value={charForm.name}
                    onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Gelar / Alias</label>
                  <input
                    type="text"
                    value={charForm.alias}
                    onChange={(e) => setCharForm({ ...charForm, alias: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Peran Arketipe</label>
                  <select
                    value={charForm.role}
                    onChange={(e) => setCharForm({ ...charForm, role: e.target.value as CharacterRole })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">Status Keberadaan</label>
                  <select
                    value={charForm.aliveStatus}
                    onChange={(e) => setCharForm({ ...charForm, aliveStatus: e.target.value as CharacterAliveStatus })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Alive">Hidup (Alive)</option>
                    <option value="Deceased">Tewas (Deceased)</option>
                    <option value="Missing">Hilang (Missing)</option>
                    <option value="Cursed / Undead">Terkutuk / Mayat Hidup</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Faksi / Guild / Wangsa</label>
                  <input
                    type="text"
                    value={charForm.faction}
                    onChange={(e) => setCharForm({ ...charForm, faction: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Motivasi Gelap / Obsesi / Balas Dendam
                  </label>
                  <textarea
                    rows={2}
                    value={charForm.darkMotivation}
                    onChange={(e) => setCharForm({ ...charForm, darkMotivation: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Trauma Masa Lalu &amp; Fatal Flaw (Kelemahan Fatal)
                  </label>
                  <textarea
                    rows={2}
                    value={charForm.traumaAndFatalFlaw}
                    onChange={(e) => setCharForm({ ...charForm, traumaAndFatalFlaw: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">URL Foto Tokoh</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={charForm.imageUrl}
                      onChange={(e) => setCharForm({ ...charForm, imageUrl: e.target.value })}
                      placeholder="/src/assets/images/character_lucian_1793354596738.jpg"
                      className="flex-1 rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <label className="cursor-pointer px-3 py-2 rounded-xl border border-[#2a2d3e] bg-[#1a1c28] text-xs text-gray-200 hover:text-white flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b1c28]">
                <button
                  type="button"
                  onClick={() => setCharacterModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f472b6] text-black font-semibold text-xs hover:bg-[#ec4899]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-[#2a2d3e] bg-[#0c0d14] p-6 shadow-2xl text-[#e2e8f0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c28]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#f472b6]" />
                {editingSetting ? 'Edit Latar / Wilayah' : 'Tambah Latar Baru'}
              </h3>
              <button onClick={() => setSettingModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSetting} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Nama Wilayah / Tempat *</label>
                  <input
                    type="text"
                    required
                    value={settingForm.name}
                    onChange={(e) => setSettingForm({ ...settingForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Tipe Wilayah</label>
                  <input
                    type="text"
                    value={settingForm.realmType}
                    onChange={(e) => setSettingForm({ ...settingForm, realmType: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">Atmosfer, Iklim &amp; Bahaya</label>
                  <textarea
                    rows={2}
                    value={settingForm.atmosphereAndClimate}
                    onChange={(e) => setSettingForm({ ...settingForm, atmosphereAndClimate: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Hukum &amp; Moralitas Dunia Kejam (Taboo)
                  </label>
                  <textarea
                    rows={2}
                    value={settingForm.cruelMoralLaws}
                    onChange={(e) => setSettingForm({ ...settingForm, cruelMoralLaws: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Aturan Sihir / Batasan Teknologi (Cost &amp; Consequence)
                  </label>
                  <textarea
                    rows={2}
                    value={settingForm.magicOrTechRules}
                    onChange={(e) => setSettingForm({ ...settingForm, magicOrTechRules: e.target.value })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2.5 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1">URL Gambar Peta / Sketsa</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settingForm.imageUrl}
                      onChange={(e) => setSettingForm({ ...settingForm, imageUrl: e.target.value })}
                      className="flex-1 rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <label className="cursor-pointer px-3 py-2 rounded-xl border border-[#2a2d3e] bg-[#1a1c28] text-xs text-gray-200 hover:text-white flex items-center gap-1.5">
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b1c28]">
                <button
                  type="button"
                  onClick={() => setSettingModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f472b6] text-black font-semibold text-xs hover:bg-[#ec4899]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[#2a2d3e] bg-[#0c0d14] p-6 shadow-2xl text-[#e2e8f0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c28]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#f472b6]" />
                {editingClue ? 'Edit Petunjuk / Twist' : 'Tambah Petunjuk Misteri'}
              </h3>
              <button onClick={() => setClueModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClue} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Nama Petunjuk / Objek Kunci *</label>
                <input
                  type="text"
                  required
                  value={clueForm.title}
                  onChange={(e) => setClueForm({ ...clueForm, title: e.target.value })}
                  placeholder="Contoh: Belati Perak Bertoreh 7 Simbol"
                  className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Kategori</label>
                  <select
                    value={clueForm.type}
                    onChange={(e) => setClueForm({ ...clueForm, type: e.target.value as ClueType })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="clue">Clue (Petunjuk)</option>
                    <option value="foreshadowing">Foreshadowing</option>
                    <option value="plot-twist">Plot Twist</option>
                    <option value="red-herring">Red Herring (Pengecoh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Status Progres</label>
                  <select
                    value={clueForm.status}
                    onChange={(e) => setClueForm({ ...clueForm, status: e.target.value as ClueStatus })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">Ditanam di Bab</label>
                  <input
                    type="text"
                    value={clueForm.chapterPlanted}
                    onChange={(e) => setClueForm({ ...clueForm, chapterPlanted: e.target.value })}
                    placeholder="Misal: Bab 1 &amp; 2"
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Terungkap di Bab</label>
                  <input
                    type="text"
                    value={clueForm.chapterPayoff}
                    onChange={(e) => setClueForm({ ...clueForm, chapterPayoff: e.target.value })}
                    placeholder="Misal: Bab 8"
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Karakter Terkait</label>
                <input
                  type="text"
                  value={clueForm.relatedCharacter}
                  onChange={(e) => setClueForm({ ...clueForm, relatedCharacter: e.target.value })}
                  placeholder="Misal: Dame Vespera"
                  className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Catatan Rahasia &amp; Fakta Sejati Twist
                </label>
                <textarea
                  rows={3}
                  value={clueForm.revelationNotes}
                  onChange={(e) => setClueForm({ ...clueForm, revelationNotes: e.target.value })}
                  placeholder="Jelaskan apa arti sejati petunjuk ini dan bagaimana hal ini mengecoh pembaca..."
                  className="w-full rounded-xl border border-[#222432] bg-[#12131c] p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b1c28]">
                <button
                  type="button"
                  onClick={() => setClueModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f472b6] text-black font-semibold text-xs hover:bg-[#ec4899]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-[#2a2d3e] bg-[#0c0d14] p-6 shadow-2xl text-[#e2e8f0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b1c28]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#f472b6]" />
                {editingScene ? 'Edit Moodboard Adegan' : 'Tambah Adegan Baru'}
              </h3>
              <button onClick={() => setSceneModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScene} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Judul Adegan *</label>
                <input
                  type="text"
                  required
                  value={sceneForm.title}
                  onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })}
                  placeholder="Misal: Konfrontasi di Jembatan Katedral"
                  className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Bab Terkait</label>
                  <input
                    type="text"
                    value={sceneForm.chapterRef}
                    onChange={(e) => setSceneForm({ ...sceneForm, chapterRef: e.target.value })}
                    placeholder="Misal: Bab 11"
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Tingkat Tensi</label>
                  <select
                    value={sceneForm.tensionLevel}
                    onChange={(e) => setSceneForm({ ...sceneForm, tensionLevel: e.target.value as any })}
                    className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Rendah">Rendah (Pacing santai)</option>
                    <option value="Mencekam">Mencekam (Dread)</option>
                    <option value="Tinggi">Tinggi (Aksi / Intrik)</option>
                    <option value="Puncak Klimaks">Puncak Klimaks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Mood &amp; Suasana</label>
                <input
                  type="text"
                  value={sceneForm.moodAndAtmosphere}
                  onChange={(e) => setSceneForm({ ...sceneForm, moodAndAtmosphere: e.target.value })}
                  className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Pencahayaan &amp; Cuaca</label>
                <input
                  type="text"
                  value={sceneForm.lightingAndWeather}
                  onChange={(e) => setSceneForm({ ...sceneForm, lightingAndWeather: e.target.value })}
                  className="w-full rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">URL Gambar Referensi Adegan</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sceneForm.imageUrl}
                    onChange={(e) => setSceneForm({ ...sceneForm, imageUrl: e.target.value })}
                    className="flex-1 rounded-xl border border-[#222432] bg-[#12131c] px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-xl border border-[#2a2d3e] bg-[#1a1c28] text-xs text-gray-200 hover:text-white flex items-center gap-1.5">
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b1c28]">
                <button
                  type="button"
                  onClick={() => setSceneModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f472b6] text-black font-semibold text-xs hover:bg-[#ec4899]"
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
