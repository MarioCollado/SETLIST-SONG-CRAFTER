export const dynamic = 'force-dynamic'
export const revalidate = 0

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSetlistWithSongs, getSongs } from '@/lib/db'
import SetlistEditorClient from '@/components/setlists/SetlistEditorClient'

interface SetlistDetailPageProps {
  params: {
    id: string
  }
}

export default async function SetlistDetailPage({ params }: SetlistDetailPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [setlist, songs] = await Promise.all([
    getSetlistWithSongs(params.id),
    getSongs(user.id),
  ])

  if (!setlist || setlist.user_id !== user.id) {
    notFound()
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <SetlistEditorClient
        initialSetlist={setlist}
        availableSongs={songs}
        userId={user.id}
      />
    </div>
  )
}