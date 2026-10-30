import { Project, VolumeArc, Chapter, CharacterProfile, WorldSetting, ClueItem, MacroPlotBeat, VisualScene, TypesettingConfig, VersionSnapshot } from '../types/novel';

export const DEFAULT_TYPESETTING: TypesettingConfig = {
  fontFamily: 'EB Garamond',
  fontSize: 18,
  lineHeight: 1.8,
  paragraphIndent: true,
  textAlignment: 'justify',
  dropCap: true,
  columnWidth: 'standard',
  pageFormat: 'a5',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-obsidian-throne',
    title: 'The Obsidian Throne',
    subtitle: 'Requiem for Mournhold',
    synopsis: 'Di dunia di mana darah para bangsawan adalah bahan bakar bagi mantra pelindung dari kabut kutukan, seorang mantan inkuisitor suci yang telah kehilangan keyakinannya harus mengungkap pembantaian rahasia di Katedral Bayangan sebelum kabut melahap kota terakhir manusia.',
    category: 'series',
    seriesTitle: 'The Obsidian Chronicles',
    seriesOrder: 1,
    genre: 'Grimdark',
    status: 'On Progress',
    coverUrl: '/src/assets/images/sample_book_cover_1793354596229.jpg',
    targetDailyWords: 1200,
    todayWordsWritten: 840,
    lastSessionDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-10-24T08:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj-neon-shroud',
    title: 'Neon Sin: Terminal Protocol',
    subtitle: 'A Grim Sci-Fi Thriller',
    synopsis: 'Tahun 2189, kota terapung Neo-Jakarta tenggelam dalam hujan asam neurotoksin. Seorang mantan detektif sibernetik menemukan bahwa ingatan para korban pembunuhan berantai dihapus langsung dari jaringan saraf pusat oleh sebuah entitas tanpa raga.',
    category: 'standalone',
    genre: 'Sci-Fi Thriller',
    status: 'Idea',
    targetDailyWords: 1000,
    todayWordsWritten: 0,
    lastSessionDate: new Date().toISOString().split('T')[0],
    createdAt: '2026-10-28T14:30:00Z',
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_ARCS: VolumeArc[] = [
  {
    id: 'arc-1',
    projectId: 'proj-obsidian-throne',
    title: 'Arc I: Selubung Abu (The Ashen Veil)',
    order: 1,
    description: 'Awal penyelidikan di ibu kota Mournhold dan penemuan rahasia kotor ordo suci.',
  },
  {
    id: 'arc-2',
    projectId: 'proj-obsidian-throne',
    title: 'Arc II: Lembah Tulang (Vale of Sorrow)',
    order: 2,
    description: 'Perjalanan menuju benteng terlarang melintasi rawa terkutuk dan gurun abu.',
  }
];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-1',
    projectId: 'proj-obsidian-throne',
    arcId: 'arc-1',
    chapterNumber: 1,
    title: 'Darah di Ambang Katedral',
    status: 'Completed',
    wordCount: 840,
    characterCount: 5410,
    summary: 'Lucian Vane mendatangi gerbang Katedral Bayangan di tengah hujan asam dingin dan mendapati penjaga kuil terbunuh tanpa jejak luka pedang.',
    content: `Hujan di Mournhold tidak pernah membawa berkah; tetesannya berbau belerang dan abu dingin yang menggerus batu nisan para martir. Lucian Vane menarik mantel berkerah tingginya lebih rapat, membiarkan bayang-bayang gargoyle katedral menyembunyikan siluet tubuhnya yang letih.

Tujuh tahun sejak sumpah inkuisisinya dibatalkan secara paksa, gerbang obsidian Katedral Bayangan masih memancarkan bau dupa kematian yang sama. Namun malam ini, udara dipenuhi amis yang jauh lebih pekat: darah segar yang belum membeku.

Di depan anak tangga pualam hitam, dua penjaga bertameng perak tergeletak tanpa suara. Tidak ada bekas tebasan belati, tidak ada pelindung dada yang koyak. Mata mereka melotot ke arah langit kelam tanpa pupil, digantikan kabut kelabu berpendar layaknya bara yang nyaris padam.

"Kutukan Pemakan Jiwa," bisik Lucian, berlutut di samping mayat pertama. Jemari bersarung kulitnya menyentuh leher yang dingin itu. "Hanya ordo lingkaran dalam yang menguasai tata cara pemotongan nyawa sebersih ini."

Lonceng menara berdentang sekali—sebuah nada sumbang yang menggetarkan tulang iga. Dari balik pilar berpahat tanaman duri mawar hitam, sebuah desisan halus terdengar. Seseorang sedang mengawasinya, mengamati apakah sang serigala buangan masih mengingat cara menggigit.

Lucian tidak menghunus pedangnya. Di kota ini, siapa pun yang mencabut senjata terlebih dahulu biasanya menjadi orang pertama yang dituntut harga darahnya. Sebaliknya, ia mengeluarkan kantong beludru kecil berisi bubuk perak dan menyebarkannya di atas lantai batu basah. Garis-garis bercahaya merah muda pucat menyala seketika, menyingkap jejak kaki telanjang yang berjalan mundur menuju kedalaman altar terlarang.

"Bahkan kematian pun menolak untuk berjalan maju di tempat terkutuk ini," gumamnya, melangkah melintasi ambang batas gelap.`,
    publishingStatus: [
      { platform: 'Wattpad', status: 'published', publishedUrl: 'https://wattpad.com/story/obsidian-throne-sample' },
      { platform: 'Royal Road', status: 'scheduled', scheduledDate: '2026-11-05' }
    ],
    createdAt: '2026-10-25T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chap-2',
    projectId: 'proj-obsidian-throne',
    arcId: 'arc-1',
    chapterNumber: 2,
    title: 'Bisikan Belati Perak',
    status: 'On Progress',
    wordCount: 412,
    characterCount: 2650,
    summary: 'Pertemuan rahasia dengan Dame Vespera di pemakaman bawah tanah kota tua.',
    content: `Lorong bawah tanah Katedral Bayangan terasa sepuluh derajat lebih dingin dari udara luar. Air menetes dari langit-langit berkubah lengkung, mengikis ukiran wajah para uskup agung masa lalu yang matanya telah dipahat buta.

"Kau terlambat, Vane," suara dingin seorang wanita membelah keheningan.

Dame Vespera berdiri di balik makam marmer bertulisan nama keluarga bangsawan yang telah punah seratus tahun lalu. Cahaya lentera di tangannya memantulkan jubah hitam berbordir benang sutra mawar. Di sarung pinggangnya bertengger belati perak dengan tujuh torehan aneh di bilahnya.

"Mournhold sedang dipenuhi para pemburu kepala yang ingin membawa telingaku ke Dewan Ordo," jawab Lucian datar. "Dua pengawal di gerbang depan mati dengan mata berkabut abu. Apakah kau yang melakukannya?"

Vespera mendengus pelan, mengangkat bilah belatinya sedikit. "Jika aku yang membunuh mereka, Vane, kepalamu pun tak akan sempat mengucapkan pertanyaan bodoh itu."`,
    publishingStatus: [
      { platform: 'Wattpad', status: 'draft' }
    ],
    createdAt: '2026-10-26T12:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'chap-3',
    projectId: 'proj-obsidian-throne',
    arcId: 'arc-1',
    chapterNumber: 3,
    title: 'Sumpah di Bawah Gerhana Merah',
    status: 'Idea',
    wordCount: 0,
    characterCount: 0,
    summary: 'Outline: Gerhana bulan merah terjadi di langit Mournhold; Lucian dipaksa membuat pakta terlarang untuk menyelamatkan nyawa anak haram Raja.',
    content: '',
    publishingStatus: [],
    createdAt: '2026-10-27T09:00:00Z',
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char-lucian',
    projectId: 'proj-obsidian-throne',
    name: 'Lucian Vane',
    alias: 'Sang Inkuisitor Gagak (The Crow Inquisitor)',
    role: 'Anti-Hero',
    darkMotivation: 'Membalas dendam kepada Dewan Patriarki yang telah membakar keluarganya sebagai kurban ritual penyucian kabut.',
    traumaAndFatalFlaw: 'Halusinasi kronis akibat penarikan darah kutukan; paranoid ekstrem dan ketidakmampuan mempercayai siapa pun tanpa jaminan nyawa.',
    faction: 'Mantan Inkuisitor / Ordo Gagak Terkutuk',
    aliveStatus: 'Alive',
    relationships: [
      { id: 'rel-1', targetCharacterId: 'char-vespera', targetName: 'Dame Vespera', relationType: 'Sekutu Rapuh & Saling Sandera Rahasia' },
      { id: 'rel-2', targetCharacterId: 'char-malakor', targetName: 'Grand Patriarch Malakor', relationType: 'Musuh Bebuyutan / Target Balas Dendam' }
    ],
    secretNotes: 'Menyimpan pecahan cermin obsidian di dalam luka dadanya yang terus berdarah saat ada pengguna sihir gelap di dekatnya.',
    imageUrl: '/src/assets/images/character_lucian_1793354596738.jpg',
  },
  {
    id: 'char-vespera',
    projectId: 'proj-obsidian-throne',
    name: 'Dame Vespera Morne',
    alias: 'Mawar Beracun Mournhold',
    role: 'Morally Gray',
    darkMotivation: 'Mengamankan hak waris tahta klan Morne yang direbut secara curang oleh Dewan Kardinal.',
    traumaAndFatalFlaw: 'Tuli terhadap empati; rela mengorbankan seratus nyawa budak demi satu ons cairan pelindung kutukan.',
    faction: 'Bangsawan Wangsa Morne & Serikat Alkimia Bawah Tanah',
    aliveStatus: 'Alive',
    relationships: [
      { id: 'rel-3', targetCharacterId: 'char-lucian', targetName: 'Lucian Vane', relationType: 'Mantan Rekan Tugas & Kreditor Nyawa' }
    ],
    secretNotes: 'Sebenarnya telah terjangkit kutukan abu stadium satu di lengan kanannya yang selalu tertutup sarung sutra.',
  },
  {
    id: 'char-malakor',
    projectId: 'proj-obsidian-throne',
    name: 'Grand Patriarch Malakor',
    alias: 'Suara Takdir Suci',
    role: 'Antagonist',
    darkMotivation: 'Mencapai keabadian dengan memanggil entitas kuno dari palung kabut terdalam.',
    traumaAndFatalFlaw: 'Ketakutan histeris akan kematian dan penuaan fisik.',
    faction: 'Dewan Patriarki Suci Katedral Bayangan',
    aliveStatus: 'Alive',
    relationships: [
      { id: 'rel-4', targetCharacterId: 'char-lucian', targetName: 'Lucian Vane', relationType: 'Mantan Bawahan & Buronan Nomor Satu' }
    ],
    secretNotes: 'Menggunakan darah anak-anak panti asuhan katedral sebagai bahan eliksir awet muda hariannya.',
  }
];

