import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 * Use in Client Components ('use client').
 */
export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || url.includes('xxxxxxxxxx')) {
    throw new Error('Configuración de Supabase incompleta: NEXT_PUBLIC_SUPABASE_URL no está configurada con tu URL real en .env.local')
  }

  if (!key || key.includes('...')) {
    throw new Error('Configuración de Supabase incompleta: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada en .env.local')
  }

  // Remove any accidental /rest/v1 or trailing slashes
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

  return createBrowserClient(url, key)
}