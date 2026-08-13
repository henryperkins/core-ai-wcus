# WCUS Review Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Core AI Living Block Map 3.1.2 with reliable build identity, useful boot messaging, collision-free header/dialog geometry, visible neutral actors, and a booth-ready deployment runbook.

**Architecture:** Keep the WordPress block and upstream Playground runtime architecture intact. Make the Blueprint plugin source authoritative for the fingerprinted deployed ZIP path, record artifact identity in the deployment manifest, and apply focused state/CSS/markup changes for the rendered defects. Preserve the full-canvas kiosk and all current story compositions.

**Tech Stack:** WordPress 7.0 dynamic block, PHP 8.3, WordPress Interactivity API, JavaScript modules, SCSS, Jest/jsdom, Node test runner, WordPress Scripts, Cloudflare Pages, WordPress Playground Blueprint v2.

## Global Constraints

- Release version is exactly `3.1.2`.
- WordPress remains exactly `7.0`; PHP remains exactly `8.3`.
- Blueprint `contentBaseline` remains `empty`; `networkAccess` and `login` remain `false`.
- The live exhibit remains the root kiosk flow; no static landing page is added.
- Do not enable a persisted Playground `site-slug`.
- Do not delete upstream Blueprint editor chunks from the copied runtime.
- Do not deploy to Cloudflare Pages or clear a real browser's stored site data.
- Preserve user-authored serialized block copy and exact-default migrations.
- Use red/green tests for behavior and regenerate committed `build/` assets only after source tests pass.

---

## File structure

- Create `.gitattributes` for LF text checkouts on Windows and Unix.
- Keep `docs/reviews/2026-08-13-wcus-review-reconciliation.md` as the review decision record.
- Modify release metadata in `package.json`, `package-lock.json`, `core-ai-map.php`, `src/core-ai-map/block.json`, `playground/blueprint.json`, `assets/service-worker.js`, `README.md`, and `readme.txt`.
- Modify `scripts/build-cloudflare-playground.mjs` so the Blueprint controls the deployed ZIP filename and the manifest records its identity.
- Modify Playground, block, render, and view tests before their implementations.
- Modify `src/core-ai-map/view.js` for neutral actors and `src/core-ai-map/render.php` plus `src/core-ai-map/style.scss` for geometry.
- Modify `tests/browser/acceptance.js` to measure all three rendered changes.
- Regenerate `build/` and create a local release ZIP after source tests pass.

### Task 1: Restore a reproducible Windows verification baseline

**Files:**

- Create: `.gitattributes`
- Modify: `README.md`
- Verify: `src/core-ai-map/qr-assets.test.js`
- Verify: `src/core-ai-map/render.test.js`

**Interfaces:**

- Consumes: Git checkout behavior and the existing `.editorconfig` LF policy.
- Produces: LF working-tree text and a documented PHP 8.3 CLI prerequisite.

- [ ] **Step 1: Preserve the failing baseline evidence**

```powershell
npm.cmd run test:unit -- --runInBand
npm.cmd run lint:js
```

Expected: PHP launch and CRLF-sensitive tests fail; lint reports `Delete ␍`.
The recorded worktree baseline is 12 failed/66 passed tests and 5,916 lint
errors.

- [ ] **Step 2: Add the checkout contract**

Create `.gitattributes` with:

```gitattributes
* text=auto eol=lf
*.png binary
*.woff2 binary
*.zip binary
```

- [ ] **Step 3: Normalize this isolated worktree and expose portable PHP**

```powershell
git config --local core.autocrlf false
npm.cmd run format
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
php --version
```

Expected: PHP reports 8.3.33 and formatted text uses LF.

- [ ] **Step 4: Document the prerequisite**

Add under `Development and verification`:

```markdown
The unit suite requires a PHP 8.3 CLI executable named `php` on `PATH`; several contract tests execute the server renderer directly.
```