export const INITIAL_SETTINGS: WorldSetting[] = [
  {
    id: 'set-mournhold',
    projectId: 'proj-obsidian-throne',
    name: 'Osthara & Benteng Mournhold',
    realmType: 'Ibu Kota Gotik & Wilayah Terkutuk',
    atmosphereAndClimate: 'Dingin menusuk tulang, kabut belerang pekat, langit abu-abu abadi tanpa matahari, hujan asam sesekali.',
    cruelMoralLaws: 'Hukum Pertukaran Darah: Siapa pun yang menolak membayar upeti darah bulanan kepada Katedral dianggap murtad dan dilempar ke luar dinding kota untuk dihabisi monster kabut.',
    magicOrTechRules: 'Sihir Obsidian: Tidak ada mana gratis; setiap mantra membutuhkan darah segar atau kenangan paling bahagia yang dihanguskan menjadi abu jiwa.',
    rulingFactions: 'Dewan Kardinal Katedral Bayangan & Tiga Wangsa Aristokrat Berdarah Murni.',
    imageUrl: '/src/assets/images/world_map_obsidian_1793354598729.jpg',
    notes: 'Peta menunjukkan rute rahasia Lembah Air Mata dan Rawa Mayat yang belum pernah dipetakan oleh tentara kerajaan.',
  },
  {
    id: 'set-iron-keep',
    projectId: 'proj-obsidian-throne',
    name: 'The Iron Keep & Runtuhan Arcanum',
    realmType: 'Benteng Monolitik & Reruntuhan Sihir Hitam',
    atmosphereAndClimate: 'Gersang berbatu tajam dengan gemuruh petir hitam tak bersuara.',
    cruelMoralLaws: 'Hukum Besi: Kekuatan fisik mutlak; tahanan yang tidak mampu bekerja dalam 24 jam dijadikan tumbal pelindung parit.',
    magicOrTechRules: 'Teknologi Dapur Uap Jiwa: Mesin perang dijalankan dengan membakar tengkorak para penyihir mati.',
    rulingFactions: 'Legiun Penjaga Besi.',
  }
];

