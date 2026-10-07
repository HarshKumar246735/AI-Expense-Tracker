import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, /api and /uploads are proxied to the Express server, so the browser sees one origin
// (this is what makes the httpOnly auth cookie work without any CORS setup).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
