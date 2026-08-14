# WCUS Release Gates Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the three P1 WCUS deployment blockers and the two low-risk kiosk polish warnings while preserving the working 3.2.0 guided journey.

**Architecture:** Keep UI-state behavior in the existing Interactivity API store, normalize the static Pages shell at build time, and centralize plug-in archive inspection in a small Node module shared by the builder and independent verifier. Use real ZIP fixtures so tests exercise the release boundary rather than opaque bytes. Keep the kiosk-only WordPress compatibility workaround narrowly scoped to the known split-filesystem Twenty Twenty-Five path.

**Tech Stack:** WordPress 7.0, PHP 7.4+ plug-in code, `@wordpress/interactivity`, SCSS, Node.js 22 test runner, Jest, `adm-zip`, Cloudflare Pages static assets.

## Global Constraints

- Release identity remains `3.2.0` across `package.json`, `core-ai-map.php`, `src/core-ai-map/block.json`, the Blueprint, and every emitted plug-in ZIP.
- The authored kiosk stage remains 1366 by 1024; 1024 by 768 remains compatibility rendering rather than physical-touch acceptance.
- The static Pages kiosk must stay self-contained and force `/kiosk-blueprint/blueprint.json` on every start, including launches from `/manifest.json` with `start_url: "/"`.
- Operable Browse-all cards must retain full visual opacity; only decoration or non-textual emphasis may be quieted.
- JSON endpoints must fail validation when they return HTML even with HTTP 200.
- Plug-in ZIP validation must inspect, not extract, archive entries and must reject malformed, missing, duplicate, or version-mismatched identity files.
- Do not suppress general PHP notices. Any compatibility workaround must target the unreadable Twenty Twenty-Five inlining path on the public kiosk only.
- Native PHP is unavailable in this workspace. Run all JavaScript coverage locally and clearly retain PHP-backed/browser-device verification as an external gate where it cannot be reproduced.

---

### Task 1: Restore Browse-all Card Readability

**Files:**
- Modify: `src/core-ai-map/view.test.js`
- Modify: `src/core-ai-map/view.js`
- Modify: `tests/browser/acceptance.js`

**Interfaces:**
- Consumes: the existing `state.cardOpacity` getter and root context fields `screen` and `story`.
- Produces: `state.cardOpacity === '1'` whenever `screen === 'map'` and no active flow layout exists.

- [ ] **Step 1: Change the neutral-map regression expectation**

```js
it( 'keeps every operable card fully opaque on the neutral map', () => {
	context.screen = 'map';
	context.story = '';
	context.cardId = 'assistant';

	expect( mapStore.state.isCardOffstage ).toBe( false );
	expect( mapStore.state.cardOpacity ).toBe( '1' );
} );
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- --runInBand src/core-ai-map/view.test.js -t "fully opaque on the neutral map"`

Expected: FAIL because the current getter returns `0.42`.

- [ ] **Step 3: Implement the minimal state fix**

```js
if ( context.screen === 'map' && ! activeLayout( context ) ) {
	return '1';
}
```

- [ ] **Step 4: Tighten the public Browser acceptance contract**

Require every Browse-all actor/card surface to have computed opacity `1` and
every visible card name/tagline sample to retain at least `4.5:1` contrast.
Keep these observations in the Browser Run payload so a failed deployment
identifies the exact card or text sample.

- [ ] **Step 5: Verify GREEN and the complete view suite**

Run: `npm run test:unit -- --runInBand src/core-ai-map/view.test.js`

Expected: PASS with no failed assertions.

---

### Task 2: Emit a Valid Static Kiosk Manifest

**Files:**
- Modify: `tests/playground/create-static-source-fixture.mjs`
- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `scripts/build-cloudflare-playground.mjs`

**Interfaces:**
- Consumes: `patchKioskIndex(html)`, copied static root assets, and Cloudflare Pages `_headers` syntax.
- Produces: exactly one `<link rel="manifest" href="/manifest.json">`, a parseable kiosk manifest, and `Content-Type: application/manifest+json; charset=UTF-8` for that path.

- [ ] **Step 1: Reproduce the dynamic-manifest defect in the source fixture**

Add this head element to the official-shell fixture:

```html
<link rel="manifest" href="/dynamic-manifest.json.php?review=fixture&amp;blueprint-url=fixture" />
```

Write `manifest.json` as valid JSON rather than the literal filename.

- [ ] **Step 2: Add failing shell and built-output assertions**

```js
assert.match( result, /<link rel="manifest" href="\/manifest\.json">/ );
assert.doesNotMatch( result, /dynamic-manifest\.json\.php/ );

const manifest = JSON.parse(
	await readFile( join( outputDirectory, 'manifest.json' ), 'utf8' )
);
assert.equal( manifest.start_url, '/' );
assert.equal( manifest.scope, '/' );
assert.match(
	await readFile( join( outputDirectory, '_headers' ), 'utf8' ),
	/\/manifest\.json[\s\S]*Content-Type: application\/manifest\+json; charset=UTF-8/
);
```