export const INITIAL_CLUES: ClueItem[] = [
  {
    id: 'clue-1',
    projectId: 'proj-obsidian-throne',
    title: 'Belati Perak dengan 7 Torehan Simbolis',
    type: 'clue',
    status: 'Planted',
    chapterPlanted: 'Bab 1 & 2',
    chapterPayoff: 'Bab 8 (Rencana)',
    revelationNotes: 'Tujuh torehan mewakili tujuh kardinal yang bersumpah darah untuk menumbalkan raja terdahulu.',
    relatedCharacter: 'Dame Vespera Morne',
  },
  {
    id: 'clue-2',
    projectId: 'proj-obsidian-throne',
    title: 'Mata Kelabu Berkabut pada Mayat Pengawal',
    type: 'foreshadowing',
    status: 'Planted',
    chapterPlanted: 'Bab 1',
    chapterPayoff: 'Bab 5',
    revelationNotes: 'Menandakan bahwa entitas kabut bukan menyerang dari luar dinding, melainkan dipanggil dari ruang bawah tanah Katedral.',
    relatedCharacter: 'Grand Patriarch Malakor',
  },
  {
    id: 'clue-3',
    projectId: 'proj-obsidian-throne',
    title: 'Surat Pembelian Racun Lili Hitam oleh Klan Morne',
    type: 'red-herring',
    status: 'Dropping Hints',
    chapterPlanted: 'Bab 2',
    chapterPayoff: 'Bab 6',
    revelationNotes: 'Vespera dibuat terlihat seperti dalang pembunuhan, padahal surat tersebut dipalsukan oleh bendahara ordo.',
    relatedCharacter: 'Dame Vespera Morne',
  },
  {
    id: 'clue-4',
    projectId: 'proj-obsidian-throne',
    title: 'Identitas Sejati Anak Haram Sang Raja',
    type: 'plot-twist',
    status: 'Unresolved',
    chapterPlanted: 'Bab 3',
    chapterPayoff: 'Bab 12 (Klimaks)',
    revelationNotes: 'Anak haram tersebut ternyata adalah Lucian Vane sendiri, yang ingatannya dihapus saat dimasukkan ke akademi inkuisitor.',
    relatedCharacter: 'Lucian Vane',
  }
];

