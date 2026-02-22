import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { textureAtlasPlugin } from './src/lib/vite/texture-atlas-plugin';

export default defineConfig({
	plugins: [textureAtlasPlugin(), sveltekit()]
});
