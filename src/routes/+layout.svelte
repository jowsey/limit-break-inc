<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { formatWatts } from '$lib/utils';

	let { children } = $props();

	let output = $state(0.001);

	setInterval(() => {
		output *= 1.01;
	}, 1000 / 20);
</script>

<svelte:head>
	<title>{formatWatts(output)} · LIMIT BREAK INC</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="h-dvh w-dvw overflow-y-auto overscroll-none bg-[oklch(0.115_0.03_324)] px-4 pt-12 text-neutral-50"
>
	<div class="absolute top-0 left-0 h-10 w-dvw overflow-hidden">
		<svg
			viewBox="0 0 1200 32"
			class=""
			preserveAspectRatio="xMidYMin slice"
			width="100%"
			height="100%"
		>
			<path
				d="M0,0 L0,10 L386,10 C386,10 398,10 404,12 C410,14 416,18 422,22 C428,26 434,28 446,28 L754,28 C766,28 772,26 778,22 784,18 790,14 796,12 802,10 814,10 814,10 L1200,10 L1200,0 Z"
				fill="oklch(0.16 0.03 324)"
			/>

			<!-- border -->
			<path
				d="M0,10 L386,10 C386,10 398,10 404,12 C410,14 416,18 422,22 C428,26 434,28 446,28 L754,28 C766,28 772,26 778,22 784,18 790,14 796,12 802,10 814,10 814,10 L1200,10"
				fill="none"
				stroke="oklch(0.33 0.03 324)"
				stroke-width="0.5"
			/>
		</svg>

		<p
			class="absolute top-0 left-1/2 m-[0.5em] mt-1 -translate-x-1/2 text-xl font-black tracking-[1em] text-white/5 select-none"
		>
			GENERATING
		</p>

		<p
			class="absolute top-0 left-1/2 mt-1 -translate-x-1/2 font-seven text-xl font-black text-neutral-50 lining-nums tabular-nums drop-shadow-sm drop-shadow-fuchsia-700"
		>
			{formatWatts(output)}
		</p>
	</div>

	{@render children?.()}
</div>
