<script>
	import PowerCore from '$lib/components/PowerCore.svelte';
	import Window from '$lib/components/Window.svelte';
	import { StatTypeToString, Upgrades } from '$lib/game/data/Upgrades';
	import { game } from '$lib/game/Game.svelte';
</script>

<div class="my-4 flex flex-wrap items-center justify-center gap-2">
	<!-- todo is there a nicer way of doing this (almost certainly yes but i can't think what bc tired) -->
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each new Array(game.persistentState.cores) as _, i (i)}
		<PowerCore {i}></PowerCore>
	{/each}
</div>

<div class="mx-auto grid max-w-7xl auto-rows-[128px] grid-cols-1 gap-4 py-2 sm:grid-cols-2 lg:grid-cols-4">
	<Window title="Company" class="row-span-2 lg:col-span-3">
		<p class="font-thin tracking-widest">BALANCE</p>
		<p class="text-3xl font-bold">${game.persistentState.balance.toFixed(2).toLocaleString()}</p>
	</Window>

	<Window title="Technology" class="row-span-5">
		{#each Upgrades as upgrade (upgrade.id)}
			<div class="-mx-4 mb-1 flex flex-col bg-neutral-50/5 p-2">
				<p class="text-sm font-bold tracking-wide uppercase">
					{upgrade.displayName} <span class="text-xs font-normal">Mk. {game.getUpgradeLevel(upgrade.id) + 1}</span>
				</p>
				{#each upgrade.effects as effect (effect.stat)}
					{@const positivity = game.getUpgradePositivity(upgrade.id, effect.stat)}
					{@const operator = effect.method === 'add' ? (effect.value > 0 ? '+' : '-') : '×'}
					<div class="my-1 flex w-full items-center justify-between text-xs text-neutral-300">
						<p>
							<span class={positivity === 1 ? 'text-lime-500' : positivity === -1 ? 'text-red-500' : 'text-neutral-500'}>
								{operator}{effect.value.toFixed(2)}
							</span>
							{StatTypeToString[effect.stat]}
						</p>
						<p>
							<span class={positivity === 1 ? 'text-lime-500' : positivity === -1 ? 'text-red-500' : 'text-neutral-500'}>
								{operator}{game.getUpgradeEffectTotal(upgrade.id, effect.stat).toFixed(2)}
							</span>
							total
						</p>
					</div>
				{/each}
				<p class="text-xs text-pretty text-neutral-300">{upgrade.description}</p>
				<div class="mt-2 flex w-full items-center gap-x-2">
					<button
						class="flex-1 cursor-pointer rounded bg-brand-light px-2 py-1 text-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
						on:click={() => game.purchaseUpgrade(upgrade.id)}
						disabled={game.persistentState.balance < game.calculateUpgradeCost(upgrade.id)}
					>
						<p>UPGRADE</p>
					</button>

					<p class="min-w-1/4 text-right text-sm font-bold">${game.calculateUpgradeCost(upgrade.id).toFixed(2).toLocaleString()}</p>
				</div>
			</div>
		{/each}
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
