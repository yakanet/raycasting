declare module 'virtual:texture-atlas' {
	const manifest: {
		atlas: string | null;
		textureSize: number;
		entries: Array<{ slot: number; name: string; x: number }>;
	};
	export default manifest;
}
