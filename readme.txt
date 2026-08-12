=== Core AI Living Map ===
Contributors: wordpressdotorg
Tags: core-ai, kiosk, interactive
Requires at least: 6.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An interactive boundary map of the WordPress Core AI projects, designed for a landscape iPad kiosk.

== Description ==

Core AI Living Map adds a dynamic block that draws a role-based boundary map: outside assistants,
WordPress itself, outside AI providers, and evaluation below the runtime. It has an attract loop,
four stories that recompose the canvas, detail panels for every block, and an automatic
inactivity reset.

Features include:

* Server-rendered markup enhanced with the WordPress Interactivity API.
* Six blocks inside WordPress and four off-canvas actors, on a fixed dashed boundary.
* Four stories that slide their members into a numbered workflow, park everything else on a
  shelf, and light only the boundary rules the story actually crosses.
* Role shapes that appear on activation, plus a live MCP-call-to-ability token motion and an
  AI Plugin suggestion cycle.
* Large touch targets, keyboard focus management, live announcements, and reduced-motion support.
* Landscape Home Screen metadata, a wake lock request, and optional offline caching.

== Installation ==

1. Upload `core-ai-map.zip` in Plugins > Add New > Upload Plugin, or copy the plugin folder to `/wp-content/plugins/`.
2. Activate Core AI Living Map.
3. Add the Core AI Boundary Map block to a page.
4. Configure the attract copy, behavior, blocks, actors, stories, and detail panels in the block sidebar.
5. Publish the page and follow the iPad setup in README.md.

Offline support and the screen wake lock require HTTPS.

== Frequently Asked Questions ==

= Which IDs does the map geometry know about? =

Blocks: `plugin`, `client`, `connectors`, `abilities`, `mcp`, `bench`. Actors: `assistant`, `skills`, `agent`, `provider`. Stories: `uses-ai`, `uses-wp`, `learns`, `tests`.

= Can I change which blocks take part in a story? =

No. Story membership and placement are fixed by the map geometry, because each position is hand-placed against the boundary. Only the wording is editable.

= Why are there no links on the detail panels? =

The block is designed as an unattended kiosk. Each panel prints its URL beside a QR code so a visitor can keep exploring on their own device without taking the iPad away from the experience.

= How do I get real QR codes? =

Upload a QR image for each panel's URL and set it as that panel's QR code image URL. Left empty, the panel shows the hatched placeholder from the design.

= What is available offline? =

The published kiosk page, block assets, Interactivity API dependencies, and app icons are cached. External project sites are not cached.

== Changelog ==

= 0.2.0 =

* Replaced the orbit-and-hub map with the role-based boundary map.
* Added Connectors as a block and moved Agent Skills to an off-canvas actor.
* Stories now recompose the canvas instead of only highlighting a path, and blocks may cross the boundary.
* Added role shapes on activation, the MCP-call-to-ability token motion, and the AI Plugin suggestion cycle.
* Raised the default inactivity reset to 90 seconds.
* Replaced outbound panel links with on-screen URLs and QR codes.

= 0.1.0 =

* Initial Core AI Living Map block.
