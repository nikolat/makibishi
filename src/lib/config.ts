import { npubEncode } from 'nostr-tools/nip19';
export const reactionEventKind = 17;
export const expansionThreshold = 5;
export const urlToLinkEvent = 'https://njump.me';
export const defaultRelays = ['wss://relay.nostr.band/', 'wss://nos.lol/', 'wss://relay.damus.io/'];
export const profileRelays = ['wss://purplepag.es/', 'wss://directory.yabu.me/'];
export const defaultReaction = '⭐';
export const getRoboHashURL = (pubkey: string) => {
	return `https://robohash.org/${npubEncode(pubkey)}?set=set4`;
};
