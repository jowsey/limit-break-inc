export type UpgradeStat = 'fluxPerClick' | 'clickDecayRate' | 'fluxHarvestRate' | 'wattsPerFlux' | 'heatPerWatt' | 'heatCapacity';

export interface StatValue {
	stat: UpgradeStat;
	value: number;
}

// export const CoreBaseStats: StatValue[] = [
// 	{ stat: 'fluxHarvestRate', value: 0 },
// 	{ stat: 'wattsPerFlux', value: 0.1 },
// 	{ stat: 'heatPerWatt', value: 0.5 },
// 	{ stat: 'heatCapacity', value: 10 }
// ];

export const StatTypeToString: Record<UpgradeStat, string> = {
	fluxPerClick: 'flux/click',
	clickDecayRate: 'click decay/s',
	fluxHarvestRate: 'flux/s',
	wattsPerFlux: 'W/flux',
	heatPerWatt: '°C/W',
	heatCapacity: 'Max °C'
} as const;

interface UpgradeEffect extends StatValue {
	method: 'add' | 'multiply';
}

export interface Upgrade {
	id: string;
	displayName: string;
	description: string;
	// Cost at first purchase
	cost: number;
	// Cost multiplier per level
	costScaling?: number;
	effects: UpgradeEffect[];
	// If true, considers negative effects to be good for the player
	invertPositivity?: boolean;
}

export const Upgrades: Upgrade[] = [
	{
		id: 'manual-injection',
		displayName: 'Manual Injection',
		description: 'Manually inject Flux to generate power.',
		cost: 10,
		effects: [
			{
				stat: 'fluxPerClick',
				method: 'add',
				value: 0.1
			}
		]
	},
	{
		id: 'flux-injectors',
		displayName: 'Flux Injectors',
		description: 'Harvest Flux from their surroundings and inject it into Flux Cores.',
		cost: 5,
		effects: [
			{
				stat: 'fluxHarvestRate',
				method: 'add',
				value: 0.03
			}
		]
	},
	{
		id: 'thermal-coating',
		displayName: 'Thermal Coating',
		description: 'Improve the heat efficiency of Flux Cores, reducing waste heat generated per watt produced.',
		cost: 20,
		effects: [
			{
				stat: 'heatPerWatt',
				method: 'multiply',
				value: 0.99
			}
		],
		invertPositivity: true
	}
] as const;

export type UpgradeId = (typeof Upgrades)[number]['id'];
