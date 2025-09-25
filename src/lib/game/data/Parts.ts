export interface PartEffect {
	type: 'fluxHarvestRate' | 'wattsPerFlux' | 'heatPerWatt' | 'heatCapacity';
	effectType: 'add' | 'multiply';
	value: number;
}

export interface Part {
	id: string;
	description: string;
	effects: PartEffect[];
}

export const Parts: Part[] = [
	{
		id: 'flux-injectors',
		description: 'Complex mechanisms for injecting harvested Flux into the Core.',
		effects: [
			{
				type: 'fluxHarvestRate',
				effectType: 'add',
				value: 1
			}
		]
	}
] as const;

export type PartId = (typeof Parts)[number]['id'];