export const INITIAL_MACRO_BEATS: MacroPlotBeat[] = [
  {
    id: 'beat-1',
    projectId: 'proj-obsidian-throne',
    stage: 'Premis Gelap',
    description: 'Di dunia yang diambang kehancuran kabut kutukan, keselamatan kota bergantung pada tumbal darah harian.',
    targetChapter: 'Bab 1',
  },
  {
    id: 'beat-2',
    projectId: 'proj-obsidian-throne',
    stage: 'Inciting Incident',
    description: 'Pembantaian rahasia di Katedral Bayangan menyingkap bahwa mantra pelindung sengaja dirusak dari dalam.',
    targetChapter: 'Bab 1 - 2',
  },
  {
    id: 'beat-3',
    projectId: 'proj-obsidian-throne',
    stage: 'Rising Dread',
    description: 'Ordo meluncurkan perburuan penyihir buangan untuk menutupi jejak; kota mulai dilanda histeria massal.',
    targetChapter: 'Bab 3 - 6',
  },
  {
    id: 'beat-4',
    projectId: 'proj-obsidian-throne',
    stage: 'Midpoint Twist',
    description: 'Aliansi terlarang terungkap: Dewan Patriarki bekerja sama dengan monster kabut untuk memusnahkan rakyat jelata.',
    targetChapter: 'Bab 7',
  },
  {
    id: 'beat-5',
    projectId: 'proj-obsidian-throne',
    stage: 'Darkest Hour',
    description: 'Lucian ditangkap dan dipaksa memilih: meminum racun kutukan atau melihat kota dibumihanguskan seketika.',
    targetChapter: 'Bab 10',
  },
  {
    id: 'beat-6',
    projectId: 'proj-obsidian-throne',
    stage: 'Climax',
    description: 'Pertempuran berdarah di atas jembatan monolitik katedral saat gerhana merah mencapai puncaknya.',
    targetChapter: 'Bab 11 - 12',
  },
  {
    id: 'beat-7',
    projectId: 'proj-obsidian-throne',
    stage: 'Grim Resolution',
    description: 'Katedral hancur, namun kebenaran pahit terpatri: kegelapan baru telah bangkit untuk menggantikan yang lama.',
    targetChapter: 'Epilog',
  }
];

