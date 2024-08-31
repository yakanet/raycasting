import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: "assets",
  build: {
    minify: false,
    sourcemap: true,
  },
  server: {
    port: 6969
  }
});