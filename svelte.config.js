import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		experimental: {
			async: true
		}
	},
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		},
		prerender: {
			entries: ['/'],
			handleUnseenRoutes: 'ignore'
		}
	}
};

export default config;
