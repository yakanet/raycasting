let ctx: AudioContext | null = null;

function getContext(): AudioContext {
	if (!ctx) ctx = new AudioContext();
	return ctx;
}


export function playCoinSound(): void {
	const ac = getContext();
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	osc.connect(gain);
	gain.connect(ac.destination);

	osc.type = 'square';
	osc.frequency.setValueAtTime(880, ac.currentTime);
	osc.frequency.setValueAtTime(1175, ac.currentTime + 0.06);

	gain.gain.setValueAtTime(0.15, ac.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);

	osc.start(ac.currentTime);
	osc.stop(ac.currentTime + 0.15);
}

export function playTeleportSound(): void {
	const ac = getContext();
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	osc.connect(gain);
	gain.connect(ac.destination);

	osc.type = 'sine';
	osc.frequency.setValueAtTime(220, ac.currentTime);
	osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.15);
	osc.frequency.exponentialRampToValueAtTime(1760, ac.currentTime + 0.3);

	gain.gain.setValueAtTime(0.2, ac.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);

	osc.start(ac.currentTime);
	osc.stop(ac.currentTime + 0.35);
}

export function playBombSound(): void {
	const ac = getContext();
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	osc.connect(gain);
	gain.connect(ac.destination);

	osc.type = 'triangle';
	osc.frequency.setValueAtTime(300, ac.currentTime);
	osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.2);

	gain.gain.setValueAtTime(0.2, ac.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

	osc.start(ac.currentTime);
	osc.stop(ac.currentTime + 0.25);
}