- [ ] **Step 5: Verify the repaired baseline**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run test:unit -- --runInBand
npm.cmd run lint:js
```

Expected: all 78 tests pass and JavaScript lint exits 0.

- [ ] **Step 6: Commit**

```powershell
git add .gitattributes README.md
git commit -m "chore: make Windows verification reproducible"
```

### Task 2: Make release identity and plugin bytes unambiguous

**Files:**

- Modify: `tests/playground/blueprint.test.mjs`
- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `src/core-ai-map/block.test.js`
- Modify: `src/core-ai-map/render.test.js`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `core-ai-map.php`
- Modify: `src/core-ai-map/block.json`
- Modify: `playground/blueprint.json`
- Modify: `assets/service-worker.js`
- Modify: `scripts/build-cloudflare-playground.mjs`
- Modify: `README.md`
- Modify: `readme.txt`

**Interfaces:**

- Consumes: Blueprint source `./core-ai-map-3.1.2.zip` and local `core-ai-map.zip`.
- Produces: `kiosk-blueprint/core-ai-map-3.1.2.zip` and manifest fields `path`, `bytes`, and `sha256`.

- [ ] **Step 1: Write failing release assertions**

Add to `blueprint.test.mjs`:

```js
assert.equal( blueprint.blueprintMeta.version, '3.1.2' );
assert.equal( blueprint.plugins[ 0 ].source, './core-ai-map-3.1.2.zip' );
```

Change `block.test.js` metadata expectations to 3.1.2. Change
`render.test.js` to expect:

```js
const CACHE_NAME = `${ CACHE_SCOPE_PREFIX }v3.1.2-review-1`;
```

In the Cloudflare test, assert the fixture is copied only to the fingerprinted
path and the manifest contains:

```js
{
	path: 'kiosk-blueprint/core-ai-map-3.1.2.zip',
	bytes: Buffer.byteLength( 'fixture-plugin-zip' ),
	sha256: createHash( 'sha256' )
		.update( 'fixture-plugin-zip' )
		.digest( 'hex' ),
}
```

- [ ] **Step 2: Verify red**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run test:playground
npm.cmd run test:unit -- --runInBand src/core-ai-map/block.test.js src/core-ai-map/render.test.js
```

Expected: failures show 3.1.1 metadata, the stable ZIP, no artifact manifest,
and the old cache name.

- [ ] **Step 3: Bump every release surface**

Set `3.1.2` in package metadata/lockfile, plugin header/constant, block metadata,
Blueprint metadata, readmes, and version-named test suites. Set the worker cache
suffix to `v3.1.2-review-1` and the Blueprint plugin source to
`./core-ai-map-3.1.2.zip`.

- [ ] **Step 4: Derive the deployed filename from the Blueprint**

Read `playground/blueprint.json` once in `buildCloudflarePlayground()`. Validate
that its one plugin source matches
`^\./core-ai-map-\d+\.\d+\.\d+\.zip$`; reject anything else. Copy the local
plugin ZIP to the validated basename and write the same Blueprint bytes.

- [ ] **Step 5: Record artifact identity**

Import `createHash` from `node:crypto`, read the copied bytes, and emit:

```js
pluginArtifact: {
	path: `kiosk-blueprint/${ pluginArtifactName }`,
	bytes: pluginBytes.byteLength,
	sha256: createHash( 'sha256' ).update( pluginBytes ).digest( 'hex' ),
},
```

- [ ] **Step 6: Verify green**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run test:playground
npm.cmd run test:unit -- --runInBand src/core-ai-map/block.test.js src/core-ai-map/render.test.js
```

Expected: all targeted tests pass.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json core-ai-map.php src playground assets/service-worker.js scripts tests README.md readme.txt
git commit -m "fix: fingerprint the Playground release artifact"
```

### Task 3: Explain the compute-bound Playground boot

**Files:**

- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `scripts/build-cloudflare-playground.mjs`

**Interfaces:**

- Consumes: late-rendered text node `Preparing WordPress`.
- Produces: `Building a real WordPress 7.0 site in your browser — no server, about 45 seconds.` while preserving upstream progress UI.

- [ ] **Step 1: Add a failing shell assertion**

```js
assert.match(
	result,
	/Building a real WordPress 7\.0 site in your browser — no server, about 45 seconds\./
);
assert.match( result, /MutationObserver/ );
```

- [ ] **Step 2: Verify red**

