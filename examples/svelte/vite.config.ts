import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import IconPlugin from "@achamaro/vite-plugin-icon";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [Inspect(), IconPlugin(), svelte()],
});
