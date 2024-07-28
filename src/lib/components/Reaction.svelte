<script lang="ts">
  import type { NostrEvent } from 'nostr-tools/pure';
  import * as nip19 from 'nostr-tools/nip19';
  import { getRoboHashURL, urlToLinkEvent } from '../config';
  import { isCustomEmoji } from '../utils';
  export let reactionEvent: NostrEvent;
  export let profileEvent: NostrEvent | undefined;
</script>

<span
  class="makibishi-reaction"
  data-nevent={nip19.neventEncode({
    ...reactionEvent,
    author: reactionEvent.pubkey,
  })}
  data-npub={nip19.npubEncode(reactionEvent.pubkey)}
  data-created-at={reactionEvent.created_at}
  ><span class="makibishi-content"
    >{#if isCustomEmoji(reactionEvent)}<img
        src={reactionEvent.tags.find((tag) => tag[0] === 'emoji')?.at(2)}
        alt={reactionEvent.content}
        title={reactionEvent.content}
      />{:else}{reactionEvent.content
        .replace(/^\+$/, '❤')
        .replace(/^-$/, '💔') || '❤'}{/if}</span
  >{#if profileEvent !== undefined}
    {@const obj = JSON.parse(profileEvent.content)}
    {@const npub = nip19.npubEncode(reactionEvent.pubkey)}
    {@const name = obj.name ?? ''}<a
      class="makibishi-link"
      href="{urlToLinkEvent}/{npub}"
      target="_blank"
      rel="noopener noreferrer"
      ><img
        class="makibishi-profile-picture"
        src={obj.picture ?? getRoboHashURL(reactionEvent.pubkey)}
        alt="@{name}"
        title="@{name}"
      /></a
    >{/if}</span
>

<style>
  span.makibishi-reaction a {
    text-decoration: none;
  }
  span.makibishi-reaction {
    position: relative;
  }
  span.makibishi-reaction > a.makibishi-link {
    position: absolute;
    bottom: 16px;
    left: 0;
    visibility: hidden;
  }
  span.makibishi-reaction:hover > a.makibishi-link {
    visibility: visible;
  }
  span.makibishi-reaction > span.makibishi-content {
    display: inline-block;
    min-width: 16px;
  }
  span.makibishi-reaction > span.makibishi-content > img {
    height: 16px;
    vertical-align: bottom;
  }
  span.makibishi-reaction > a.makibishi-link > img {
    width: 16px;
    height: 16px;
    border-radius: 10%;
  }
</style>
