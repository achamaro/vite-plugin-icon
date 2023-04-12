import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import IconPlugin from "@achamaro/vite-plugin-icon";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [Inspect(), react(), IconPlugin()],
});
