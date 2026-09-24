'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

type Mode = 'login' | 'signup'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/setlists'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const supabase = createClient()

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push(redirectTo)
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Cuenta creada. Revisa tu email para confirmar la cuenta antes de iniciar sesión.')
        setMode('login')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          setError('Error de conexión con Supabase. Verifica que tu URL en .env.local sea válida y que tengas conexión a internet.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Ocurrió un error inesperado al procesar la solicitud.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 bg-[var(--bg)]">
      {/* Logo / wordmark */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--t-pri)] uppercase">
          SETSONG
        </h1>
        <p className="mt-1 text-sm text-[var(--t-sec)]">
          Songs & setlists for live performance
        </p>
      </div>

      {/* Card */}
      <div className="card w-full max-w-sm p-6 animate-fade-in">
        <h2 className="text-base font-semibold text-[var(--t-pri)] mb-6">
          {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#E05555] bg-[#E0555515] border border-[#E0555530] rounded-lg px-3 py-2.5 leading-relaxed">
              {error}
            </p>
          )}

          {/* Info */}
          {info && (
            <p className="text-sm text-[#4A8ACA] bg-[#4A8ACA15] border border-[#4A8ACA30] rounded-lg px-3 py-2.5 leading-relaxed">
              {info}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-sm font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setInfo(null)
            }}
            className="text-sm text-[var(--t-sec)] hover:text-[var(--t-pri)] transition-colors"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[var(--bg)] text-[var(--t-dim)]">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}