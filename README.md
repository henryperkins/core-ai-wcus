# Core AI Living Block Map

Version and design: **3.1.1**. Core AI Living Block Map is one dynamic,
server-rendered `core-ai/core-ai-map` block for explaining how WordPress and AI
building blocks fit together on a kiosk. Its server markup is enhanced by the
WordPress Interactivity API. The repository also contains a reproducible,
self-hosted WordPress Playground artifact for static-hosted demonstrations.

## Install and create the kiosk page

Build an uploadable ZIP, then upload it from **Plugins > Add New > Upload
Plugin** and activate it:

```sh
npm ci
npm run build
npm run plugin-zip
```

On a fresh page, select the theme's blank or full-width template, insert the
single **Core AI Living Block Map** block, set it to full width, and publish a
non-home/root permalink. The authored target is a 1366 x 1024 landscape kiosk
stage. It is also compatible with 1024 x 768, with authored controls at least
60 logical pixels in the header and story rail. Nested controls such as Apply
remain 44 logical pixels, so 1024 x 768 is a compatibility view rather than a
fully supported touch layout. Physical iPad touch acceptance is still a
separate required sign-off.

The reviewed date shown by this release is **Reviewed 12 Aug 2026**.

## AI assistance and accountability

- AI assistance: **Yes**
- Tool: **OpenAI Codex**
- Used for: implementation, tests, and deployment preparation.

Final work was human-reviewed and tested; the human contributor remains
responsible for it. Use the same disclosure in the description of any future
pull request for this work.

## Cloudflare Pages Playground exhibit

`playground/blueprint.json` packages this same plugin into a browser-executed
WordPress Playground kiosk. It pins WordPress 7.0 and PHP 8.3, creates the
`/living-block-map/` page, disables Playground network access, and keeps each
visitor's WordPress state in that visitor's browser. The page disables this
plugin's own offline worker because Playground already owns the virtual site's
service worker and browser-local persistence.

Build the static Pages artifact from an official WordPress Playground static
release directory:

```powershell
git fetch origin
git switch main
git pull --ff-only
if (git status --porcelain) { throw 'Production checkout is not clean.' }
npm ci
npm run plugin-zip
$env:PLAYGROUND_SOURCE_DIR = 'C:\path\to\wasm-wordpress-net'
npm run build:playground
$commit = git rev-parse HEAD
npx wrangler pages deploy dist-playground `
    --project-name=core-ai-living-block-map `
    --branch=main `
    --commit-hash=$commit `
    --commit-dirty=false
```

The build copies only the assets needed by the pinned runtime plus WordPress
7.0's static fallback tree. It validates Cloudflare Pages Free's 20,000-file
and 25 MiB-per-asset limits, removes upstream Google Fonts and analytics, and
uses a local Blueprint and plugin ZIP. It also emits a Pages rewrite that keeps
the Playground runtime's literal `/remote.html` endpoint from being redirected
to Cloudflare's extensionless route. `dist-playground/` is generated and not
committed. Cloudflare Pages provides the required HTTPS origin; a normal HTTP
origin cannot run Playground's service worker.

Production is deployed manually from `dist-playground/`. Automatic Git
production and preview deployments are intentionally disabled for the Pages
project because the repository root is not a deployable Playground artifact.
The `wcus.hperkins.com` CNAME points to the Pages hostname in DNS-only mode;
enabling the orange-cloud proxy prevents Pages from routing this hostname.
Because the pre-fix `/remote.html` response was a permanent redirect, clear
stored site data once on any booth browser that loaded the broken deployment
before using that browser for acceptance or exhibition.
After deployment, verify the root, `remote.html`, `sw.js`, local Blueprint, and
plugin ZIP on both public hostnames:

