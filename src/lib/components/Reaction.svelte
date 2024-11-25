<script lang="ts">
  import type { NostrEvent } from 'nostr-tools/pure';
  import * as nip19 from 'nostr-tools/nip19';
  import { getRoboHashURL, urlToLinkEvent } from '../config';
  import { isCustomEmoji } from '../utils';
  let {
    reactionEvent,
    profileEvent,
    isAuthor,
    callSendDeletion,
  }: {
    reactionEvent: NostrEvent;
    profileEvent: NostrEvent | undefined;
    isAuthor: boolean;
    callSendDeletion: (id: string) => Promise<void>;
  } = $props();
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
        src={URL.canParse(obj.picture)
          ? obj.picture
          : getRoboHashURL(reactionEvent.pubkey)}
        alt="@{name}"
        title="@{name}"
      /></a
    >{#if isAuthor}<button
        class="makibishi-delete"
        title="delete the star"
        onclick={async () => {
          await callSendDeletion(reactionEvent.id);
        }}
        aria-label="delete the star"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M8,16 C3.581722,16 0,12.418278 0,8 C0,3.581722 3.581722,0 8,0 C12.418278,0 16,3.581722 16,8 C16,12.418278 12.418278,16 8,16 Z M8,14 C11.3137085,14 14,11.3137085 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 Z M8,9.41421356 L5.70710678,11.7071068 L4.29289322,10.2928932 L6.58578644,8 L4.29289322,5.70710678 L5.70710678,4.29289322 L8,6.58578644 L10.2928932,4.29289322 L11.7071068,5.70710678 L9.41421356,8 L11.7071068,10.2928932 L10.2928932,11.7071068 L8,9.41421356 Z"
          />
        </svg>
      </button>{/if}
  {/if}</span
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
  span.makibishi-reaction > button.makibishi-delete {
    border: none;
    outline: none;
    padding: 0;
    height: 16px;
    cursor: pointer;
    margin: 0;
    background-color: rgba(127, 127, 127, 0.2);
    border-radius: 10%;
    position: relative;
  }
  span.makibishi-reaction > button.makibishi-delete > svg {
    width: 16px;
    height: 16px;
    fill: gray;
    position: absolute;
    bottom: 16px;
    left: 0;
    visibility: hidden;
  }
  span.makibishi-reaction:hover > button.makibishi-delete > svg {
    visibility: visible;
  }
  span.makibishi-reaction > button.makibishi-delete:active > svg {
    fill: yellow;
  }
  span.makibishi-reaction > span.makibishi-content {
    display: inline-block;
    min-width: 16px;
    cursor: default;
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
