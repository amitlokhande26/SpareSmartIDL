import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "scandent-trista-pluglike.ngrok-free.app" // 👈 your ngrok domain
    ]
  }
})
