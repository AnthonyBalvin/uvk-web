// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Obtenemos las variables de entorno de Supabase
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

  // Creamos un cliente de Supabase para el servidor
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(key) {
        return context.cookies.get(key)?.value;
      },
      set(key, value, options) {
        context.cookies.set(key, value, options);
      },
      remove(key, options) {
        context.cookies.delete(key, options);
      },
    },
  });

  // Lo más importante: Inyectamos el cliente de Supabase en context.locals
  // para que esté disponible en todas las páginas del servidor.
  context.locals.supabase = supabase;

  // Pasamos al siguiente middleware o a la página
  return next();
});