import type { Inventory } from '$lib/engine';

export let inventoryState: Inventory = $state({});

export function addToInventory(key: string, amount: number = 1): void {
	inventoryState[key] = (inventoryState[key] ?? 0) + amount;
}

export function resetInventory(): void {
	for (const key of Object.keys(inventoryState)) {
		delete inventoryState[key];
	}
}