export const INITIAL_SCENES: VisualScene[] = [
  {
    id: 'scene-1',
    projectId: 'proj-obsidian-throne',
    title: 'Konfrontasi di Jembatan Reruntuhan Katedral',
    chapterRef: 'Bab 11 - Klimaks',
    moodAndAtmosphere: 'Hujan badai es, kabut kelam bertabur percikan energi arcane ungu/pink, ketegangan fisik brutal.',
    lightingAndWeather: 'Cahaya bulan sabit pucat di balik awan badai berputar, petir senyap berkelebat.',
    tensionLevel: 'Puncak Klimaks',
    imageUrl: '/src/assets/images/scene_cathedral_ruins_1793354597832.jpg',
    notes: 'Pertarungan satu lawan satu antara Lucian dan pembunuh bayaran tanpa wajah di atas jurang berkabut tanpa dasar.',
  }
];

export const INITIAL_SNAPSHOTS: VersionSnapshot[] = [
  {
    id: 'snap-1',
    chapterId: 'chap-1',
    timestamp: '2026-10-25T11:30:00Z',
    wordCount: 520,
    note: 'Draf Pertama: Deskripsi awal kedatangan di Katedral',
    content: `Hujan di Mournhold berbau belerang dan abu dingin. Lucian Vane menarik mantelnya lebih rapat saat berdiri di depan gerbang obsidian Katedral Bayangan.

Tujuh tahun sejak sumpah inkuisisinya dibatalkan, gerbang ini masih memancarkan bau dupa kematian yang sama. Di depan anak tangga, dua penjaga tergeletak kaku tanpa luka terbuka.

"Kutukan Pemakan Jiwa," bisik Lucian, memeriksa leher yang dingin itu. Lonceng berdentang di kejauhan.`,
  },
  {
    id: 'snap-2',
    chapterId: 'chap-1',
    timestamp: '2026-10-25T14:15:00Z',
    wordCount: 840,
    note: 'Revisi Adegan: Penambahan jejak bubuk perak dan detail kutukan mata kelabu',
    content: `Hujan di Mournhold tidak pernah membawa berkah; tetesannya berbau belerang dan abu dingin yang menggerus batu nisan para martir. Lucian Vane menarik mantel berkerah tingginya lebih rapat, membiarkan bayang-bayang gargoyle katedral menyembunyikan siluet tubuhnya yang letih.

Tujuh tahun sejak sumpah inkuisisinya dibatalkan secara paksa, gerbang obsidian Katedral Bayangan masih memancarkan bau dupa kematian yang sama. Namun malam ini, udara dipenuhi amis yang jauh lebih pekat: darah segar yang belum membeku.

Di depan anak tangga pualam hitam, dua penjaga bertameng perak tergeletak tanpa suara. Tidak ada bekas tebasan belati, tidak ada pelindung dada yang koyak. Mata mereka melotot ke arah langit kelam tanpa pupil, digantikan kabut kelabu berpendar layaknya bara yang nyaris padam.

"Kutukan Pemakan Jiwa," bisik Lucian, berlutut di samping mayat pertama. Jemari bersarung kulitnya menyentuh leher yang dingin itu. "Hanya ordo lingkaran dalam yang menguasai tata cara pemotongan nyawa sebersih ini."

Lonceng menara berdentang sekali—sebuah nada sumbang yang menggetarkan tulang iga. Dari balik pilar berpahat tanaman duri mawar hitam, sebuah desisan halus terdengar. Seseorang sedang mengawasinya, mengamati apakah sang serigala buangan masih mengingat cara menggigit.

Lucian tidak menghunus pedangnya. Di kota ini, siapa pun yang mencabut senjata terlebih dahulu biasanya menjadi orang pertama yang dituntut harga darahnya. Sebaliknya, ia mengeluarkan kantong beludru kecil berisi bubuk perak dan menyebarkannya di atas lantai batu basah. Garis-garis bercahaya merah muda pucat menyala seketika, menyingkap jejak kaki telanjang yang berjalan mundur menuju kedalaman altar terlarang.

"Bahkan kematian pun menolak untuk berjalan maju di tempat terkutuk ini," gumamnya, melangkah melintasi ambang batas gelap.`,
  }
];
