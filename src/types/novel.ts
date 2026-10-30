export type ProjectCategory = 'standalone' | 'series';
export type ProjectStatus = 'Idea' | 'On Progress' | 'Editing' | 'Completed';
export type DarkGenre = 'Dark Fantasy' | 'Sci-Fi Thriller' | 'Dark Mystery' | 'Grimdark' | 'Cosmic Horror';

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  synopsis: string;
  category: ProjectCategory;
  seriesTitle?: string;
  seriesOrder?: number;
  genre: DarkGenre;
  status: ProjectStatus;
  coverUrl?: string;
  targetDailyWords: number;
  todayWordsWritten: number;
  lastSessionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolumeArc {
  id: string;
  projectId: string;
  title: string;
  order: number;
  description?: string;
}

export interface ChapterPublishInfo {
  platform: 'Wattpad' | 'Webnovel' | 'Royal Road' | 'Karyakarsa' | 'AO3' | 'Custom';
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: string;
  publishedUrl?: string;
}

export interface Chapter {
  id: string;
  projectId: string;
  arcId: string;
  chapterNumber: number;
  title: string;
  content: string;
  status: ProjectStatus;
  summary?: string;
  wordCount: number;
  characterCount: number;
  publishingStatus: ChapterPublishInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface VersionSnapshot {
  id: string;
  chapterId: string;
  timestamp: string;
  wordCount: number;
  note: string;
  content: string;
}

export type CharacterRole = 'Protagonist' | 'Antagonist' | 'Anti-Hero' | 'Deuteragonist' | 'Morally Gray' | 'Secondary';
export type CharacterAliveStatus = 'Alive' | 'Deceased' | 'Missing' | 'Cursed / Undead';

export interface CharacterRelation {
  id: string;
  targetCharacterId: string;
  targetName: string;
  relationType: string; // e.g. "Darah / Saudara", "Musuh Bebuyutan", "Hutang Jiwa", "Pion Rahasia"
}

export interface CharacterProfile {
  id: string;
  projectId: string;
  name: string;
  alias?: string;
  role: CharacterRole;
  darkMotivation: string;
  traumaAndFatalFlaw: string;
  faction: string;
  aliveStatus: CharacterAliveStatus;
  relationships: CharacterRelation[];
  secretNotes: string;
  imageUrl?: string;
}

export interface WorldSetting {
  id: string;
  projectId: string;
  name: string;
  realmType: string;
  atmosphereAndClimate: string;
  cruelMoralLaws: string;
  magicOrTechRules: string;
  rulingFactions: string;
  imageUrl?: string;
  notes?: string;
}

export type ClueType = 'clue' | 'foreshadowing' | 'plot-twist' | 'red-herring';
export type ClueStatus = 'Planted' | 'Dropping Hints' | 'Revealed' | 'Unresolved';

export interface ClueItem {
  id: string;
  projectId: string;
  title: string;
  type: ClueType;
  status: ClueStatus;
  chapterPlanted?: string;
  chapterPayoff?: string;
  revelationNotes: string;
  relatedCharacter?: string;
}

export interface MacroPlotBeat {
  id: string;
  projectId: string;
  stage: 'Premis Gelap' | 'Inciting Incident' | 'Rising Dread' | 'Midpoint Twist' | 'Darkest Hour' | 'Climax' | 'Grim Resolution';
  description: string;
  targetChapter?: string;
}

export interface VisualScene {
  id: string;
  projectId: string;
  title: string;
  chapterRef?: string;
  moodAndAtmosphere: string;
  lightingAndWeather: string;
  tensionLevel: 'Rendah' | 'Mencekam' | 'Tinggi' | 'Puncak Klimaks';
  imageUrl?: string;
  notes: string;
}

export interface TypesettingConfig {
  fontFamily: 'EB Garamond' | 'Baskervville' | 'Merriweather' | 'Times New Roman' | 'Cinzel';
  fontSize: number; // 14 - 24
  lineHeight: number; // 1.4 - 2.2
  paragraphIndent: boolean;
  textAlignment: 'justify' | 'left';
  dropCap: boolean;
  columnWidth: 'narrow' | 'standard' | 'wide';
  pageFormat: 'a5' | 'pocket' | 'trade';
}
