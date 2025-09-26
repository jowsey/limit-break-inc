<script lang="ts">
	import { game } from '$lib/game/Game.svelte';
	import { onMount } from 'svelte';
	import SevenSegmentText from './SevenSegmentText.svelte';

	interface Props {
		i: number;
	}

	let { i }: Props = $props();

	const utilisation = $derived(game.getCoreTemperature(i) / game.getUpgradedStat('thermalLimitDeg'));
	let spinRotation = $state(0);

	const baseSpinRate = 360 / 20;
	const maxSpinRate = 360 / 0.06;

	onMount(() => {
		let currentTime = performance.now();

		let frame: number;
		const spin = () => {
			const newTime = performance.now();
			const deltaTime = (newTime - currentTime) / 1000;
			currentTime = newTime;

			let spinRate = baseSpinRate + (maxSpinRate - baseSpinRate) * Math.pow(utilisation, 1.5);
			spinRotation = (spinRotation + spinRate * deltaTime) % 360;
			frame = requestAnimationFrame(spin);
		};

		frame = requestAnimationFrame(spin);

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

<button
	style="--utilisation: {utilisation}; --rotation: {spinRotation}deg;"
	class="relative flex size-48 cursor-pointer items-center justify-center outline-0 transition-all duration-75"
	onclick={() => game.addCoreClick(i)}
>
	<p class="absolute ml-[0.5em] text-xl font-black tracking-[0.5em] text-neutral-50/5 select-none">CORE {i + 1}</p>
	<div class="absolute flex flex-col items-center">
		<SevenSegmentText class="text-xl" text={Math.ceil(game.getCoreTemperature(i)) + '°C'} minDigits={5} />
		<SevenSegmentText class="text-sm" text={Math.round(utilisation * 100) + '%'} minDigits={4} />
	</div>

	<div id="core" class="relative size-48 rounded-full bg-gradient-to-tr from-fuchsia-500/15 via-purple-500/10 to-indigo-500/10">
		<div class="absolute inset-0 rounded-full border border-white/5"></div>
		<div class="absolute inset-0 rounded-full border border-white/15 blur-sm"></div>
		<div class="absolute inset-0 rounded-full border border-white/15 blur-md"></div>
		<div class="absolute inset-0 rounded-full border border-white/15 blur-lg"></div>
		<div style="border-width: calc(8px * var(--utilisation))" class="absolute inset-0 rounded-full border-fuchsia-700 blur-lg"></div>

		<div class="relative flex size-full items-center justify-center blur-xs">
			<div id="core-center" class="rounded-full"></div>
		</div>
	</div>
</button>

<style>
	#core {
		/* we set indepdently instead of using animation to prevent issues with changing duration (runs backwards n stuff?) */
		transform: rotate(var(--rotation)) scale(calc(1 + var(--utilisation) * 0.1));
		filter: contrast(calc(0.2 + var(--utilisation) * 0.8));
	}

	#core-center {
		width: calc(96px * (2 - var(--utilisation)));
		height: calc(96px * (2 - var(--utilisation)));

		box-shadow: 0 0 32px calc(24px * (0.05 + var(--utilisation) * 0.95)) rgba(168, 85, 247, calc(0.1 + var(--utilisation) * 0.9));
	}
</style>
