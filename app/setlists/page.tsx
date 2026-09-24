import { createClient } from '@/lib/supabase-server'
import { getSetlists } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createNewSetlist } from './actions'

export default async function SetlistsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const setlists = await getSetlists(user.id)

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-[var(--s1)] border-b border-[var(--border)]">
        <h1 className="text-lg font-extrabold uppercase tracking-wide text-[var(--t-pri)]">
          Setlists
        </h1>
        <form action={createNewSetlist}>
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
      <div className="px-4 py-3 space-y-3">
        {setlists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-30">☷</p>
            <p className="text-sm text-[var(--t-dim)]">
              No setlists yet. Tap <strong className="text-[var(--t-sec)]">+ New</strong> to plan your live performance.
            </p>
          </div>
        ) : (
          setlists.map((setlist) => (
            <div
              key={setlist.id}
              className="card overflow-hidden transition-colors border border-[var(--border)] hover:border-[var(--t-dim)]"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/setlists/${setlist.id}`}
                      className="block font-bold text-base text-[var(--t-pri)] hover:text-white truncate"
                    >
                      {setlist.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--t-sec)]">
                      {setlist.date && (
                        <span>
                          {new Date(setlist.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      {setlist.venue && (
                        <>
                          <span className="text-[var(--t-dim)]">•</span>
                          <span className="truncate">{setlist.venue}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/setlists/${setlist.id}/perform`}
                    className="btn bg-[var(--s3)] text-[var(--t-pri)] hover:bg-white hover:text-black font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors flex-shrink-0"
                    style={{ minHeight: '36px' }}
                    title="Live Performance Mode"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <polygon points="2,1 11,6 2,11" />
                    </svg>
                    Live
                  </Link>
                </div>

                {setlist.notes && (
                  <p className="text-xs text-[var(--t-sec)] mt-2 line-clamp-1">
                    {setlist.notes}
                  </p>
                )}
              </div>

              <div className="bg-[var(--s1)] px-4 py-2 flex items-center justify-between border-t border-[var(--border)] text-xs text-[var(--t-dim)]">
                <span>Tap to edit songs & notes</span>
                <Link
                  href={`/setlists/${setlist.id}`}
                  className="text-[var(--t-sec)] hover:text-[var(--t-pri)] flex items-center gap-0.5"
                >
                  Edit
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 2.5l3.5 3.5-3.5 3.5" />
                  </svg>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}