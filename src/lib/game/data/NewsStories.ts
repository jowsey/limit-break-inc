import { game } from '../Game.svelte';

export interface Story {
	id: string;
	title: string;
	content: string;
	requirements?: () => boolean;
}

export const Stories: Story[] = [
	{
		id: 'welcome',
		title: 'Startup Promises Limitless Energy',
		content:
			'A new startup by the name of "Limit Break Inc." promises to revolutionize energy production with an innovative new technology powered by a mysterious, newly-discovered resource. This resource — which they\'re dubbing "Flux" — can be found almost anywhere, even in the very air we breathe, and injected into what the company calls a "Flux Core" to generate supposedly limitless power. It\'s still unclear whether this technology will scale, but scientists appear cautiously optimistic, and early tests have supposedly proved successful.',
		requirements: () => game.persistentState.stats.limitBreaks === 0
	},
	{
		id: 'one-watt-generated',
		title: 'Flux Tech Passes First Tests',
		content:
			'Energy startup Limit Break Inc. made waves recently after lofty claims of a new limitless energy source. The company says it has conducted initial tests of its Flux technology, successfully delivering a sustained 1 watt of energy. Far from a breakthrough, the company promises it will continue to work on scaling the technology to more practical levels.',
		requirements: () => game.totalOutput >= 1
	},
	{
		id: 'passive-generation',
		title: 'Passive Flux Harvesting Tech Unveiled',
		content:
			'Limit Break Inc. have announced a new method for harvesting Flux passively from the environment, circumventing the need for manual injection. It is understood that, until now, scientists at the company had been relying on human operators to inject Flux, but this new technology will allow for continuous harvesting and injection, giving the operators a well-deserved break.',
		requirements: () => game.getUpgradeLevel('flux-injectors') >= 1
	},
	{
		id: 'approaching-max-utilisation',
		title: 'Safety Concerns Over Flux Tech Thermal Limits',
		content:
			'As labs continue to experiment with emerging Flux technology, scientists are raising concerns about potential risks that come with exceeding the thermal limits of Flux Cores. They warn that pushing the technology beyond its limits could lead to catastrophic failures. Leading firm Limit Break Inc. has stated that it is aware of these concerns and is working on better understanding its tech.',
		requirements: () => game.getCoreTemperature(0) / game.getUpgradedStat('thermalLimitDeg') >= 0.8
	}
] as const;
