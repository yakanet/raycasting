import { playCoinSound, playBombSound, playTeleportSound } from './audio';

export interface EntityBehavior {
	inventoryKey: string;
	playSound: () => void;
}

const registry = new Map<string, EntityBehavior>();

export function registerEntity(type: string, behavior: EntityBehavior): void {
	registry.set(type, behavior);
}

export function getEntityBehavior(type: string): EntityBehavior | undefined {
	return registry.get(type);
}

export function getEntityTypes(): string[] {
	return Array.from(registry.keys());
}

// Register built-in entity types
registerEntity('coin', { inventoryKey: 'coins', playSound: playCoinSound });
registerEntity('bomb', { inventoryKey: 'bombs', playSound: playBombSound });
registerEntity('teleporter', { inventoryKey: '', playSound: playTeleportSound });
