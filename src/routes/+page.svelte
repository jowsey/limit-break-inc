<script lang="ts">
	import NewsBox from '$lib/components/NewsBox.svelte';
	import PowerCore from '$lib/components/PowerCore.svelte';
	import SevenSegmentText from '$lib/components/SevenSegmentText.svelte';
	import Window from '$lib/components/Window.svelte';
	import { StatTypeToString, Upgrades } from '$lib/game/data/Upgrades';
	import { game } from '$lib/game/Game.svelte';
	import { formatWattHours } from '$lib/utils';
	import { fade } from 'svelte/transition';
</script>

<div class="my-4 flex flex-wrap items-center justify-center gap-2">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each Array(game.persistentState.cores) as _, i (i)}
		<PowerCore {i}></PowerCore>
	{/each}
</div>

{#if game.persistentState.limitBreakWh > 0}
	<div transition:fade class="mt-8 mb-2 grid w-full grid-cols-8 items-center gap-8">
		<SevenSegmentText class="col-span-3 ml-auto" text={formatWattHours(game.persistentState.limitBreakWh)} />
		<div class="relative col-span-2 flex h-10 w-full items-center justify-center border-x border-brand-light">
			<div
				style="width: {game.getLimitBreakProgress() * 100}%; contrast: calc(0.5 + {game.getLimitBreakProgress()});"
				class="absolute left-0 h-full bg-gradient-to-r from-indigo-500/25 to-fuchsia-300/25"
			></div>
			<button
				class="font-bold tracking-widest text-shadow-fuchsia-500 enabled:cursor-pointer enabled:text-shadow-md disabled:opacity-25"
				disabled={game.getLimitBreakProgress() < 1}
				on:click={() => {}}
			>
				LIMIT BREAK
			</button>
		</div>
		<SevenSegmentText class="col-span-3" text={formatWattHours(game.getLimitBreakCostWattHours())} />
	</div>
{/if}

<div class="mx-auto grid max-w-7xl auto-rows-[128px] grid-cols-1 gap-4 pt-2 pb-4 sm:grid-cols-2 lg:grid-cols-4">
	<Window title="Company" class="row-span-2 tabular-nums">
		<p class="font-thin tracking-widest">BALANCE</p>
		<p class="text-3xl font-bold">${game.persistentState.balance.toFixed(2).toLocaleString()}</p>

		<p class="mt-2 font-thin tracking-widest">SELL VALUE</p>
		<div class="flex items-end gap-x-1">
			<p class="text-3xl font-bold">${(game.kwhPrice * game.incomeBoostMultiplier).toFixed(2).toLocaleString()}</p>
			<p>/kWh</p>
		</div>
		<p class="text-xs text-neutral-300">
			${game.kwhPrice.toFixed(2).toLocaleString()}/kWh * {game.incomeBoostMultiplier}x research subsidy
		</p>
	</Window>

	<Window title="News" class="row-span-2 pb-0 lg:col-span-2">
		<NewsBox />
	</Window>

	<Window title="Parts" class="row-span-5 tabular-nums">
		<div class="-mx-4 overflow-y-auto">
			{#each Upgrades as upgrade (upgrade.id)}
				<div class="mb-1 flex flex-col bg-neutral-50/5 p-2">
					<p class="text-sm font-bold tracking-wide uppercase">
						{upgrade.displayName}
						<span class="text-xs font-normal">Mk. {game.getUpgradeLevel(upgrade.id) + (upgrade.countOneHigher ? 1 : 0)}</span>
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
							class="flex-1 cursor-pointer rounded bg-brand-light px-2 py-1 text-sm select-none hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
							on:click={() => game.purchaseUpgrade(upgrade.id)}
							disabled={game.persistentState.balance < game.calculateUpgradeCost(upgrade.id)}
						>
							<p>UPGRADE</p>
						</button>

						<p class="min-w-1/4 text-right text-sm font-bold">${game.calculateUpgradeCost(upgrade.id).toFixed(2).toLocaleString()}</p>
					</div>
				</div>
			{/each}
		</div>
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
	<Window title="Other">
		<p>yuuup</p>
	</Window>
</div>
