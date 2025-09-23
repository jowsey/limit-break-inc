<script>
	import PowerCore from '$lib/components/PowerCore.svelte';
	import Window from '$lib/components/Window.svelte';
	import { game } from '$lib/game/Game.svelte';
</script>

<div class="my-4 flex flex-wrap items-center justify-center">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each game.persistentState.cores as core, i (i)}
		<PowerCore {i}></PowerCore>
	{/each}
</div>

<div class="mx-auto grid max-w-7xl auto-rows-[128px] grid-cols-1 gap-4 py-2 lg:grid-cols-4">
	<Window title="Company" class="row-span-2 md:col-span-3">
		<p class="font-thin tracking-widest">BALANCE</p>
		<p class="text-3xl font-bold">${game.persistentState.balance.toFixed(2).toLocaleString()}</p>
	</Window>

	<Window title="Technology" class="row-span-5">
		<p>yuuup</p>
	</Window>

	<Window title="Market">
		<p class="font-thin tracking-widest">SELL VALUE</p>
		<div class="flex items-end gap-x-1">
			<p class="text-3xl font-bold">${game.persistentState.market.kwhPrice.toFixed(2).toLocaleString()}</p>
			<p>/kWh</p>
		</div>
	</Window>

	<Window title="Misc">
		<p>yuuup</p>
	</Window>
	<Window title="Other">
		<p>yuuup</p>
	</Window>
	<Window title="Misc">
		<p>yuuup</p>
	</Window>
	<Window title="Other">
		<p>yuuup</p>
	</Window>
</div>
