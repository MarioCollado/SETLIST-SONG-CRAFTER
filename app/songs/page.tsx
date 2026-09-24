import { createClient } from '@/lib/supabase-server'
import { getSongs } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createNewSong } from './actions'

export default async function SongsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const songs = await getSongs(user.id)

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-[var(--s1)] border-b border-[var(--border)]">
        <h1 className="text-lg font-extrabold uppercase tracking-wide text-[var(--t-pri)]">
          Songs
        </h1>
        <form action={createNewSong}>
          <button
            type="submit"
            className="btn-primary px-4 text-sm"
            style={{ height: '36px', minHeight: '36px' }}
          >
            + New
          </button>
        </form>
      </header>

      {/* List */}
      <div className="px-4 py-3 space-y-2">
        {songs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-30">♪</p>
            <p className="text-sm text-[var(--t-dim)]">
              No songs yet. Tap <strong className="text-[var(--t-sec)]">+ New</strong> to add your first.
            </p>
          </div>
        ) : (
          songs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className="card flex items-center gap-3 px-4 py-3.5 active:scale-[0.99] transition-transform"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--t-pri)] truncate">{song.title}</p>
                <p className="text-xs text-[var(--t-sec)] mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {song.key && <span>{song.key}</span>}
                  {song.bpm_default && <span>{song.bpm_default} BPM</span>}
                  {song.time_signature && song.time_signature !== '4/4' && (
                    <span>{song.time_signature}</span>
                  )}
                  {song.genre && <span>{song.genre}</span>}
                  {!song.key && !song.bpm_default && !song.genre && (
                    <span className="text-[var(--t-dim)]">No details yet</span>
                  )}
                </p>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="var(--t-dim)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
