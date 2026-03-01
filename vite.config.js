import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // ▼ ここにRenderのURLを許可する設定を追加 ▼
    allowedHosts: ['app-learningenglish.onrender.com']
  },
  preview: {
    // ▼ preview（本番確認モード）用の許可も念のため追加 ▼
    allowedHosts: ['app-learningenglish.onrender.com']
  }
})