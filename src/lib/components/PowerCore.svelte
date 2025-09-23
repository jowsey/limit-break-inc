<script lang="ts">
	interface Props {
		currentPower: number;
		maxPower: number;
	}

	let { currentPower, maxPower }: Props = $props();
</script>

<div
	style="--power-ratio: {Math.min(Math.max(currentPower / maxPower, 0), 1)};"
	class="relative my-4 flex h-48 w-full items-center justify-center"
>
	<p class="absolute ml-[0.5em] text-xl font-black tracking-[0.5em] text-neutral-50/5">POWER</p>
	<p class="absolute font-seven text-xl text-neutral-50/20">000%</p>
	<p class="absolute font-seven text-xl drop-shadow-md drop-shadow-fuchsia-700">
		{Math.round((currentPower / maxPower) * 100)
			.toString()
			.padStart(3, '0')}%
	</p>

	<div
		id="core"
		class="relative size-48 rounded-full bg-gradient-to-tr from-fuchsia-500/15 via-purple-500/10 to-indigo-500/10"
	>
		<div class="absolute inset-0 rounded-full border border-white/5"></div>
		<div class="absolute inset-0 rounded-full border border-white/15 blur-sm"></div>
		<div class="absolute inset-0 rounded-full border border-white/15 blur-md"></div>
		<div class="absolute inset-0 rounded-full border border-white/15 blur-lg"></div>
		<div
			style="border-width: calc(8px * var(--power-ratio))"
			class="absolute inset-0 rounded-full border-fuchsia-700 blur-lg"
		></div>

		<div class="relative flex size-full items-center justify-center blur-xs">
			<div id="core-center" class="rounded-full"></div>
		</div>
	</div>
</div>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	#core {
		animation: spin calc(0.06s + 19.94s * pow(max(1 - var(--power-ratio), 0.01), 1.5)) linear infinite;
	}

	#core-center {
		width: calc(96px * (2 - var(--power-ratio)));
		height: calc(96px * (2 - var(--power-ratio)));

		box-shadow: 0 0 32px calc(24px * (0.05 + var(--power-ratio) * 0.95))
			rgba(168, 85, 247, calc(0.1 + var(--power-ratio) * 0.9));
	}
</style>
