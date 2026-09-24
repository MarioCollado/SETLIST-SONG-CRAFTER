export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase-server'
import { getSetlists } from '@/lib/db'
import { redirect } from 'next/navigation'
import { createNewSetlist } from './actions'
import SetlistsListClient from '@/components/setlists/SetlistsListClient'

export default async function SetlistsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const setlists = await getSetlists(user.id)

  return (
    <SetlistsListClient
      initialSetlists={setlists}
      onNewAction={createNewSetlist}
    />
  )
}