```powershell
node --test --test-name-pattern="patches the official Playground shell" tests/playground/cloudflare-build.test.mjs
```

Expected: explanatory copy is absent.

- [ ] **Step 3: Inject the runtime rewrite**

Add:

```js
export const kioskLoadingMessage =
	'Building a real WordPress 7.0 site in your browser — no server, about 45 seconds.';
```

Extend the bootstrap with a `MutationObserver` that walks body text nodes,
replaces an exact trimmed `Preparing WordPress`, starts on `DOMContentLoaded`,
and disconnects once replaced. Serialize the message with `JSON.stringify()`.

- [ ] **Step 4: Verify green and commit**

```powershell
npm.cmd run test:playground
git add scripts/build-cloudflare-playground.mjs tests/playground/cloudflare-build.test.mjs
git commit -m "fix: explain the Playground boot wait"
```

### Task 4: Keep actor cards visible in the neutral map

**Files:**

- Modify: `src/core-ai-map/view.test.js`
- Modify: `src/core-ai-map/view.js`
- Modify: `tests/browser/acceptance.js`

**Interfaces:**

- Consumes: `screen === 'map'` with no active layout.
- Produces: five visible actors at opacity `0.42`; story filtering is unchanged.

- [ ] **Step 1: Write the failing state test**

```js
it( 'keeps outside actors visible but dimmed on the neutral map', () => {
	context.screen = 'map';
	context.story = '';
	context.cardId = 'assistant';

	expect( mapStore.state.isCardOffstage ).toBe( false );
	expect( mapStore.state.cardOpacity ).toBe( '0.42' );
} );
```

- [ ] **Step 2: Verify red**

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/view.test.js -t "keeps outside actors visible"
```

Expected: offstage is true and opacity is empty.

- [ ] **Step 3: Implement minimal state changes**

In `cardOpacity`, return `0.42` for a neutral map. In `isCardOffstage`, return
false for the same state before story membership filtering.

- [ ] **Step 4: Protect rendered behavior**

After opening the neutral map in `acceptance.js`, collect five actors and assert
that none is hidden and every computed opacity is exactly `0.42`.

- [ ] **Step 5: Verify green and commit**

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/view.test.js
git add src/core-ai-map/view.js src/core-ai-map/view.test.js tests/browser/acceptance.js
git commit -m "fix: show neutral map actors"
```

### Task 5: Remove both measured geometry collisions

**Files:**

- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/style.scss`
- Modify: `tests/browser/acceptance.js`

**Interfaces:**

- Consumes: topbar, hint, and About markup.
- Produces: zero date/hint and close/brand intersections; close remains first focus target inside the white card.

- [ ] **Step 1: Write the failing dialog structure test**

```js
const close = dialog.querySelector( '.core-ai-map__about-close' );
const content = dialog.querySelector( '.core-ai-map__about-content' );
expect( content.firstElementChild ).toBe( close );
```

- [ ] **Step 2: Verify red**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run test:unit -- --runInBand src/core-ai-map/render-contract.test.js -t "transparency dialog"
```

Expected: close is a sibling of the card, not its first child.

- [ ] **Step 3: Move the control into normal card flow**

Move `.core-ai-map__about-close` inside `.core-ai-map__about-content` before the
Transparency badge. Replace absolute coordinates with:

```scss
position: static;
margin: -12px 0 18px;
```

Retain the 60 px target, click binding, focus, and typography.

- [ ] **Step 4: Recover header clearance**

Change `.core-ai-map__brand` from `gap: 12px` to `gap: 10px`. Five gaps recover
10 logical pixels, exceeding the measured 4.21 px intersection without hiding
or moving content.

- [ ] **Step 5: Add browser geometry assertions**

At 1366 × 1024, assert zero rectangle intersection for date/hint and
close/brand, close containment inside the card, focus on open, and focus
restoration on close.

