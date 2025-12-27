import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 🌟 关键：设置打包路径为相对路径，这样无论你把文件放哪都能运行
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})