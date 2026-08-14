# Core AI Living Block Map

Version and design: **3.1.3**. Core AI Living Block Map is one dynamic,
server-rendered `core-ai/core-ai-map` block for explaining how WordPress and AI
building blocks fit together on a kiosk. Its server markup is enhanced by the
WordPress Interactivity API. The repository also contains a reproducible,
self-hosted WordPress Playground artifact for static-hosted demonstrations.

## 3.1.3 release notes

This release clears the neutral-map card collision and provider-copy overflow,
uses an honest cold-start loader message, and removes SVG Interactivity
directives that could emit renderer notices. Playground artifacts now carry
source and ZIP provenance for verification-only CI, and the static shell has
exhibit-owned social metadata.

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

The reviewed date carried by this release is **Reviewed 12 Aug 2026**. It is
shown inside the **About this exhibit** panel, reached from the footnote under
the story rail, rather than in the kiosk header.

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
uses a local Blueprint and plugin ZIP. `npm run plugin-zip` creates the local
`core-ai-map.zip`; the Pages build copies those exact bytes to the release URL
`/kiosk-blueprint/core-ai-map-3.1.3.zip`. It also emits a deployment manifest
with that path, its byte count, and its SHA-256, plus a Pages rewrite that keeps
the Playground runtime's literal `/remote.html` endpoint from being redirected
to Cloudflare's extensionless route. The build owns the accessible outer
loading screen, keeps Playground's React root inert until the exhibit is
ready, and changes the matching caption inside the runtime module loaded by
`remote.html`. That modified runtime module receives a content-derived
filename and replaces the upstream entry in the offline asset manifest.
`dist-playground/` is generated and not committed. Cloudflare Pages
provides the required HTTPS origin; a normal HTTP origin cannot run
Playground's service worker.

Production is deployed manually from `dist-playground/`. Automatic Git
production and preview deployments are intentionally disabled for the Pages
project because the repository root is not a deployable Playground artifact.
The `wcus.hperkins.com` CNAME points to the Pages hostname in DNS-only mode;
enabling the orange-cloud proxy prevents Pages from routing this hostname.

GitHub Actions verifies the release build on pull requests, `main`, and manual
dispatch using a deterministic local Playground source fixture. It does not
publish an artifact or deploy Pages; manual publication from a verified
`dist-playground/` remains the production boundary.

### Verify the accessible loader locally

`npm run test:playground` proves the generated outer loader, inert/root
handoff, runtime module fingerprint, `remote.html`, and offline manifest
agree. It does not render the nested Playground frame. After building
`dist-playground/`, serve the exact Pages artifact in one PowerShell window:

```powershell
npx wrangler pages dev dist-playground `
    --port 8799 `
    --compatibility-date 2026-08-13
```

Then run the cold-frame verifier from a second PowerShell window:

```powershell
playwright-cli -s=loader open 'http://127.0.0.1:8799/' --browser chrome
$loaderCheck = Get-Content -Raw -LiteralPath 'tests/browser/playground-loader.js'
playwright-cli -s=loader run-code $loaderCheck
playwright-cli -s=loader close
```

The result must report `ok: true` and the exact approved copy for both the
outer kiosk-owned heading/status and the nested `remote.html` runtime
heading/status. It also proves that the upstream React loader is inaccessible
while loading and that the React root is restored when the exhibit is ready.
Matching text in generated files alone is not sufficient.

### Verify every deployment by artifact identity

Do not infer the deployed build from what appears on screen. After every
deployment, run the following from the same clean checkout and
`dist-playground/` directory used to deploy. It checks `/remote.html`, the
required shell files, the Blueprint's fingerprinted source, both remote
deployment manifests, and the byte count and SHA-256 of the ZIP downloaded
from each public hostname. Every temporary download has one resolved path and
is removed in `finally`.

