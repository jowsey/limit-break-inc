<script lang="ts">
	type DivAttribs = import('svelte/elements').SvelteHTMLElements['div'];
	interface Props extends DivAttribs {
		text: string;
		minDigits?: number;
	}

	let { text, minDigits = 0, ...attribs }: Props = $props();
	const digits = $derived(Math.max(minDigits, text.replaceAll('.', '').length));
</script>

<div {...attribs} class={['font-seven', attribs.class]}>
	<div class="relative size-full">
		<!-- still reserve space -->
		<div class="invisible">{''.padStart(digits, '8')}</div>

		<span class="absolute top-0 left-0 text-neutral-50/15">{''.padStart(digits, '8')}</span>
		<span class="absolute top-0 left-0 drop-shadow-md drop-shadow-fuchsia-700">
			<!-- exclamation is all-off in DSEG font -->
			{text.replaceAll(' ', '!').padStart(digits, '!')}
		</span>
	</div>
</div>
