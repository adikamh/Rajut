import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            req.url = '/public/index.html'
          }
          next()
        })
      }
    },
    {
      name: 'postbuild-clean',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist')
        const staticHtml = path.join(distPath, 'index.html')
        const builtHtml = path.join(distPath, 'public/index.html')
        const publicFolder = path.join(distPath, 'public')

        if (fs.existsSync(builtHtml)) {
          // Overwrite the static index.html with the compiled one
          fs.copyFileSync(builtHtml, staticHtml)
          // Delete the built html inside public/
          fs.unlinkSync(builtHtml)
        }
        if (fs.existsSync(publicFolder) && fs.readdirSync(publicFolder).length === 0) {
          // Remove the empty public/ folder
          fs.rmdirSync(publicFolder)
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html')
      }
    }
  }
})
