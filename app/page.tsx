import { redirect } from 'next/navigation'

// Root → always redirect to setlists
export default function RootPage() {
  redirect('/setlists')
}
