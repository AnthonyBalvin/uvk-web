import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  
  integrations: [
    react()
  ],
  
  vite: {
    plugins: [tailwindcss()],

    // 👇 AÑADE ESTO DENTRO DE 'vite' 👇
    server: {
      // Permite que cualquier subdominio de ngrok-free.dev acceda a tu servidor.
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io']
    }
  },
});
