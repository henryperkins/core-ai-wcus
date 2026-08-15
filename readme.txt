=== Core AI Living Block Map ===
Contributors: wordpressdotorg
Tags: core-ai, kiosk, interactive
Requires at least: 7.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 3.2.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

One dynamic, server-rendered WordPress block that explains the building blocks connecting WordPress and AI on a landscape kiosk.

== Description ==

Core AI Living Block Map 3.2.3 provides one full-width `core-ai/core-ai-map` block. Server markup is enhanced with the WordPress Interactivity API.

The attract workflow uses assemble, path, signal, caption, and release phases. After engagement, motion settles; reduced-motion users retain the same story, path, state, and caption information.

Features include:

* Four stories: WordPress uses AI; AI uses WordPress; Agent Skills -> Coding agent -> A WordPress task; and WordPress tests the result with WP-Bench.
* The WordPress-uses-AI runtime path runs through the AI Client and a provider plugin to an external AI service; Connectors is shown beside it for discovery, configuration, and credentials.
* The Skills-to-agent-to-task story happens outside the site: nothing inside WordPress runs.
* Abilities inspector tabs and a WP-Bench five-stage run loop from task and sandbox through checks to evidence.
* MCP Adapter labelled "WordPress plugin · not in Core".
* Focus management, inert background content while inspecting, Escape to close, and focus restoration.
* Seven local canonical QR SVGs with fixed, selectable destinations; no arbitrary editable QR-image or URL fields.
* Offline support limited to a non-root kiosk permalink. Offline mode is disabled on the home/root URL so its worker cannot control unrelated site pages.
* Existing serialized card, actor, story, and panel arrays merge current canonical defaults by id, while user copy fields remain editable.

The release is reviewed 14 Aug 2026. The authored target is 1366 x 1024 landscape. The stage is scaled to fit the viewport, so authored sizes shrink with it. At 1024 x 768 the factor is 0.7496: story rail buttons authored at 68 logical pixels render at 51, header and panel controls authored at 60 render at 45, nested controls such as Apply render at 33, and the About footnote renders at 25. Every control meets WCAG 2.2 SC 2.5.8 by size at both sizes. Only the Apply control and the About footnote fall below SC 2.5.5 at 1024 x 768; everything else clears it, the 60-pixel class by less than a pixel. Treat 1024 x 768 as a compatibility view, not a fully supported touch layout; physical iPad acceptance remains a separate sign-off.

== Installation ==

1. Upload `core-ai-map.zip` in Plugins > Add New > Upload Plugin.
2. Activate Core AI Living Block Map.
3. Create a fresh page and choose a blank or full-width theme template.
4. Insert the Core AI Living Block Map block, set it to full width, and publish a non-home/root permalink.
5. Verify the published browser experience before any kiosk setup. Agent-run checks use the globally configured Browser Run MCP service against the public HTTPS URL; physical kiosk checks remain a human on-device sign-off.

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

No. Unit tests, lint, and builds prove only local source/package state. Agent-run browser verification uses the globally configured Browser Run MCP service against a publicly reachable HTTPS preview or deployment, never localhost or a locally launched browser. Safari, Add to Home Screen, Guided Access, worker behavior, and physical iPad touch and landscape acceptance require separate human on-device sign-off. This plugin does not claim deployment.

For every Playground booth deployment, bump all release metadata, use a fingerprinted plugin ZIP URL, compare the deployed ZIP's byte count and SHA-256 with the build manifest on both public hostnames, and clear Cache Storage, OPFS data, and service workers on every booth browser. Then perform foreground cold and warm boots, verify the visible-only 60-second reset and the operating system's reduced-motion mode, disable sleep, prefer wired networking, and prewarm the kiosk. Do not enable a persisted Playground `site-slug`; if the upstream crash dialog recurs after one foreground reload, clear site data and cold-boot again.

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

= 3.2.3 =

* Hardened accessibility release behavior so server-rendered markup exposes exactly one named level-one heading before hydration, including when the editable title is cleared.
* Scoped the darker strong-line token to meaning-carrying boundaries, restored ambient edges to the dormant line, and gave configuration strokes a dedicated normal/high-contrast token.
* Expanded the 1024 x 768 compatibility gate across the 68px rail, 60px panel/tab/dialog controls, 44px Apply control, and 34px About footnote.

= 3.2.2 =

* Moved the Playground kiosk from WordPress 7.0 to the `beta` channel, so the exhibit runs a WordPress 7.1 release candidate rather than describing 7.1 as unshipped.
* Corrected AI Client and Connectors copy against a real admin screen: the JavaScript prompt API is administrator-gated rather than absent, requests carry text, image, speech, or video, and Connectors resolves keys from an environment variable, then a wp-config constant, then the database.
* Added the ability-calling edge that joins the two halves of the map, where a request made inside WordPress can name abilities the model may call.
* Framed Connectors as general connection infrastructure whose first users are AI providers, not its only intended ones.

= 3.2.1 =

* Added a provider-neutral Core AI orientation, visible choose-follow-tap instructions, and a diagram key to the welcome screen.
* Added a persistent situation and phase-aware conclusion to every flow, plus predictive outcome subtitles in the flow navigation.
* Reframed component panels around role, importance, definition, implementation detail, and canonical project links while preserving the selected flow and focus.
* Removed a volatile WP-Bench test count, aligned MCP protocol wording with current project documentation, and reviewed factual copy on 14 August 2026.

= 3.2.0 =

* Made the exhibit flow-first: the welcome control opens "WordPress uses AI" directly, and the neutral canvas became the secondary "Browse all components" mode.
* Gave every highlighted component the same interaction. The five outside actors and the transient provider-plugin layer now open contextual panels, so no numbered step is a dead tap.
* Added one instruction per interface state, a "What this flow shows" takeaway beside each diagram, and per-flow role sections that open each panel with the flow it was reached from.
* Kept the selected flow and restored focus to the opening card when a panel closes, and made non-participating cards inert rather than merely dimmed.

= 3.1.3 =

* Cleared neutral-map card collisions and provider-card copy overflow.
* Replaced the startup promise with honest cold-start loader copy and exhibit-owned social metadata.
* Removed SVG Interactivity directives that could emit renderer notices.
* Added plugin ZIP provenance and verification-only CI coverage for release artifacts.

= 3.1.2 =

* Fingerprinted the Playground plugin ZIP and added byte-count and SHA-256 identity to the deployment manifest.
* Replaced the generic Playground loader text with an explanation of the browser-local WordPress 7.0 boot.
* Kept all five outside actors visible in the neutral map and removed the reviewed-date and About-control collisions.
* Promoted booth-browser storage clearing, physical timing, reset, reduced-motion, power/network, and recovery checks into standing release gates.

= 3.1.1 =

* Renamed the experience to Core AI Living Block Map and added the WordPress task actor.
* Added phased attract previews, settled post-engagement motion, accessibility hardening, Abilities tabs, and the WP-Bench run loop.
* Replaced placeholder and arbitrary QR documentation with seven deterministic local canonical QR assets.
* Restricted the offline worker to non-root kiosk permalinks and disabled offline mode on the home/root URL.
* Corrected the provider-plugin request path, scheduled WordPress 7.1 wording, and muted-text contrast for the pre-booth build.

= 0.2.0 =

* Replaced the orbit-and-hub map with the role-based boundary map.

= 0.1.0 =

* Initial Core AI Living Map block.
