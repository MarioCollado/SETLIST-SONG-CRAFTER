// ─────────────────────────────────────────────────────────────────────────────
// ENUMS / UNION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SectionType =
  | 'intro'
  | 'verse'
  | 'pre'
  | 'chorus'
  | 'post'
  | 'bridge'
  | 'solo'
  | 'break'
  | 'build'
  | 'outro'
  | 'custom'

export type EventType =
  | 'cut'
  | 'stop'
  | 'hit'
  | 'tacet'
  | 'fade'
  | 'repeat'
  | 'coda'

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface Song {
  id: string
  user_id: string
  title: string
  key: string | null
  time_signature: string
  bpm_default: number | null
  genre: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  song_id: string
  user_id: string
  type: SectionType
  label: string | null
  order_index: number
  bpm_override: number | null
  bar_start: number
  bar_end: number
  rhythm_notes: string | null
  notes: string | null
  created_at: string
}

export interface Event {
  id: string
  section_id: string
  user_id: string
  type: EventType
  icon: string | null
  order_index: number
  bar_number: number | null
  beat_number: number | null
  duration_bars: number | null
  notes: string | null
  created_at: string
}

export interface Setlist {
  id: string
  user_id: string
  title: string
  date: string | null
  venue: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SetlistSong {
  id: string
  setlist_id: string
  song_id: string
  user_id: string
  order_index: number
  override_notes: string | null
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSED / JOINED TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Section with its events pre-fetched */
export interface SectionWithEvents extends Section {
  events: Event[]
}

/** Song with all sections and events pre-fetched */
export interface SongWithSections extends Song {
  sections: SectionWithEvents[]
}

/** Setlist song row with the full song data (sections + events) attached */
export interface SetlistSongWithSong extends SetlistSong {
  song: SongWithSections
}

/** Setlist with all its songs (ordered) */
export interface SetlistWithSongs extends Setlist {
  setlist_songs: SetlistSongWithSong[]
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM / INPUT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CreateSongInput = Omit<Song, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateSongInput = Partial<CreateSongInput>

export type CreateSectionInput = Omit<Section, 'id' | 'user_id' | 'created_at'>
export type UpdateSectionInput = Partial<Omit<CreateSectionInput, 'song_id'>>

export type CreateEventInput = Omit<Event, 'id' | 'user_id' | 'created_at'>
export type UpdateEventInput = Partial<Omit<CreateEventInput, 'section_id'>>

export type CreateSetlistInput = Omit<Setlist, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateSetlistInput = Partial<CreateSetlistInput>

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COLORS
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_COLORS: Record<SectionType, string> = {
  intro:   '#5A6470',
  verse:   '#2A7A5A',
  pre:     '#2A5A9A',
  chorus:  '#9A3030',
  post:    '#6A2020',
  bridge:  '#6A2A8A',
  solo:    '#8A6A1A',
  break:   '#8A4A1A',
  build:   '#7A5A1A',
  outro:   '#4A5058',
  custom:  '#4A5058',
}

/** Returns a hex with reduced opacity for backgrounds (20% alpha) */
export function sectionColorBg(type: SectionType): string {
  return SECTION_COLORS[type] + '33' // 33 hex = ~20% opacity
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT COLORS (used by EventBadge icon rendering)
// ─────────────────────────────────────────────────────────────────────────────

export const EVENT_COLORS: Record<EventType, string> = {
  cut:    '#E05555',
  stop:   '#E08844',
  hit:    '#D4AA40',
  tacet:  '#7A8088',
  fade:   '#7A8088',
  repeat: '#4A8ACA',
  coda:   '#7A8088',
}

// ─────────────────────────────────────────────────────────────────────────────
// ZOOM LEVELS (Performance mode)
// ─────────────────────────────────────────────────────────────────────────────

export type ZoomLevel = 'FULL' | 'MEDIUM' | 'MINIMAL'

export const ZOOM_LEVELS: ZoomLevel[] = ['FULL', 'MEDIUM', 'MINIMAL']
