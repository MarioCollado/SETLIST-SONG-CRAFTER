import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSongWithSections } from '@/lib/db'
import SongEditorClient from '@/components/songs/SongEditorClient'

interface SongDetailPageProps {
  params: {
    id: string
  }
}

export default async function SongDetailPage({ params }: SongDetailPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const song = await getSongWithSections(params.id)

  if (!song || song.user_id !== user.id) {
    notFound()
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] pb-12">
      <SongEditorClient initialSong={song} userId={user.id} />
    </div>
  )
}