- [ ] **Step 3: Run the focused Playground tests and verify RED**

Run: `node --test --test-name-pattern="manifest|local kiosk launcher|Pages rewrite" tests/playground/cloudflare-build.test.mjs`

Expected: FAIL because the dynamic link survives and the emitted header contract is absent.

- [ ] **Step 4: Normalize or insert the manifest link in `patchKioskIndex`**

Implement one replacement path that rejects multiple manifest links, replaces one existing link, and inserts a static link when upstream omits it:

```js
const staticManifestLink = '<link rel="manifest" href="/manifest.json">';
```

- [ ] **Step 5: Generate the kiosk manifest after copying runtime assets**

Emit a JSON object with the Core AI kiosk name, description, `start_url: '/'`, `scope: '/'`, fullscreen landscape display, existing root logo assets, and the existing blue/gray theme colors. The static root is valid because the injected bootstrap always sets `blueprint-url` before Playground starts.

- [ ] **Step 6: Add the manifest response header and verify GREEN**

Run: `npm run test:playground`

Expected: all existing and new Playground tests pass.

---

### Task 3: Enforce Internal Plug-in ZIP Identity

**Files:**
- Create: `scripts/plugin-release-identity.mjs`
- Create: `tests/playground/plugin-zip-fixture.mjs`
- Create: `tests/playground/plugin-release-identity.test.mjs`
- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `tests/playground/artifact-verification.test.mjs`
- Modify: `scripts/build-cloudflare-playground.mjs`
- Modify: `scripts/verify-playground-artifact.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: a ZIP `Buffer` and an expected semantic version string.
- Produces: `validatePluginArchiveIdentity(contents, expectedVersion)` returning `{ headerVersion, constantVersion, blockVersion }` or throwing a release-blocking error.

- [ ] **Step 1: Create a real, deterministic ZIP fixture helper**

```js
export const createPluginZipFixture = ( {
	headerVersion,
	constantVersion = headerVersion,
	blockVersion = headerVersion,
} ) => {
	const zip = new AdmZip();
	zip.addFile(
		'core-ai-map/core-ai-map.php',
		Buffer.from( `<?php\n/**\n * Plugin Name: Fixture\n * Version: ${ headerVersion }\n */\ndefine( 'CORE_AI_MAP_VERSION', '${ constantVersion }' );\n` )
	);
	zip.addFile(
		'core-ai-map/build/core-ai-map/block.json',
		Buffer.from( JSON.stringify( { version: blockVersion } ) )
	);
	return zip.toBuffer();
};
```

- [ ] **Step 2: Add identity tests for each independently stale field**

Use table-driven cases for the plug-in header, `CORE_AI_MAP_VERSION`, and built `block.json`, with literal expected errors. Add malformed ZIP, missing-entry, and valid-current-version cases.

- [ ] **Step 3: Run the new test and verify RED**

Run: `node --test tests/playground/plugin-release-identity.test.mjs`

Expected: FAIL because `scripts/plugin-release-identity.mjs` does not exist.

- [ ] **Step 4: Implement the archive validator without extraction**

Use `AdmZip#getEntries()` to require exactly one of each expected path, parse the two PHP versions with anchored patterns, parse built JSON, and compare all three literal values with `expectedVersion`.

- [ ] **Step 5: Add `adm-zip@0.5.18` as a direct dev dependency**

Run: `npm install --save-dev --save-exact adm-zip@0.5.18`

Expected: `package.json` and `package-lock.json` record a direct dependency; no unrelated upgrades.

- [ ] **Step 6: Replace opaque build fixtures and add a stale-build rejection**

The successful build fixture must use a current real ZIP. Add a test passing a valid 3.1.2 ZIP to the 3.2.0 builder and assert rejection occurs before an existing output sentinel is removed.

- [ ] **Step 7: Validate before publishing and during independent verification**

Call `validatePluginArchiveIdentity(pluginContents, pluginVersion)` before deleting build output. In the verifier, require the exact `kiosk-blueprint/core-ai-map-${ version }.zip` path and validate the hashed canonical archive contents.

- [ ] **Step 8: Put artifact-verification tests in the release gate**

Update `test:playground` to run all four explicit Playground test files, including `artifact-verification.test.mjs` and `plugin-release-identity.test.mjs`.

- [ ] **Step 9: Verify GREEN**

Run: `npm run test:playground`

Expected: every real-ZIP build, stale-identity, path, size, hash, and manifest test passes.

---

### Task 4: Make Inspector Continuation and Install Metadata Explicit