- [ ] **Step 6: Verify and commit**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run test:unit -- --runInBand src/core-ai-map/render-contract.test.js src/core-ai-map/render.test.js
npm.cmd run lint:css
git add src/core-ai-map/render.php src/core-ai-map/style.scss src/core-ai-map/render-contract.test.js tests/browser/acceptance.js
git commit -m "fix: clear kiosk header collisions"
```

### Task 6: Promote deployment and booth operations into release gates

**Files:**

- Modify: `README.md`
- Modify: `readme.txt`

**Interfaces:**

- Consumes: the deployment manifest and fingerprinted local/deployed ZIP.
- Produces: byte-for-byte deployment verification and a physical booth checklist.

- [ ] **Step 1: Update release notes and active paths**

Add a 3.1.2 changelog entry. Replace active deploy probes for
`core-ai-map.zip` with `core-ai-map-3.1.2.zip`; retain historical 3.1.1 text
only where it describes migration or the old changelog.

- [ ] **Step 2: Add artifact verification**

Document PowerShell that reads `deployment-manifest.json`, checks local bytes
and SHA-256, downloads the ZIP from both public hosts to an exact temporary
path, compares bytes/SHA-256, and removes that file in `finally`.

- [ ] **Step 3: Add standing booth gates**

Document: clear site data/Cache Storage/OPFS/service worker after every deploy;
foreground cold and warm timings; visible-only 60-second reset; OS reduced
motion; disabled sleep; foreground tab; wired network; prewarm; crash-dialog
reload then clear-data recovery; and no persisted `site-slug`.

- [ ] **Step 4: Scan active documentation**

```powershell
rg -n "core-ai-map\.zip|3\.1\.1|clear stored site data once" README.md readme.txt playground scripts tests
```

Expected: active paths are fingerprinted and one-off clear-data wording is gone.

- [ ] **Step 5: Commit**

```powershell
git add README.md readme.txt docs
git commit -m "docs: add booth release gates"
```

### Task 7: Regenerate artifacts and run complete verification

**Files:**

- Regenerate: `build/blocks-manifest.php`
- Regenerate: `build/core-ai-map/*`
- Create locally, do not commit: `core-ai-map.zip`

**Interfaces:**

- Consumes: Tasks 1–6.
- Produces: committed installable assets and a locally verified 3.1.2 ZIP.

- [ ] **Step 1: Generate and run every automated gate**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run generate:qr
npm.cmd run test:unit -- --runInBand
npm.cmd run test:playground
npm.cmd run lint:js
npm.cmd run lint:css
npm.cmd run build
npm.cmd run plugin-zip
```

Expected: all commands exit 0; QR files are unchanged; the ignored ZIP exists.

- [ ] **Step 2: Build a local Playground artifact**

```powershell
$env:PLAYGROUND_SOURCE_DIR = 'C:\path\to\wasm-wordpress-net'
npm.cmd run build:playground
```

Expected: fingerprinted ZIP exists, stable ZIP is absent, and manifest identity
matches the file. If the official static source is unavailable, report this
single artifact-build gate as unrun rather than substituting another runtime.

- [ ] **Step 3: Run rendered browser QA**

The flow under test is: local root → explanatory boot → Add blocks → neutral
actors/date-hint → About containment/focus → Back to exhibit. At 1418 × 828 and
1366 × 1024 verify page identity, meaningful content, no error overlay, healthy
console, exact loading copy, five actors at 0.42, zero intersections, dialog
containment/focus, and screenshot evidence.

- [ ] **Step 4: Inspect the full branch diff**

```powershell
git diff --check
git status --short
git diff --stat origin/main...HEAD
git diff origin/main...HEAD -- .gitattributes src build playground scripts tests README.md readme.txt docs
```

Expected: no whitespace errors or unrelated files; source and build agree.

- [ ] **Step 5: Commit generated assets**

```powershell
git add build
git commit -m "build: compile Core AI map 3.1.2"
```

- [ ] **Step 6: Re-run the final gate after the commit**

```powershell
$env:PATH = 'C:\Users\htper\AppData\Local\Temp\codex-core-ai-php-8.3.33\php;' + $env:PATH
npm.cmd run test:unit -- --runInBand
npm.cmd run test:playground
npm.cmd run lint:js
npm.cmd run lint:css
npm.cmd run build
npm.cmd run plugin-zip
git status --short --branch
```

Expected: every command exits 0 and the branch is clean except for ignored
release artifacts.
