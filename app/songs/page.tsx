export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase-server'
import { getSongs } from '@/lib/db'
import { redirect } from 'next/navigation'
import { createNewSong } from './actions'
import SongsListClient from '@/components/songs/SongsListClient'

export default async function SongsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const songs = await getSongs(user.id)

  return <SongsListClient initialSongs={songs} onNewAction={createNewSong} />
}