# MAKIBISHI

Add a star to any website.

## Usage

Add this `script` tag in the `head` tag.

```html
<script src="https://cdn.jsdelivr.net/npm/@nikolat/makibishi@0.1.5"></script>
```

Place an HTML element with `makibishi` as the `class` attribute value anywhere you like, as shown below.

```html
<span class="makibishi"></span>
```

## Options

```html
<span
  class="makibishi"
  data-relays="wss://relay1.example.com/,wss://relay2.example.com/,wss://relay3.example.com/"
  data-url="https://example.com/"
  data-content="🤙"
  data-allow-anonymous-reaction="true"
></span>
```

<dl>
  <dt>data-relays</dt>
  <dd>Relays to be connected</dd>
  <dt>data-url</dt>
  <dd>URL of the website to react to</dd>
  <dt>data-content</dt>
  <dd>Emoji of reaction</dd>
  <dt>data-allow-anonymous-reaction</dt>
  <dd>Allow reactions with disposable secret keys in environments without the <a href="https://github.com/nostr-protocol/nips/blob/master/07.md">NIP-07</a> browser extension</dd>
</dl>

## License

This is free and unencumbered software released into the public domain.
By submitting patches to this project, you agree to dedicate any and all copyright interest in this software to the public domain.
