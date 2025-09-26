<script lang="ts">
	type Attribs = import('svelte/elements').SvelteHTMLElements['div'];
	interface Props extends Attribs {
		title?: string;
		children?: import('svelte').Snippet;
	}

	let { title, children, ...attribs }: Props = $props();
</script>

<div
	{...attribs}
	class={[
		'smooth-corners flex flex-col overflow-auto rounded-3xl border-[0.5px] border-brand-light bg-gradient-to-tl from-brand-dark from-5% p-4',
		attribs.class
	]}
>
	<p class="mb-2 text-xl font-black tracking-widest text-neutral-50 uppercase drop-shadow-sm drop-shadow-fuchsia-700">
		{title}
	</p>
	{@render children?.()}
</div>
