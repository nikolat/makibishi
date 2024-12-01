<script lang="ts">
	import type { SimplePool } from 'nostr-tools/pool';
	import type { NostrEvent } from 'nostr-tools/pure';
	import { insertEventIntoAscendingList, normalizeURL } from 'nostr-tools/utils';
	import { getGeneralEvents, inputCount, isValidEmoji, sendDeletion, sendReaction } from '../utils';
	import {
		defaultReaction,
		defaultRelays,
		expansionThreshold,
		profileRelays,
		reactionEventKind
	} from '../config';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import Reaction from './Reaction.svelte';

	let reactionEvents: NostrEvent[] = $state([]);
	let profiles: SvelteMap<string, NostrEvent> = $state(new SvelteMap<string, NostrEvent>());
	let isAllowedExpand: boolean = $state(false);
	let relays: string[] = $state([]);
	let targetUrl: string = $state('');
	let reactionContent: string = $state('');
	let allowAnonymousReaction: boolean = $state(false);
	let allowToDeleteReacion: boolean = $state(false);
	let isDisabledReaction: boolean = $state(true);
	let pubkey: string | undefined | null = $state();

	let {
		element,
		pool,
		anonymousSeckey
	}: { element: HTMLElement; pool: SimplePool; anonymousSeckey: Uint8Array } = $props();

	const getPubkey = async () => {
		if (!allowToDeleteReacion) {
			return;
		}
		if (pubkey !== undefined) {
			return;
		}
		pubkey = null;
		if (window.nostr === undefined) {
			return;
		}
		pubkey = await window.nostr.getPublicKey();
	};

	const getReactions = async (url: string): Promise<void> => {
		if (!URL.canParse(url)) return;
		const _reactionEventsFetched = await getGeneralEvents(
			pool,
			relays,
			[{ kinds: [reactionEventKind], '#r': [url] }],
			(event: NostrEvent) => {
				if (!reactionEvents.some((ev) => ev.id === event.id)) {
					reactionEvents = insertEventIntoAscendingList(reactionEvents, event);
				}
			},
			false
		);
	};

	const getProfiles = async (pubkeys: string[]): Promise<void> => {
		const _profileEventsFetched = await getGeneralEvents(
			pool,
			profileRelays,
			[{ kinds: [0], authors: pubkeys }],
			(event: NostrEvent) => {
				const prof = profiles.get(event.pubkey);
				if (prof === undefined || prof.created_at < event.created_at) {
					try {
						const _obj = JSON.parse(event.content);
					} catch (error) {
						console.warn(error);
						return;
					}
					profiles.set(event.pubkey, event);
				}
			},
			true
		);
	};

	const callSendReaction = async (): Promise<void> => {
		const event = await sendReaction(
			pool,
			relays,
			targetUrl,
			reactionContent,
			allowAnonymousReaction ? anonymousSeckey : undefined
		);
		if (event !== null && window.nostr !== undefined && !profiles.has(event.pubkey)) {
			await getProfiles([event.pubkey]);
		}
	};

	const callSendDeletion = async (id: string): Promise<void> => {
		await sendDeletion(pool, relays, id);
		reactionEvents = reactionEvents.filter((ev) => ev.id !== id);
	};

	onMount(async () => {
		const makibishiRelays = element.dataset.relays;
		const makibishiUrl = element.dataset.url;
		const makibishiReaction = element.dataset.content;
		const makibishiAllowAnonymousReaction = element.dataset.allowAnonymousReaction;
		const makibishiAllowToDeleteReaction = element.dataset.allowToDeleteReaction;
		if (makibishiRelays !== undefined) {
			relays = Array.from(
				new Set<string>(
					makibishiRelays
						.split(',')
						.filter((r) => URL.canParse(r))
						.map((r) => normalizeURL(r))
				)
			);
		} else {
			relays = defaultRelays;
		}
		if (makibishiUrl !== undefined && URL.canParse(makibishiUrl)) {
			targetUrl = new URL(makibishiUrl).href;
		} else {
			targetUrl = window.location.href.replace(/#.*$/, '');
		}
		if (/^file:\/\/\//.test(targetUrl)) {
			throw new TypeError('Local addresses are not allowed.');
		}
		if (makibishiReaction !== undefined && inputCount(makibishiReaction) <= 1) {
			reactionContent = makibishiReaction;
		} else {
			reactionContent = defaultReaction;
		}
		if (
			makibishiAllowAnonymousReaction !== undefined &&
			/^true$/i.test(makibishiAllowAnonymousReaction)
		) {
			allowAnonymousReaction = true;
		} else {
			allowAnonymousReaction = false;
		}
		if (
			makibishiAllowToDeleteReaction !== undefined &&
			/^true$/i.test(makibishiAllowToDeleteReaction)
		) {
			allowToDeleteReacion = true;
		} else {
			allowToDeleteReacion = false;
		}
		console.log('MAKIBISHI Settings:', {
			relays,
			targetUrl,
			reactionContent,
			allowAnonymousReaction,
			allowToDeleteReacion
		});
		isAllowedExpand = false;
		isDisabledReaction = true;
		await getReactions(targetUrl);
		const pubkeys: string[] = Array.from(
			new Set<string>(reactionValidEvents.map((ev) => ev.pubkey))
		);
		await getProfiles(pubkeys);
		//need to wait long enough to recognize window.nostr
		isDisabledReaction = window.nostr === undefined && !allowAnonymousReaction;
	});

	const reactionValidEvents = $derived(reactionEvents.filter((ev) => isValidEmoji(ev)));
	const reactionFirst = $derived(reactionValidEvents.at(0)!);
	const reactionLast = $derived(reactionValidEvents.at(-1)!);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span class="makibishi-container" onmouseover={getPubkey} onfocus={getPubkey}>
	<button
		class="makibishi-send"
		title="add a star"
		disabled={isDisabledReaction}
		onclick={callSendReaction}
		aria-label="add a star"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
			<path
				fill-rule="evenodd"
				d="M3.58169903,14.7981322 L4.42551943,9.87828177 L0.851038858,6.39402435 L5.79084952,5.67622784 L8,1.20000005 L10.2091505,5.67622784 L15.1489611,6.39402435 L11.5744806,9.87828177 L12.418301,14.7981322 L8,12.4752939 L3.58169903,14.7981322 Z M8,10.2157425 L9.76203892,11.1421011 L9.42551943,9.18004197 L10.8510389,7.79050395 L8.88101946,7.50424338 L8,5.71910297 L7.11898054,7.50424338 L5.14896114,7.79050395 L6.57448057,9.18004197 L6.23796108,11.1421011 L8,10.2157425 Z"
			/>
		</svg>
	</button>
	{#if reactionValidEvents.length <= expansionThreshold || isAllowedExpand}
		{#each reactionValidEvents as reactionEvent}<Reaction
				{reactionEvent}
				profileEvent={profiles.get(reactionEvent.pubkey)}
				isAuthor={reactionEvent.pubkey === pubkey}
				{callSendDeletion}
			/>{/each}
	{:else}
		<Reaction
			reactionEvent={reactionFirst}
			profileEvent={profiles.get(reactionFirst.pubkey)}
			isAuthor={reactionFirst.pubkey === pubkey}
			{callSendDeletion}
		/><button
			class="makibishi-expand"
			onclick={() => {
				isAllowedExpand = true;
			}}>{reactionValidEvents.length}</button
		><Reaction
			reactionEvent={reactionLast}
			profileEvent={profiles.get(reactionLast.pubkey)}
			isAuthor={reactionLast.pubkey === pubkey}
			{callSendDeletion}
		/>
	{/if}
</span>

<style>
	span.makibishi-container {
		font-size: 12px;
	}
	span.makibishi-container > button {
		border: none;
		outline: none;
		padding: 0;
		height: 16px;
		cursor: pointer;
		margin: 0;
	}
	span.makibishi-container > button:disabled {
		cursor: not-allowed;
	}
	span.makibishi-container > button.makibishi-send {
		background-color: rgba(127, 127, 127, 0.2);
		border-radius: 10%;
	}
	span.makibishi-container > button.makibishi-send > svg {
		width: 16px;
		height: 16px;
		fill: gray;
	}
	span.makibishi-container > button.makibishi-send:active > svg {
		fill: yellow;
	}
	span.makibishi-container > button.makibishi-expand {
		background-color: transparent;
	}
</style>
