<script lang="ts">
  import type { SimplePool } from 'nostr-tools/pool';
  import type { NostrEvent } from 'nostr-tools/pure';
  import {
    insertEventIntoAscendingList,
    normalizeURL,
  } from 'nostr-tools/utils';
  import {
    getGeneralEvents,
    inputCount,
    isValidEmoji,
    sendReaction,
  } from '../utils';
  import {
    defaultReaction,
    defaultRelays,
    expansionThreshold,
    profileRelays,
    reactionEventKind,
  } from '../config';
  import { onMount } from 'svelte';
  import Reaction from './Reaction.svelte';

  let reactionEvents: NostrEvent[] = [];
  let profiles: Map<string, NostrEvent> = new Map<string, NostrEvent>();
  let isAllowedExpand: boolean;
  let relays: string[];
  let targetUrl: string;
  let reactionContent: string;
  let allowAnonymousReaction: boolean;

  export let element: HTMLElement;
  export let pool: SimplePool;
  export let anonymousSeckey: Uint8Array;

  const getReactions = async (url: string): Promise<void> => {
    if (!URL.canParse(url)) return;
    const reactionEventsFetched = await getGeneralEvents(
      pool,
      relays,
      [{ kinds: [reactionEventKind], '#r': [url] }],
      (event: NostrEvent) => {
        if (!reactionEvents.some((ev) => ev.id === event.id)) {
          reactionEvents = insertEventIntoAscendingList(reactionEvents, event);
        }
      },
      false,
    );
  };

  const getProfiles = async (pubkeys: string[]): Promise<void> => {
    const profileEventsFetched = await getGeneralEvents(
      pool,
      profileRelays,
      [{ kinds: [0], authors: pubkeys }],
      (event: NostrEvent) => {
        const prof = profiles.get(event.pubkey);
        if (prof === undefined || prof.created_at < event.created_at) {
          try {
            const obj = JSON.parse(event.content);
          } catch (error) {
            console.warn(error);
            return;
          }
          profiles.set(event.pubkey, event);
          profiles = profiles;
        }
      },
      true,
    );
  };

  const callSendReaction = async (): Promise<void> => {
    const event = await sendReaction(
      pool,
      relays,
      targetUrl,
      reactionContent,
      allowAnonymousReaction ? anonymousSeckey : undefined,
    );
    if (
      event !== null &&
      window.nostr !== undefined &&
      !profiles.has(event.pubkey)
    ) {
      await getProfiles([event.pubkey]);
    }
  };

  onMount(async () => {
    const makibishiRelays = element.dataset.relays;
    const makibishiUrl = element.dataset.url;
    const makibishiReaction = element.dataset.content;
    const makibishiAllowAnonymousReaction =
      element.dataset.allowAnonymousReaction;
    if (makibishiRelays !== undefined) {
      relays = Array.from(
        new Set<string>(
          makibishiRelays
            .split(',')
            .filter((r) => URL.canParse(r))
            .map((r) => normalizeURL(r)),
        ),
      );
    } else {
      relays = defaultRelays;
    }
    if (makibishiUrl !== undefined && URL.canParse(makibishiUrl)) {
      targetUrl = new URL(makibishiUrl).href;
    } else {
      targetUrl = window.location.href;
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
    console.log('MAKIBISHI Settings:', {
      relays,
      targetUrl,
      reactionContent,
      allowAnonymousReaction,
    });
    isAllowedExpand = false;
    await getReactions(targetUrl);
    const pubkeys: string[] = Array.from(
      new Set<string>(reactionValidEvents.map((ev) => ev.pubkey)),
    );
    await getProfiles(pubkeys);
  });

  $: reactionValidEvents = reactionEvents.filter((ev) => isValidEmoji(ev));
  $: reactionFirst = reactionValidEvents.at(0)!;
  $: reactionLast = reactionValidEvents.at(-1)!;
</script>

<span class="makibishi-container">
  <button class="makibishi-send" title="add a star" on:click={callSendReaction}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
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
      />{/each}
  {:else}
    <Reaction
      reactionEvent={reactionFirst}
      profileEvent={profiles.get(reactionFirst.pubkey)}
    /><button
      class="makibishi-expand"
      on:click={() => {
        isAllowedExpand = true;
      }}>{reactionValidEvents.length}</button
    ><Reaction
      reactionEvent={reactionLast}
      profileEvent={profiles.get(reactionLast.pubkey)}
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
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin: 0;
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
