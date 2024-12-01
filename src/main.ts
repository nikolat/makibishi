import { mount } from 'svelte';
import { SimplePool } from 'nostr-tools/pool';
import { generateSecretKey } from 'nostr-tools/pure';
import App from './lib/components/App.svelte';

const pool = new SimplePool();
const anonymousSeckey = generateSecretKey();

const initTarget = (element: HTMLElement): void => {
	if (!element.hasChildNodes()) {
		const _app = mount(App, {
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
	interface Window {
		makibishi: {
			initTarget: (element: HTMLElement) => void;
			initTargets: (selector?: string) => void;
		};
	}
}

if (typeof window === 'object') {
	window.makibishi = { initTarget, initTargets };
	document.addEventListener('DOMContentLoaded', () => {
		initTargets();
	});
}
