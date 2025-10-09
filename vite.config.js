import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default definePlugin({
  plugins: [react()],
  base: '/team-rating-app/',  // ← это нужно чтобы Vite знал где будет сайт
})