**Files:**
- Modify: `src/core-ai-map/render.test.js`
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/style.scss`
- Modify: `core-ai-map.php`

**Interfaces:**
- Consumes: the existing `.core-ai-map__details` scroll region and `core_ai_map_print_web_app_metadata()` output.
- Produces: a non-interactive “Scroll or swipe for technical detail and take-away QR” cue while more panel content remains, plus both modern and Apple mobile web-app capability tags.

- [ ] **Step 1: Add failing structural contracts**

Assert that the details markup contains `.core-ai-map__details-continuation`, its QR continuation copy, a scroll-state container/fallback treatment, and the plug-in metadata contains both `mobile-web-app-capable` and `apple-mobile-web-app-capable`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- --runInBand src/core-ai-map/render.test.js`

Expected: FAIL because the continuation element and modern meta tag are absent.

- [ ] **Step 3: Add the cue and modern meta tag**

Render the cue as `aria-hidden="true"` so it does not add repetitive screen-reader noise. Style it as a pointer-transparent sticky bottom fade. Default it visible for Safari, and use a `scroll-state(scrollable: bottom)` container query to show it only while more content remains in supporting browsers.

- [ ] **Step 4: Verify GREEN and SCSS lint**

Run: `npm run test:unit -- --runInBand src/core-ai-map/render.test.js`

Run: `npm run lint:css`

Expected: both commands pass.

---

### Task 5: Remove the Known Twenty Twenty-Five Split-Filesystem Notice

**Files:**
- Modify: `src/core-ai-map/render.test.js`
- Modify: `core-ai-map.php`

**Interfaces:**
- Consumes: the global `WP_Styles` registry after `wp_enqueue_scripts` and before WordPress 7.0 runs `wp_maybe_inline_styles()` at `wp_head` priority 1.
- Produces: `core_ai_map_skip_unreadable_kiosk_theme_inline_path()` clearing only an unreadable `/wp-content/themes/twentytwentyfive/` `path` optimization on the kiosk page while preserving the public stylesheet `src`.

- [ ] **Step 1: Add a narrow failing source contract**

Require a kiosk guard, the normalized `twentytwentyfive` path fragment, an `is_readable()` check, and `add_data( $handle, 'path', false )`. The mutation this catches is broad notice suppression or removal of the path guard.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- --runInBand src/core-ai-map/render.test.js -t "split-filesystem theme style"`

Expected: FAIL because the compatibility function is absent.

- [ ] **Step 3: Implement the kiosk-only boundary fix**

At late `wp_enqueue_scripts` priority, inspect only queued styles. If the optional inline `path` is unreadable and its normalized path is inside Twenty Twenty-Five, set only that handle’s `path` data to `false`. Do not dequeue the style, alter its `src`, change `WP_DEBUG`, or intercept `_doing_it_wrong()`.

- [ ] **Step 4: Verify the JavaScript structural suite**

Run: `npm run test:unit -- --runInBand src/core-ai-map/render.test.js`

Expected: PASS. PHP-runtime and public-console proof remain required in a PHP-capable/deployed environment.

---

### Task 6: Full Verification and Rendered QA

**Files:**
- Verify all modified files and generated outputs; do not commit screenshots or temporary browser scripts.

**Interfaces:**
- Consumes: all task outputs.
- Produces: fresh evidence for source quality, build integrity, manifest correctness, UI behavior, and known environment limitations.

- [ ] **Step 1: Run source gates**

Run: `npm run lint:js -- --no-fix`

Run: `npm run lint:css`

Run: `npm run test:unit -- --runInBand src/core-ai-map/block.test.js src/core-ai-map/normalize.test.js src/core-ai-map/qr-assets.test.js src/core-ai-map/render.test.js src/core-ai-map/view.test.js`

Run: `npm run test:playground`

- [ ] **Step 2: Run production builds**

Run: `npm run build`

Run: `npm run plugin-zip`

Run a direct internal identity check on the newly generated root ZIP, then build a static source fixture, run `build:playground`, and run `verify:playground-artifact` against the result.

- [ ] **Step 3: Run Browser-plugin QA**

The flow under test is: kiosk loads -> Browse all components -> every operable card remains fully readable -> open AI Client details -> continuation cue identifies more content -> outer page manifest loads as JSON -> no relevant console error.

Capture page identity, nonblank DOM, no overlay, console warnings/errors, a Browse-all screenshot, a details-panel screenshot, and interaction state. If a production-faithful local URL cannot be run without a deploy, report that limitation rather than substituting the unchanged public site as proof of the code change.

- [ ] **Step 4: Review diff and worktree state**

Run: `git diff --check`

Run: `git status --short`

Confirm no generated `dist-playground`, root ZIP, screenshot, log, or temporary fixture is accidentally tracked.

- [ ] **Step 5: Record remaining external gates**

State explicitly that PHP-backed suites, deployed Browser Run console validation, physical iPad/Safari, Guided Access, booth network timing, service-worker recovery, and real QR scanning still require their documented environments.
