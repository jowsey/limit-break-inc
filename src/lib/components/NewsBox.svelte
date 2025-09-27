<script lang="ts">
	import { Stories, type Story } from '$lib/game/data/NewsStories';
	import { game } from '$lib/game/Game.svelte';

	let activeIndex = $state(-1);
	let activeStory: Story | null = $derived(Stories.find((s) => s.id === game.persistentState.news.unlocked[activeIndex]) ?? null);

	let latestSeenIndex = $state(-1);

	// if we don't have a story already or there's one we haven't seen, switch to it
	$effect(() => {
		if (
			(activeIndex === -1 && game.persistentState.news.unlocked.length > 0) ||
			latestSeenIndex < game.persistentState.news.unlocked.length - 1
		) {
			activeIndex = game.persistentState.news.unlocked.length - 1;
			latestSeenIndex = activeIndex;
		}
	});

	let isFirstStory = $derived(activeIndex === 0);
	let isLastStory = $derived(activeIndex === game.persistentState.news.unlocked.length - 1);
</script>

<div class="flex grow flex-col">
	<div class="flex items-start justify-between">
		<p class="font-bold tracking-wide uppercase">{activeStory?.title}</p>
		<div class="flex items-start justify-between gap-x-1">
			<button
				class="cursor-pointer rounded-lg bg-brand-light px-2 py-1 text-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isFirstStory}
				onclick={() => (activeIndex = Math.max(activeIndex - 1, 0))}
			>
				<p>←</p>
			</button>
			<button
				class="cursor-pointer rounded-lg bg-brand-light px-2 py-1 text-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isLastStory}
				onclick={() => (activeIndex = Math.min(activeIndex + 1, game.persistentState.news.unlocked.length - 1))}
			>
				<p>→</p>
			</button>
		</div>
	</div>
	<div class="mt-2 flex h-0 grow gap-4 overflow-y-auto">
		<img src="https://placecats.com/300/300" class="size-24 min-h-24 min-w-24 rounded-md object-cover" alt="article" />
		<p class="text-justify text-sm leading-tight font-thin text-neutral-300">
			{activeStory?.content}
		</p>
	</div>
</div>
