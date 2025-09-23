export interface UpgradeEffect {
	type: 'generation' | 'efficiency';
	effectType: 'add' | 'multiply';
	value: number;
}

export interface Upgrade {
	id: number;
	effects: UpgradeEffect[];
}

export const Upgrades = [
	{
		id: 'refined-flux',
		effects: [
			{
				type: 'generation',
				effectType: 'multiply',
				value: 1.5
			}
		]
	}
] as const;

export type UpgradeId = (typeof Upgrades)[number]['id'];
