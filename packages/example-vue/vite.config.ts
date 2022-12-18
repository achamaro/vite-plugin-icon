import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import IconPlugin from "vite-plugin-icon"
import Inspect from 'vite-plugin-inspect'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [Inspect(), vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => ["i-"].includes(tag),
      },
    },
  }), IconPlugin()],
})
