import { createBrowserClient } from '@supabase/ssr'

// Obtenemos las variables de entorno
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY

// Creamos un cliente de Supabase para el NAVEGADOR que es compatible con SSR.
// Este cliente sabrá leer las cookies de sesión que el servidor le prepara.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)