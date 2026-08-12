# Core AI Living Map

A self-guided, server-rendered WordPress block for exploring the Core AI
ecosystem on a landscape iPad. It includes an attract screen, six project
details, four guided paths, an inactivity reset, accessible keyboard behavior,
Home Screen metadata, and offline caching.

## Requirements

- WordPress 6.8 or newer
- PHP 7.4 or newer
- HTTPS for offline caching and the screen wake lock
- Node.js and npm only when building from source

## Install

For a production install, upload `core-ai-map.zip` in **Plugins > Add New >
Upload Plugin**, then activate **Core AI Living Map**.

To create the installable zip from source:

```sh
npm ci
npm run build
npm run plugin-zip
```

The package is written to `core-ai-map.zip`.

## Create the kiosk page

1. Create a page and choose the theme's blank or full-width template.
2. Insert the **Core AI Living Map** block. The block is limited to one
   instance per post.
3. In the block sidebar, set the welcome copy, inactivity timeout, and offline
   preference.
4. Review the six project records and four scenario paths, then publish.
5. Open the published URL while logged out to verify the visitor experience.

The published block covers the viewport, so theme headers and footers remain
behind the kiosk interface.

## Edit the content

The block inspector contains:

- **Experience:** eyebrow, headline, introduction, attract prompt, inactivity
  timeout, and offline caching.
- **Projects:** name, short label, plain-language description, technical
  detail, status, and official URL for each project.
- **Scenario paths:** label, description, and comma-separated project IDs.

Scenario paths may use these fixed IDs:

`abilities`, `skills`, `client`, `plugin`, `mcp`, and `bench`.

The default project copy is stored when a block is inserted. Reinsert the block
if an existing page needs newly shipped defaults, or update its inspector
fields directly.

## Set up an iPad

1. Connect the iPad to power and lock rotation in landscape.
2. Open the HTTPS kiosk URL in Safari while logged out. Reopen it once so the
   page and current assets are available offline.
3. Use **Share > Add to Home Screen**, then launch the new **Core AI Map** icon
   for the full-screen experience.
4. In **Settings > Display & Brightness**, choose an Auto-Lock setting suitable
   for the booth. The page also requests a screen wake lock when supported.
5. Optionally enable Guided Access in **Settings > Accessibility > Guided
   Access**, then start it from the Home Screen app to keep visitors on the
   display.
6. Test the inactivity reset and, if offline mode is enabled, test once in
   Airplane Mode before the event.

Official project links intentionally stay inside the kiosk and display their
URL on screen instead of navigating away.

## Offline behavior

Offline mode caches the published page, block assets, WordPress Interactivity
runtime dependencies, and app icons. External project sites are not cached.
Revisit the kiosk URL while online after publishing content or plugin updates.
Turning offline mode off unregisters this plugin's service worker and clears
its cache on the next secure page load.

## Development

```sh
npm run start       # watch source files
npm run build       # create production assets
npm run lint:js
npm run lint:css
npm run test:unit -- --runInBand
npm run plugin-zip
```

Check PHP syntax with:

```sh
find . -path ./node_modules -prune -o -name '*.php' -exec php -l {} \;
```

Generated production files in `build/` are committed so the repository can be
installed as a WordPress plugin without a local Node.js build.

## Troubleshooting

- **Offline mode or wake lock does not start:** confirm the page uses HTTPS.
- **Old content appears offline:** reconnect, reload the kiosk URL, and reopen
  the Home Screen app.
- **Theme chrome is visible:** use the block's published page rather than the
  editor preview, and select a blank or full-width page template.
- **A scenario does not highlight:** verify that its project IDs match the six
  supported IDs exactly.