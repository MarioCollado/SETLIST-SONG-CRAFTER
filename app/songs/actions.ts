'use server'

import { createClient } from '@/lib/supabase-server'
import { createSong } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNewSong() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const song = await createSong(user.id, {
    title: 'New Song',
    key: null,
    time_signature: '4/4',
    bpm_default: null,
    genre: null,
    notes: null,
  })

  revalidatePath('/songs')
  redirect(`/songs/${song.id}`)
}