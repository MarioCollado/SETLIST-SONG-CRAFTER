import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { getSetlistWithSongs } from '@/lib/db'
import PerformanceView from '@/components/perform/PerformanceView'

interface PerformPageProps {
  params: {
    id: string
  }
}

export default async function PerformPage({ params }: PerformPageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const setlist = await getSetlistWithSongs(params.id)

  if (!setlist || setlist.user_id !== user.id) {
    notFound()
  }

  return <PerformanceView setlist={setlist} />
}