=== Core AI Living Block Map ===
Contributors: wordpressdotorg
Tags: core-ai, kiosk, interactive
Requires at least: 7.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 3.1.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

One dynamic, server-rendered WordPress block that explains the building blocks connecting WordPress and AI on a landscape kiosk.

== Description ==

Core AI Living Block Map 3.1.1 provides one full-width `core-ai/core-ai-map` block. Server markup is enhanced with the WordPress Interactivity API.

The attract workflow uses assemble, path, signal, caption, and release phases. After engagement, motion settles; reduced-motion users retain the same story, path, state, and caption information.

Features include:

* Four stories: WordPress uses AI; AI uses WordPress; Agent Skills -> Coding agent -> A WordPress task; and WordPress tests the result with WP-Bench.
* The Skills-to-agent-to-task story happens outside the site: nothing inside WordPress runs.
* Abilities inspector tabs and a WP-Bench five-stage run loop from task and sandbox through checks to evidence.
* MCP Adapter labelled "WordPress plugin · not in Core".
* Focus management, inert background content while inspecting, Escape to close, and focus restoration.
* Seven local canonical QR SVGs with fixed, selectable destinations; no arbitrary editable QR-image or URL fields.
* Offline support limited to a non-root kiosk permalink. Offline mode is disabled on the home/root URL so its worker cannot control unrelated site pages.
* Existing serialized card, actor, story, and panel arrays merge current canonical defaults by id, while user copy fields remain editable.

The release is reviewed 12 Aug 2026. The authored target is 1366 x 1024 landscape. At 1024 x 768, the header and story controls remain at least 60 logical pixels, while nested controls such as Apply remain 44 logical pixels. Treat 1024 x 768 as a compatibility view, not a fully supported touch layout; physical iPad acceptance remains a separate sign-off.

== Installation ==

1. Upload `core-ai-map.zip` in Plugins > Add New > Upload Plugin.
2. Activate Core AI Living Block Map.
3. Create a fresh page and choose a blank or full-width theme template.
4. Insert the Core AI Living Block Map block, set it to full width, and publish a non-home/root permalink.
5. Verify the published browser experience before any kiosk setup.

The plugin ZIP contains the PHP bootstrap, committed build assets, local assets (icons, service worker, fonts, and QR SVGs), and readmes. Node.js is needed only to build from source. Local EB Garamond, IBM Plex Mono, and Inter WOFF2 files include their license texts in `assets/fonts/`.

== Frequently Asked Questions ==

= What are the QR destinations? =

Abilities: https://developer.wordpress.org/apis/abilities-api/

AI Client: https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/

Connectors: https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/

AI Plugin: https://wordpress.org/plugins/ai/

MCP Adapter: https://github.com/WordPress/mcp-adapter

WP-Bench: https://github.com/WordPress/wp-bench

Agent Skills: https://github.com/WordPress/agent-skills

= Can I replace a QR code or its URL in the block editor? =

No. The seven committed local QR assets and their canonical destinations are fixed. Visitor-facing copy remains editable where the block allows it.

= What does offline mode cover? =

It caches the non-root kiosk permalink and its local assets. It does not cache external project sites, and it is disabled on the site home/root URL. The published kiosk must use HTTPS because service workers do not register in an insecure HTTP context; localhost is the browser's development exception.

Before deactivating or deleting the plugin, turn off Offline mode in the block and load the published kiosk page once while online. This unregisters its scoped worker and clears its cache while the plugin endpoint is still available.

= Does local verification prove the iPad kiosk is ready? =

No. Unit tests, lint, and builds prove only local source/package state. Browser verification is separate. Safari, Add to Home Screen, Guided Access, worker behavior, and physical iPad touch and landscape acceptance require separate on-device sign-off. This plugin does not claim deployment.

== Development ==

Run these commands when building from source:

`npm ci`

`npm run generate:qr`

`npm run test:unit -- --runInBand`

`npm run lint:js`

`npm run lint:css`

`npm run build`

`npm run plugin-zip`

== Changelog ==

= 3.1.1 =

* Renamed the experience to Core AI Living Block Map and added the WordPress task actor.
* Added phased attract previews, settled post-engagement motion, accessibility hardening, Abilities tabs, and the WP-Bench run loop.
* Replaced placeholder and arbitrary QR documentation with seven deterministic local canonical QR assets.
* Restricted the offline worker to non-root kiosk permalinks and disabled offline mode on the home/root URL.

= 0.2.0 =

* Replaced the orbit-and-hub map with the role-based boundary map.

= 0.1.0 =

* Initial Core AI Living Map block.