```powershell
$hosts = @(
    'https://core-ai-living-block-map.pages.dev',
    'https://wcus.hperkins.com'
)
$paths = @(
    '/',
    '/sw.js',
    '/kiosk-blueprint/blueprint.json',
    '/kiosk-blueprint/core-ai-map.zip'
)
foreach ($hostName in $hosts) {
    $probe = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $remote = Invoke-WebRequest `
        -Uri "$hostName/remote.html?probe=$probe" `
        -UseBasicParsing `
        -MaximumRedirection 0 `
        -SkipHttpErrorCheck
    if ($remote.StatusCode -ne 200) {
        throw "Expected 200 for $hostName/remote.html; got $($remote.StatusCode)."
    }
    if ($null -ne $remote.Headers['Location']) {
        throw "Expected no redirect for $hostName/remote.html; got $($remote.Headers['Location'])."
    }
    if (-not $remote.Headers['Content-Type'].StartsWith('text/html')) {
        throw "Expected text/html for $hostName/remote.html; got $($remote.Headers['Content-Type'])."
    }
    "{0} {1} {2}" -f $remote.StatusCode, $remote.Headers['Content-Type'], "$hostName/remote.html"

    foreach ($path in $paths) {
        $response = Invoke-WebRequest -Uri "$hostName$path" -UseBasicParsing
        $contentType = $response.Headers['Content-Type']
        "{0} {1} {2}" -f $response.StatusCode, $contentType, "$hostName$path"
    }
}
```

## What visitors see

The attract loop introduces four stories, then runs the preview through
**assemble, path, signal, caption, and release**. After a visitor engages, the
motion settles rather than looping continuously. With reduced motion enabled,
the same story, path, state, and caption information remains available without
the animation.

The stories are:

1. WordPress uses AI.
2. AI uses WordPress.
3. Agent Skills -> Coding agent -> A WordPress task. This work is outside the
   site: nothing inside WordPress runs in this story.
4. WordPress tests the result with WP-Bench.

In the first story, the runtime request travels from the AI Plugin through the
AI Client and a provider plugin to an external AI service. Connectors appears
beside that path as the site-owner surface for provider discovery,
configuration, and credentials; it is not presented as the request executor.

The **Abilities API** inspector includes its dedicated tabs. **WP-Bench** has a
five-stage run loop that follows the work from task and sandbox through checks
to evidence; it is a test bench, not a live request path. The MCP Adapter is
explicitly labelled **WordPress plugin · not in Core**.

Cards and inspectors support visible focus, inert background content while a
detail panel is open, Escape to close, and focus restoration to the originating
card.

## Canonical QR destinations

Seven committed SVG QR assets live under `assets/qr/`; they are generated
locally and their destinations are fixed, selectable text in the inspector.
There are no arbitrary editable QR-image or URL fields.

- Abilities: <https://developer.wordpress.org/apis/abilities-api/>
- AI Client: <https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/>
- Connectors: <https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/>
- AI Plugin: <https://wordpress.org/plugins/ai/>
- MCP Adapter: <https://github.com/WordPress/mcp-adapter>
- WP-Bench: <https://github.com/WordPress/wp-bench>
- Agent Skills: <https://github.com/WordPress/agent-skills>

For existing serialized blocks, canonical cards, actors, stories, and panels
are merged with the current defaults by `id`, so this release can supply its
new canonical structure. User-authored copy fields remain editable rather than
being overwritten.

## Offline, assets, and packaging

Offline support is scoped only to a non-root kiosk permalink. It is disabled
when the map is placed on the home/root URL, so the worker cannot take control
of unrelated site pages. The published kiosk must also use HTTPS (localhost is
the browser's development exception), because service workers do not register
in an insecure HTTP context. It caches kiosk assets locally; it does not cache
the external destinations above.

The package contains the PHP bootstrap, committed `build/` block assets,
`assets/` (icons, worker, local fonts, and QR SVGs), and plugin readmes. It does
not require Node.js on the installed site. EB Garamond, IBM Plex Mono, and
Inter are bundled as local WOFF2 files; their license texts are in
`assets/fonts/`. Plugin code is GPL-2.0-or-later.

## Development and verification

The unit suite requires a PHP 8.3 CLI executable named `php` on `PATH`;
several contract tests execute the server renderer directly.

```sh
npm ci
npm run generate:qr
npm run test:unit -- --runInBand
npm run test:playground
npm run lint:js
npm run lint:css
npm run build
npm run plugin-zip
```

`npm run generate:qr` deterministically refreshes the seven committed local
SVGs. `build/` remains committed so the ZIP is installable without a build step.

Local unit, lint, and build results prove local source and package state only.
Browser verification is a separate gate. Safari, Add to Home Screen, Guided
Access, service-worker behavior, and physical iPad touch/landscape acceptance
require their own on-device sign-off. A current Cloudflare Pages deployment
still requires its own origin-level verification.

Before deactivating or deleting the plugin, turn off Offline mode in the block
and load the published kiosk page once while online. That lets the active page
unregister its scoped worker and clear its cache before the worker endpoint is
removed.
