<script>
	import PowerCore from '$lib/components/PowerCore.svelte';
	import Window from '$lib/components/Window.svelte';
	import { game } from '$lib/game/Game.svelte';

	// debug: eventually pull this from Game state
	let currentPower = $state(1);
	setInterval(() => {
		if (currentPower < maxPower) {
			currentPower += 1;
		}
	}, 10);
	let maxPower = $state(1000);
</script>

<PowerCore {currentPower} {maxPower}></PowerCore>

<div class="grid auto-rows-[128px] grid-cols-1 gap-4 lg:grid-cols-4">
	<Window title="Company" class="row-span-2 md:col-span-3">
		<p class="font-thin tracking-widest">BALANCE</p>
		<p class="text-3xl font-bold">${game.state.balance.toLocaleString()}</p>
	</Window>

	<Window title="Technology" class="row-span-5">
		<p>yuuup</p>
	</Window>
	<Window title="Market">
		<p>yuuup</p>
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
