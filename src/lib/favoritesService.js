import { supabase } from './supabaseClient.js'

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

export async function fetchFavoriteIds() {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('favoritos')
    .select('pelicula_id')
    .eq('usuario_id', user.id)
  if (error) return []
  return (data || []).map(r => r.pelicula_id)
}

export async function toggleFavorite(peliculaId) {
  const user = await getCurrentUser()
  if (!user) throw new Error('No autenticado')

  const { data: existing, error: existErr } = await supabase
    .from('favoritos')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('pelicula_id', peliculaId)
    .maybeSingle()

  if (existErr) throw existErr

  if (existing) {
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('id', existing.id)
    if (error) throw error
    return { favored: false }
  } else {
    const { error } = await supabase
      .from('favoritos')
      .insert({ usuario_id: user.id, pelicula_id: peliculaId })
    if (error) throw error
    return { favored: true }
  }
}

export async function fetchFavoriteMovies() {
  const user = await getCurrentUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('favoritos')
    .select('pelicula:peliculas (*)')
    .eq('usuario_id', user.id)
  if (error) return []
  return (data || []).map(r => r.pelicula).filter(Boolean)
}
