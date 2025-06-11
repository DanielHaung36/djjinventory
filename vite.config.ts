import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  // 让 CSS 在开发环境也生成 sourcemap
  css: {
    devSourcemap: true,
  },

  // 如果你想打包时也保留 .map 文件（部署前可关掉）
  build: {
    sourcemap: true,
  },

  plugins: [
    react({
      // 给 Emotion（MUI v5）加上 sourceMap + autoLabel
      babel: {
        plugins: [
          ['@emotion/babel-plugin', {
            sourceMap: true,
            autoLabel: 'dev-only',
          }],
        ],
      },
    }),
    tailwindcss(),  // 你的 Tailwind 插件
  ],

  resolve: {
    alias: {
      '@':        path.resolve(__dirname, 'src'),
      '@features': path.resolve(__dirname, 'src/features'),
    },
  },
})
