// uvk-web/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
// ¡IMPORTANTE! Usa la clave SERVICE_ROLE aquí, no la clave pública.
// Debes añadir esta variable a tu archivo .env
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

// Este es tu cliente de Supabase para el backend (con permisos de administrador)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)