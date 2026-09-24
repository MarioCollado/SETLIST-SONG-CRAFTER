'use server'

import { createClient } from '@/lib/supabase-server'
import { createSetlist } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createNewSetlist() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const setlist = await createSetlist(user.id, {
    title: 'New Setlist',
    date: new Date().toISOString().split('T')[0],
    venue: null,
    notes: null,
  })

  revalidatePath('/setlists')
  redirect(`/setlists/${setlist.id}`)
}