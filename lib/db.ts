import { createClient } from '@/lib/supabase-server'
import type {
  Song,
  Section,
  Event,
  Setlist,
  SetlistSong,
  SongWithSections,
  SectionWithEvents,
  SetlistWithSongs,
  CreateSongInput,
  UpdateSongInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateEventInput,
  UpdateEventInput,
  CreateSetlistInput,
  UpdateSetlistInput,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// SONGS
// ─────────────────────────────────────────────────────────────────────────────

export async function getSongs(userId: string): Promise<Song[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Song[]
}

export async function getSongWithSections(songId: string): Promise<SongWithSections | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      sections (
        *,
        events ( * )
      )
    `)
    .eq('id', songId)
    .order('order_index', { referencedTable: 'sections', ascending: true })
    .order('order_index', { referencedTable: 'sections.events', ascending: true })
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(error.message)
  }

  // Ensure events inside each section are sorted
  const song = data as SongWithSections
  song.sections = (song.sections ?? []).map((s: SectionWithEvents) => ({
    ...s,
    events: (s.events ?? []).sort((a: Event, b: Event) => a.order_index - b.order_index),
  }))
  return song
}

export async function createSong(
  userId: string,
  data: CreateSongInput,
): Promise<Song> {
  const supabase = createClient()
  const { data: song, error } = await supabase
    .from('songs')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return song as Song
}

export async function updateSong(
  id: string,
  data: UpdateSongInput,
): Promise<Song> {
  const supabase = createClient()
  const { data: song, error } = await supabase
    .from('songs')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return song as Song
}

export async function deleteSong(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('songs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function createSection(
  userId: string,
  data: CreateSectionInput,
): Promise<Section> {
  const supabase = createClient()
  const { data: section, error } = await supabase
    .from('sections')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return section as Section
}

export async function updateSection(
  id: string,
  data: UpdateSectionInput,
): Promise<Section> {
  const supabase = createClient()
  const { data: section, error } = await supabase
    .from('sections')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return section as Section
}

export async function deleteSection(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('sections').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/**
 * Reorders sections for a song by updating order_index for each id.
 * orderedIds: array of section UUIDs in the desired order (index = order_index).
 */
export async function reorderSections(
  songId: string,
  orderedIds: string[],
): Promise<void> {
  const supabase = createClient()
  const updates = orderedIds.map((id, index) => ({
    id,
    song_id: songId,
    order_index: index,
  }))

  const { error } = await supabase
    .from('sections')
    .upsert(updates, { onConflict: 'id' })

  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export async function createEvent(
  userId: string,
  data: CreateEventInput,
): Promise<Event> {
  const supabase = createClient()
  const { data: event, error } = await supabase
    .from('events')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return event as Event
}

export async function updateEvent(
  id: string,
  data: UpdateEventInput,
): Promise<Event> {
  const supabase = createClient()
  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return event as Event
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────────────────────────────────────
// SETLISTS
// ─────────────────────────────────────────────────────────────────────────────

export async function getSetlists(userId: string): Promise<Setlist[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('setlists')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false, nullsFirst: false })

  if (error) throw new Error(error.message)
  return data as Setlist[]
}

export async function getSetlistWithSongs(
  setlistId: string,
): Promise<SetlistWithSongs | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('setlists')
    .select(`
      *,
      setlist_songs (
        *,
        song:songs (
          *,
          sections (
            *,
            events ( * )
          )
        )
      )
    `)
    .eq('id', setlistId)
    .order('order_index', { referencedTable: 'setlist_songs', ascending: true })
    .order('order_index', {
      referencedTable: 'setlist_songs.song.sections',
      ascending: true,
    })
    .order('order_index', {
      referencedTable: 'setlist_songs.song.sections.events',
      ascending: true,
    })
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as unknown as SetlistWithSongs
}

export async function createSetlist(
  userId: string,
  data: CreateSetlistInput,
): Promise<Setlist> {
  const supabase = createClient()
  const { data: setlist, error } = await supabase
    .from('setlists')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return setlist as Setlist
}

export async function updateSetlist(
  id: string,
  data: UpdateSetlistInput,
): Promise<Setlist> {
  const supabase = createClient()
  const { data: setlist, error } = await supabase
    .from('setlists')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return setlist as Setlist
}

export async function deleteSetlist(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('setlists').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────────────────────────────────────
// SETLIST SONGS
// ─────────────────────────────────────────────────────────────────────────────

export async function addSongToSetlist(
  userId: string,
  setlistId: string,
  songId: string,
  orderIndex: number,
): Promise<SetlistSong> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('setlist_songs')
    .insert({
      setlist_id: setlistId,
      song_id: songId,
      user_id: userId,
      order_index: orderIndex,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as SetlistSong
}

export async function removeSongFromSetlist(
  setlistId: string,
  songId: string,
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('setlist_songs')
    .delete()
    .eq('setlist_id', setlistId)
    .eq('song_id', songId)

  if (error) throw new Error(error.message)
}

/**
 * Reorders songs within a setlist by updating order_index for each id.
 * orderedIds: array of setlist_songs UUIDs in the desired order.
 */
export async function reorderSetlistSongs(
  setlistId: string,
  orderedIds: string[],
): Promise<void> {
  const supabase = createClient()
  const updates = orderedIds.map((id, index) => ({
    id,
    setlist_id: setlistId,
    order_index: index,
  }))

  const { error } = await supabase
    .from('setlist_songs')
    .upsert(updates, { onConflict: 'id' })

  if (error) throw new Error(error.message)
}