```powershell
$dist = (Resolve-Path -LiteralPath 'dist-playground').Path
$manifestPath = Join-Path $dist 'deployment-manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$artifactRelative = [string] $manifest.pluginArtifact.path
$expectedArtifact = 'kiosk-blueprint/core-ai-map-3.1.3.zip'

if ($artifactRelative -ne $expectedArtifact) {
    throw "Expected $expectedArtifact; manifest has $artifactRelative."
}

$localArtifact = Join-Path `
    $dist `
    $artifactRelative.Replace('/', [IO.Path]::DirectorySeparatorChar)
if (-not (Test-Path -LiteralPath $localArtifact -PathType Leaf)) {
    throw "Missing local deployment artifact: $localArtifact"
}

$expectedBytes = [int64] $manifest.pluginArtifact.bytes
$expectedSha256 = ([string] $manifest.pluginArtifact.sha256).ToLowerInvariant()
$localBytes = (Get-Item -LiteralPath $localArtifact).Length
$localSha256 = (Get-FileHash -LiteralPath $localArtifact -Algorithm SHA256).Hash.ToLowerInvariant()

if ($localBytes -ne $expectedBytes -or $localSha256 -ne $expectedSha256) {
    throw 'Local plugin ZIP does not match deployment-manifest.json.'
}

$hosts = @(
    'https://core-ai-living-block-map.pages.dev',
    'https://wcus.hperkins.com'
)
$paths = @(
    '/',
    '/sw.js',
    '/kiosk-blueprint/blueprint.json',
    '/deployment-manifest.json'
)
foreach ($hostName in $hosts) {
    $probe = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $remote = Invoke-WebRequest `
        -Uri "$hostName/remote.html?probe=$probe" `
        -UseBasicParsing `
        -MaximumRedirection 0
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
        $response = Invoke-WebRequest `
            -Uri "${hostName}${path}?probe=$probe" `
            -UseBasicParsing
        $contentType = $response.Headers['Content-Type']
        "{0} {1} {2}" -f $response.StatusCode, $contentType, "$hostName$path"
    }

    $remoteManifest = Invoke-RestMethod `
        -Uri "$hostName/deployment-manifest.json?probe=$probe"
    if (
        $remoteManifest.pluginArtifact.path -ne $artifactRelative -or
        [int64] $remoteManifest.pluginArtifact.bytes -ne $expectedBytes -or
        ([string] $remoteManifest.pluginArtifact.sha256).ToLowerInvariant() -ne $expectedSha256
    ) {
        throw "Deployment manifest mismatch on $hostName."
    }

    $remoteBlueprint = Invoke-RestMethod `
        -Uri "$hostName/kiosk-blueprint/blueprint.json?probe=$probe"
    if ($remoteBlueprint.plugins.Count -ne 1 -or $remoteBlueprint.plugins[0].source -ne './core-ai-map-3.1.3.zip') {
        throw "Blueprint plugin source mismatch on $hostName."
    }

    $originName = ([Uri] $hostName).Host
    $downloadPath = [IO.Path]::GetFullPath(
        (Join-Path ([IO.Path]::GetTempPath()) "core-ai-map-${originName}-3.1.3-${PID}.zip")
    )
    if (Test-Path -LiteralPath $downloadPath) {
        throw "Refusing to overwrite existing verification file: $downloadPath"
    }

    try {
        Invoke-WebRequest `
            -Uri "${hostName}/${artifactRelative}?probe=$probe" `
            -UseBasicParsing `
            -OutFile $downloadPath
        $downloadBytes = (Get-Item -LiteralPath $downloadPath).Length
        $downloadSha256 = (Get-FileHash -LiteralPath $downloadPath -Algorithm SHA256).Hash.ToLowerInvariant()
        if (
            $downloadBytes -ne $expectedBytes -or
            $downloadSha256 -ne $expectedSha256
        ) {
            throw "Plugin ZIP identity mismatch on $hostName."
        }
        "VERIFIED {0} bytes sha256:{1} {2}/{3}" -f $downloadBytes, $downloadSha256, $hostName, $artifactRelative
    } finally {
        if (Test-Path -LiteralPath $downloadPath -PathType Leaf) {
            Remove-Item -LiteralPath $downloadPath -Force
        }
    }
}
```

### Booth gate after every deployment

Run this checklist on every booth browser after the artifact check above. Site
data clearing is a standing deployment step, not a one-time migration.

1. Close unrelated tabs, keep the kiosk on external power, disable display
   sleep/auto-lock, prefer wired networking, and do not add a persisted
   Playground `site-slug`.
2. Clear all site data for the hostname the kiosk will use. Confirm Cache
   Storage and origin-private file system (OPFS) data are empty and its service
   workers are unregistered. If the Pages hostname was opened directly, clear
   that origin too.
3. Open the kiosk in the foreground and confirm
   `document.visibilityState === 'visible'`. Time a cold boot from navigation
   until the attract prompt is usable, then reload and time a warm boot. Record
   both results with the browser/device version; investigate a crash or a boot
   that does not complete rather than treating a hidden/background run as a
   valid timing.
4. Confirm the loader says “Building a real WordPress 7.0 site in your browser
   — no server, about 45 seconds.” Then confirm the exhibit version using the
   manifest/ZIP check above, not the unchanged public URL.
5. Exercise Add blocks, all four stories, an inspector, About, Back/Escape, and
   Start over. Leave the engaged exhibit untouched for at least 65 seconds
   while the tab stays visible; it must return to the attract screen at the
   configured 60-second inactivity threshold.
6. Turn on the operating system's reduced-motion preference, reload, and
   confirm every story caption, path endpoint, state, and control remains
   understandable without ongoing animation. Restore the booth's intended
   setting afterward.
7. Prewarm the foreground kiosk immediately before visitors arrive. If the
   upstream Playground crash dialog appears, verify power/network, keep the
   tab foregrounded, and reload once. If it repeats, clear that origin's site
   data again, cold-boot, and rerun the artifact verification before returning
   the kiosk to service.

Record the hostname, deployed commit, manifest SHA-256, cold/warm times,
60-second reset result, reduced-motion result, device/browser versions, and
operator initials. These physical-device gates cannot be replaced by the local
unit or browser suites.

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
