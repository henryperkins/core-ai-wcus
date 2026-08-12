=== Core AI Living Map ===
Contributors: wordpressdotorg
Tags: core-ai, kiosk, interactive
Requires at least: 6.8
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An interactive map of the WordPress Core AI projects, designed for a landscape iPad kiosk.

== Description ==

Core AI Living Map adds a dynamic block with an attract loop, six explorable project nodes,
guided scenario paths, project detail views, and an automatic inactivity reset.

Features include:

* Server-rendered markup enhanced with the WordPress Interactivity API.
* Plain-language and technical views for six Core AI projects.
* Four editable scenario paths that highlight how projects work together.
* Large touch targets, keyboard focus management, live announcements, and reduced-motion support.
* Landscape Home Screen metadata, a wake lock request, and optional offline caching.

== Installation ==

1. Upload `core-ai-map.zip` in Plugins > Add New > Upload Plugin, or copy the plugin folder to `/wp-content/plugins/`.
2. Activate Core AI Living Map.
3. Add the Core AI Living Map block to a page.
4. Configure the experience, projects, and scenarios in the block sidebar.
5. Publish the page and follow the iPad setup in README.md.

Offline support and the screen wake lock require HTTPS.

== Frequently Asked Questions ==

= Which project IDs can scenario paths use? =

Use `abilities`, `skills`, `client`, `plugin`, `mcp`, and `bench`.

= Why do official project links stay on the map? =

The block is designed as an unattended kiosk. Tapping a link displays its URL without taking the iPad away from the experience.

= What is available offline? =

The published kiosk page, block assets, Interactivity API dependencies, and app icons are cached. External project sites are not cached.

== Changelog ==

= 0.1.0 =

* Initial Core AI Living Map block.
