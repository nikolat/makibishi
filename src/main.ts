import { mount } from 'svelte';
import { SimplePool } from 'nostr-tools/pool';
import { generateSecretKey } from 'nostr-tools/pure';
import App from './lib/components/App.svelte';

const pool = new SimplePool();
const anonymousSeckey = generateSecretKey();

const initTarget = (element: HTMLElement): void => {
	if (!element.hasChildNodes()) {
		const app = mount(App, {
			target: element,
			props: {
				element,
				pool,
				anonymousSeckey
			}
		});
	}
};

const initTargets = (selector?: string): void => {
	document.querySelectorAll<HTMLElement>(selector || '.makibishi').forEach((element) => {
		initTarget(element);
	});
};

declare global {
	var makibishi: object;
}

if (typeof window === 'object') {
	window.makibishi = { initTarget, initTargets };
	document.addEventListener('DOMContentLoaded', () => {
		initTargets();
	});
}
