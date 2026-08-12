# Core AI Living Map

A self-guided, server-rendered WordPress block for exploring the Core AI
ecosystem on a landscape iPad.

The block draws a **role-based boundary map**: outside assistants on the left,
WordPress in the middle, outside AI providers on the right, and evaluation below
the runtime. Picking one of four stories recomposes the canvas — its members
slide into a numbered left-to-right workflow, everything else parks on a shelf,
and the dashed boundary rules the story actually crosses light up. Blocks grow
their role shape (ports, sockets, a router, a two-sided bridge, meters) when
they join a story or open, and any block opens a detail panel.

The map is authored at exactly **1366x1024** — the iPad Pro 13" kiosk viewport —
and the whole stage is scaled to fit whatever viewport it lands in, so the
geometry never has to be responsive.

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
2. Insert the **Core AI Boundary Map** block. The block is limited to one
   instance per post.
3. In the block sidebar, set the attract copy, inactivity timeout, and offline
   preference.
4. Review the six blocks, four actors, four stories, and seven detail panels,
   then publish.
5. Open the published URL while logged out to verify the visitor experience.

The published block covers the viewport, so theme headers and footers remain
behind the kiosk interface.

## Edit the content

The block inspector contains:

- **Attract screen:** eyebrow, headline, introduction, call to action, and the
  hint shown in the top bar once the blocks are on the canvas.
- **Behavior:** whether stories recompose the map, whether blocks grow role
  shapes, the inactivity timeout, and offline caching.
- **Blocks on the canvas:** name, tagline, and status badge for each of the six
  blocks inside WordPress.
- **Off-canvas actors:** name, tagline, and eyebrow for the AI assistant, Agent
  Skills, the coding agent, and the AI provider.
- **Stories:** title and caption for each of the four stories.
- **Detail panels:** opening paragraph, link URL, link label, and QR code image
  for each of the seven panels.

Placement is not editable. Which blocks take part in a story, where each one
slides to, which shelf slot a parked block lands in, and which boundary rules
light up are all fixed by the map geometry in `render.php` — that table is the
single source of truth, and `view.js` derives every transform from it.

These fixed IDs are the ones the geometry knows about:

- Blocks: `plugin`, `client`, `connectors`, `abilities`, `mcp`, `bench`
- Actors: `assistant`, `skills`, `agent`, `provider`
- Stories: `uses-ai`, `uses-wp`, `learns`, `tests`

The default copy is stored when a block is inserted. Reinsert the block if an
existing page needs newly shipped defaults, or update its inspector fields
directly.

### QR codes

Each detail panel ends with a QR block. Leave **QR code image URL** empty and
the panel shows the hatched placeholder from the design with a "QR code goes
here" caption; set it to an uploaded QR image for that panel's URL and the
image is used instead. The plugin does not generate QR codes itself.

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

Detail panels never navigate away: each one prints its URL on screen next to a
QR code so a visitor can keep exploring on their own device.

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
- **A story is missing from the rail:** a story is only rendered when every
  block and actor it needs is present, and IDs are lowercased, so they must
  match the fixed IDs above exactly.
- **The map does not fill the screen:** the stage is scaled by JavaScript on
  load and resize; check the browser console for a script-module error.