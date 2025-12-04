// vite.config.ts - Vite 개발 서버 및 React 플러그인 설정
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 15010,
  },
})


