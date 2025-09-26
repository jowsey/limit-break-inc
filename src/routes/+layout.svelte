<script lang="ts">
	import '../app.css';
	import { formatWatts } from '$lib/utils';
	import { onMount } from 'svelte';
	import { game } from '$lib/game/Game.svelte';
	import { page } from '$app/state';
	import SevenSegmentText from '$lib/components/SevenSegmentText.svelte';

	let { children } = $props();

	if (page.url.searchParams.get('reset') === 'true') {
		game.resetState();
	}

	onMount(() => {
		game.runLoop();

		// Runs on tab close / refresh but notably *not* on HMR (when return function is called)
		const beforeUnload = () => {
			game.saveState();
		};

		window.addEventListener('beforeunload', beforeUnload);

		return () => {
			game.stopLoop();

			window.removeEventListener('beforeunload', beforeUnload);
		};
	});
</script>

<svelte:head>
	<title>${game.persistentState.balance.toFixed(2).toLocaleString()} · LIMIT BREAK INC</title>
</svelte:head>

<div class="h-dvh w-dvw overflow-y-auto overscroll-none bg-[oklch(0.115_0.03_324)] px-4 pt-10 text-neutral-50">
	<div class="absolute top-0 left-0 flex h-10 w-dvw overflow-hidden">
		<svg class="flex-1" viewBox="0 0 386 32" preserveAspectRatio="none">
			<path d="M0,0 L0,10 L386,10 L386,0 Z" fill="var(--color-brand-dark)" />
			<path d="M0,10 L386,10" fill="none" stroke="var(--color-brand-light)" stroke-width="0.5" />
		</svg>

		<svg class="absolute left-1/2 flex-shrink-0 -translate-x-1/2" width="428" height="40" viewBox="0 0 428 32" preserveAspectRatio="none">
			<path
				d="M0,0 L0,10 C0,10 12,10 18,12 C24,14 30,18 36,22 C42,26 48,28 60,28 L368,28 C380,28 386,26 392,22 398,18 404,14 410,12 416,10 428,10 428,10 L428,0 Z"
				fill="var(--color-brand-dark)"
			/>
			<path
				d="M0,10 C0,10 12,10 18,12 C24,14 30,18 36,22 C42,26 48,28 60,28 L368,28 C380,28 386,26 392,22 398,18 404,14 410,12 416,10 428,10 428,10"
				fill="none"
				stroke="var(--color-brand-light)"
				stroke-width="0.5"
			/>
		</svg>

		<svg class="flex-1" viewBox="814 0 386 32" preserveAspectRatio="none">
			<path d="M814,0 L814,10 L1200,10 L1200,0 Z" fill="var(--color-brand-dark)" />
			<path d="M814,10 L1200,10" fill="none" stroke="var(--color-brand-light)" stroke-width="0.5" />
		</svg>

		<p class="absolute top-0 left-1/2 mt-1 ml-[0.5em] -translate-x-1/2 text-xl font-black tracking-[1em] text-neutral-50/5 select-none">
			GENERATING
		</p>

		<SevenSegmentText text={formatWatts(game.totalOutputSmooth)} class="absolute top-0 left-1/2 mt-1 -translate-x-1/2 text-xl" />
	</div>

	{@render children?.()}
</div>
