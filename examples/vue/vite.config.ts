import IconPlugin from "@achamaro/vite-plugin-icon";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ["i-con"].includes(tag),
        },
      },
    }),
    IconPlugin(),
  ],
});
