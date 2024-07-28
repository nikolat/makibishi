import {
  finalizeEvent,
  type EventTemplate,
  type NostrEvent,
} from 'nostr-tools/pure';
import type { SimplePool } from 'nostr-tools/pool';
import type { SubCloser } from 'nostr-tools/abstract-pool';
import type { Filter } from 'nostr-tools/filter';
import type { WindowNostr } from 'nostr-tools/nip07';
import { reactionEventKind } from './config';

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}

export const getGeneralEvents = (
  pool: SimplePool,
  relays: string[],
  filters: Filter[],
  callbackEvent: Function = () => {},
  autoClose: boolean = true,
): Promise<NostrEvent[]> => {
  return new Promise((resolve) => {
    const events: NostrEvent[] = [];
    const onevent = (ev: NostrEvent) => {
      events.push(ev);
      callbackEvent(ev);
    };
    const oneose = () => {
      if (autoClose) sub.close();
      resolve(events);
    };
    const sub: SubCloser = pool.subscribeMany(relays, filters, {
      onevent,
      oneose,
    });
  });
};

export const sendReaction = async (
  pool: SimplePool,
  relaysToWrite: string[],
  targetUrl: string,
  content: string,
  seckey?: Uint8Array,
  emojiUrl?: string,
): Promise<NostrEvent | null> => {
  const tags: string[][] = [['r', targetUrl]];
  if (emojiUrl) {
    tags.push(['emoji', content.replaceAll(':', ''), emojiUrl]);
  }
  const baseEvent: EventTemplate = {
    kind: reactionEventKind,
    tags,
    content,
    created_at: Math.floor(Date.now() / 1000),
  };
  let event: NostrEvent;
  if (window.nostr === undefined) {
    if (seckey === undefined) {
      console.warn('window.nostr is undefined');
      return null;
    }
    event = finalizeEvent(baseEvent, seckey);
  } else {
    event = await window.nostr.signEvent(baseEvent);
  }
  const pubs = pool.publish(relaysToWrite, event);
  await Promise.any(pubs);
  return event;
};

export const inputCount = (input: string): number => {
  // simple check, not perfect
  const segmeter = new Intl.Segmenter('ja-JP', { granularity: 'word' });
  return Array.from(segmeter.segment(input)).length;
};

export const isCustomEmoji = (event: NostrEvent): boolean => {
  const emojiTags = event.tags.filter((tag) => tag[0] === 'emoji');
  if (emojiTags.length !== 1) return false;
  const emojiTag = emojiTags[0];
  return (
    emojiTag.length >= 3 &&
    /^\w+$/.test(emojiTag[1]) &&
    URL.canParse(emojiTag[2]) &&
    event.content === `:${emojiTag[1]}:`
  );
};

export const isValidEmoji = (event: NostrEvent): boolean => {
  return isCustomEmoji(event) || inputCount(event.content) <= 1;
};
