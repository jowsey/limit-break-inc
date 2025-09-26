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
			'A new startup by the name of "Limit Break Inc." promises to revolutionize energy production with an innovative new technology powered by a mysterious, newly-discovered resource. This resource — which they\'re dubbing "Flux" — can be found almost anywhere, even in the very air we breathe, and injected into what the company calls a "Flux Core" to generate supposedly limitless power. It\'s still unclear whether this technology will scale, but scientists appear cautiously optimistic, and early tests have supposedly proved successful.'
	},
	{
		id: 'one-watt-generated',
		title: 'Flux Tech Passes First Tests',
		content:
			'Energy startup Limit Break Inc. made waves recently after lofty claims of a new limitless energy source. The company says it has conducted initial tests of its Flux technology, successfully delivering a sustained 1 watt of energy. Far from a breakthrough, the company promises it will continue to work on scaling the technology to more practical levels.',
		requirements: () => game.totalOutput >= 1
	}
] as const;
