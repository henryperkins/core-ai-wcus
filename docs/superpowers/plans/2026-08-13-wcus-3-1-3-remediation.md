# WCUS 3.1.3 Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a locally verified Core AI Living Block Map 3.1.3 release candidate with collision-free primary compositions, contained card copy, honest cold-start guidance, notice-free SVG rendering, traceable deployment artifacts, complete sharing metadata, and an automated verification workflow.

**Architecture:** Preserve the fixed 1366 × 1024 stage, existing story placements, WordPress 7.0/PHP 8.3 Playground runtime, and kiosk interaction model. Move the neutral MCP card into the WordPress region, tighten only the provider actor’s internal rhythm, and replace Interactivity directives inside SVG with static data markers synchronized by one reactive effect owned by the surrounding HTML root. Keep production publication and physical-iPad acceptance separate from repository verification.

**Tech Stack:** WordPress 7.0 dynamic block, PHP 8.3, WordPress Interactivity API, JavaScript modules, SCSS, Jest/jsdom, Node test runner, WordPress Scripts, Playwright acceptance script, GitHub Actions, Cloudflare Pages, WordPress Playground Blueprint v2.

## Global Constraints

- Release version is exactly `3.1.3`.
- WordPress remains exactly `7.0`; PHP remains exactly `8.3`.
- Blueprint `contentBaseline` remains `empty`; `networkAccess` and `login` remain `false`.
- Preserve all current exhibit copy and behavior except the approved loader sentence and release metadata.
- Loader copy is exactly `Building a real WordPress site in your browser. A cold start can take a minute or more.`
- The full-canvas kiosk remains the root flow; no landing-page redesign is introduced.
- Do not enable persisted Playground site storage or delete upstream runtime assets.
- Do not publish to Cloudflare Pages or claim physical-iPad evidence from desktop automation.
- Use red/green regression evidence before production edits and regenerate committed `build/` assets only after source tests pass.
- Production publication remains manual; GitHub Actions verifies source and generated artifacts only.

---

## File structure

- Modify `src/core-ai-map/render.php` for neutral MCP placement, static SVG state markers, and the 3.1.3 server render.
- Modify `src/core-ai-map/style.scss` only for provider-card internal spacing.
- Modify `src/core-ai-map/view.js` to synchronize SVG classes and hidden state after hydration.
- Extend `src/core-ai-map/render-contract.test.js`, `src/core-ai-map/view.test.js`, and `tests/browser/acceptance.js` for all-card geometry, overflow, and SVG behavior.
- Modify `scripts/build-cloudflare-playground.mjs` and `tests/playground/cloudflare-build.test.mjs` for loader copy, social metadata, and manifest provenance.
- Add `scripts/verify-playground-artifact.mjs` plus `tests/playground/artifact-verification.test.mjs` for independent manifest/hash verification.
- Add `.github/workflows/verify.yml` and a deterministic minimal Playground source fixture generator used only to exercise the production build CLI in CI.
- Update release identity in package, plugin, block, Blueprint, service worker, readmes, and identity tests.
- Regenerate committed files under `build/` and create ignored local ZIP/Pages artifacts for verification.

### Task 1: Protect every visible card composition

**Files:**

- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `tests/browser/acceptance.js`
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/style.scss`

**Interfaces:**

- Consumes: neutral card coordinates and the rendered `.core-ai-map__actor`, `.core-ai-map__block`, and `.core-ai-map__provider-plugin` surfaces.
- Produces: a neutral MCP position fully inside WordPress plus reusable browser observations for pairwise collisions and body/text overflow.

- [ ] **Step 1: Replace the actor-only neutral contract with an all-card contract**

Render the PHP markup, collect every actor and block wrapper with its neutral x/y and CSS dimensions, and assert pairwise non-intersection. The mutation this catches is returning MCP to `[122, 400]`, which intersects `agent` and `task`.

- [ ] **Step 2: Run the focused test and verify red**

Run:

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/render-contract.test.js -t "neutral composition"
```

Expected: FAIL listing `agent/mcp` and `task/mcp`.

- [ ] **Step 3: Broaden browser geometry and overflow coverage**

Add one browser-side measurement helper that:

- selects every visible actor, block, and provider-plugin wrapper;
- calculates all pairwise intersection areas;
- checks each actor body, block body, and provider-plugin body with `scrollHeight <= clientHeight`;
- uses a `Range` around the last non-empty text node to confirm its bounds remain inside the card body.

Run it on the active attract composition, neutral map, each of the four story compositions, and the 1024 × 768 neutral/story-01 compatibility states.

- [ ] **Step 4: Implement the neutral geometry fix**

Change only MCP’s neutral position from `[122, 400]` to `[268, 400]`. Leave story `place`, paths, strips, and animation timings unchanged; `cardTransform` already derives story translation from the neutral source of truth.

- [ ] **Step 5: Fit the provider copy without changing actor geometry**

Add provider-only CSS with `padding-block: 10px`, `strong { margin-top: 5px; }`, and `small { margin-top: 1px; line-height: 1.2; }` for the existing 120px body. Preserve the 14px small-text size, the 120px actor height, story path endpoints, and all authored text.

- [ ] **Step 6: Verify green**

Run:

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/render-contract.test.js src/core-ai-map/render.test.js
npm.cmd run lint:css
```

Expected: all targeted tests and CSS lint pass. Browser acceptance remains a final artifact gate.

- [ ] **Step 7: Commit the geometry patch**

```powershell
git add src/core-ai-map/render.php src/core-ai-map/style.scss src/core-ai-map/render-contract.test.js tests/browser/acceptance.js
git commit -m "fix: clear primary map card collisions"
```

### Task 2: Remove Interactivity directives from SVG

**Files:**

- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/view.test.js`
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/view.js`

**Interfaces:**

- Consumes: static `data-core-ai-rule`, `data-core-ai-preview`, `data-core-ai-story`, and `data-core-ai-variant` markers in the wire SVG.
- Produces: the same `hidden`, `is-lit`, `is-hidden`, `is-visible`, and `is-live` states without any `data-wp-*` attributes inside SVG.

- [ ] **Step 1: Add the failing PHP-rendered SVG contract**

Render through the existing PHP harness, parse every `<svg>`, and assert none contains a `data-wp-*` attribute. Make the harness reject non-empty PHP stderr so native renderer warnings and notices cannot silently pass.

- [ ] **Step 2: Add the failing hydrated-state test**

Append a minimal wire SVG fixture to the map root, set a selected story/variant and preview state, invoke the final `useKiosk` effect, and assert rules, hairlines, preview groups, preview paths/signals, story paths, and configuration paths receive the expected classes/hidden state.

- [ ] **Step 3: Verify both tests fail for the intended causes**

Run:

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/render-contract.test.js src/core-ai-map/view.test.js -t "SVG"
```

Expected: the render contract finds incompatible directives and the hydration fixture remains unsynchronized.

- [ ] **Step 4: Render static SVG markers and correct first-frame state**

Remove every context and Interactivity directive from inside the wire SVG. Emit static story/variant/rule markers, keep non-current previews/config paths hidden, and initialize hairlines as hidden for the attract screen.

- [ ] **Step 5: Synchronize SVG state from the HTML-owned reactive effect**

Add one function in `view.js` that reads the existing context and toggles the established classes/hidden properties. Register it as the last `useKiosk` effect with dependencies on screen, story, recomposition, flow phase, preview index, preview phase, and shapes. Reuse existing state predicates so reduced-motion and story semantics do not diverge.

- [ ] **Step 6: Verify green and commit**

Run:

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/render-contract.test.js src/core-ai-map/view.test.js
npm.cmd run lint:js -- --no-fix
git add src/core-ai-map/render.php src/core-ai-map/view.js src/core-ai-map/render-contract.test.js src/core-ai-map/view.test.js
git commit -m "fix: hydrate SVG state without directives"
```

### Task 3: Correct the Playground shell and artifact provenance

**Files:**

- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `tests/browser/playground-loader.js`
- Modify: `scripts/build-cloudflare-playground.mjs`
- Create: `scripts/verify-playground-artifact.mjs`
- Create: `tests/playground/artifact-verification.test.mjs`
- Modify: `package.json`

**Interfaces:**

- Consumes: upstream Playground HTML, the local plugin ZIP, the repository HEAD, and a generated deployment manifest.
- Produces: honest loader copy, exhibit-owned HTML/social metadata, manifest fields `sourceCommit`, `pluginVersion`, and `builtAt`, plus independent artifact verification.

- [ ] **Step 1: Add failing loader and metadata assertions**

Expand the upstream fixture with generic description/Open Graph tags. Assert the patched output contains the exhibit title and the package description in canonical, Open Graph, and Twitter fields; assert no generic Playground sharing copy or `about 45 seconds` promise remains.

- [ ] **Step 2: Add failing provenance assertions**

Pass deterministic `sourceCommit` and `builtAt` values to the test build and require those values plus a `pluginVersion` matching the current Blueprint/package version in `deployment-manifest.json`. Task 4 changes that aligned version from 3.1.2 to 3.1.3.

- [ ] **Step 3: Add an independent manifest/hash verifier test**

Create fixtures for a valid artifact and for byte-count, SHA-256, version, source-commit, path-traversal, and timestamp mismatches. The verifier must read the emitted file independently rather than reuse the build’s manifest object.

- [ ] **Step 4: Verify red**

Run:

```powershell
npm.cmd run test:playground
node --test tests/playground/artifact-verification.test.mjs
```

Expected: new copy/metadata/provenance assertions fail and the verifier module is absent.

- [ ] **Step 5: Implement shell metadata and loader copy**

Replace or insert `description`, `og:title`, `og:description`, `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` using `Core AI Living Block Map` plus the existing package description. Patch both outer and runtime captions with the exact approved cold-start sentence.

- [ ] **Step 6: Implement provenance and independent verification**

Allow deterministic build inputs for tests, default the CLI build to the current Git commit and current ISO timestamp, and emit `sourceCommit`, `pluginVersion`, and `builtAt`. Add `npm run verify:playground-artifact` to validate the manifest against the built ZIP, package version, expected commit, and a parseable timestamp.

- [ ] **Step 7: Verify green and commit**

```powershell
npm.cmd run test:playground
npm.cmd run lint:js -- --no-fix
git add package.json package-lock.json scripts tests/playground tests/browser/playground-loader.js
git commit -m "build: trace Playground release artifacts"
```

### Task 4: Bump all release surfaces to 3.1.3

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `core-ai-map.php`
- Modify: `src/core-ai-map/block.json`
- Modify: `playground/blueprint.json`
- Modify: `assets/service-worker.js`
- Modify: `src/core-ai-map/block.test.js`
- Modify: `src/core-ai-map/render.test.js`
- Modify: `tests/playground/blueprint.test.mjs`
- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `README.md`
- Modify: `readme.txt`

**Interfaces:**

- Consumes: the 3.1.3 source tree.
- Produces: one aligned version, fingerprinted `core-ai-map-3.1.3.zip` path, and cache namespace `v3.1.3-review-1`.

- [ ] **Step 1: Change identity tests first**

Update metadata, Blueprint, artifact path, and service-worker expectations to exactly 3.1.3.

- [ ] **Step 2: Verify red**

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/block.test.js src/core-ai-map/render.test.js
npm.cmd run test:playground
```

Expected: current 3.1.2 source surfaces fail the 3.1.3 expectations.

- [ ] **Step 3: Bump package/plugin/block/Blueprint/cache metadata**

Update only the root package versions in `package-lock.json`; dependency versions containing 3.1.2 remain untouched. Change all active artifact paths and verification examples to 3.1.3.

- [ ] **Step 4: Add the 3.1.3 changelog and release notes**

Document collision/overflow corrections, loader copy, SVG notice removal, provenance/CI, and social metadata. Retain 3.1.2 as historical release information.

- [ ] **Step 5: Verify green and commit**

```powershell
npm.cmd run test:unit -- --runInBand src/core-ai-map/block.test.js src/core-ai-map/render.test.js
npm.cmd run test:playground
git add package.json package-lock.json core-ai-map.php src/core-ai-map/block.json playground/blueprint.json assets/service-worker.js src/core-ai-map/block.test.js src/core-ai-map/render.test.js tests/playground README.md readme.txt
git commit -m "release: prepare Core AI map 3.1.3"
```

### Task 5: Add verification-only GitHub Actions

**Files:**

- Create: `.github/workflows/verify.yml`
- Create: `tests/playground/create-static-source-fixture.mjs`
- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `package.json`
- Modify: `README.md`

**Interfaces:**

- Consumes: Node 22, PHP 8.3, the package lockfile, and a deterministic minimal representation of the upstream static asset contract.
- Produces: a non-deploying Actions check covering lint, unit tests, Playground tests, block build, ZIP packaging, production Playground CLI execution, and independent manifest/hash verification.

- [ ] **Step 1: Extract the existing minimal source fixture**

Move the current test-only source builder into an importable script that can also write a fixture directory from a CLI argument. Keep the test’s complete upstream file shape and side effects unchanged.

- [ ] **Step 2: Add the verification workflow**

On pull requests, pushes to `main`, and manual dispatch: check out full history, set up Node 22 and PHP 8.3, run `npm ci`, `lint:js -- --no-fix`, `lint:css`, `test:unit -- --runInBand`, `test:playground`, `build`, `plugin-zip`, create the deterministic Playground source, run `build:playground`, and run the independent artifact verifier against `github.sha`. Do not add deployment credentials or a Pages publish step.

- [ ] **Step 3: Add workflow/CLI contract tests**

Assert the fixture CLI produces the expected upstream tree and the workflow invokes every required named gate without a deployment command.

- [ ] **Step 4: Verify and commit**

```powershell
npm.cmd run test:playground
npm.cmd run lint:js -- --no-fix
git add .github package.json package-lock.json tests/playground README.md
git commit -m "ci: verify the booth release build"
```

### Task 6: Regenerate and verify the exact release candidate

**Files:**

- Regenerate: `build/blocks-manifest.php`
- Regenerate: `build/core-ai-map/*`
- Create ignored: `core-ai-map.zip`
- Create ignored: `dist-playground/*`

**Interfaces:**

- Consumes: Tasks 1–5.
- Produces: committed installable assets, an ignored local ZIP, a traceable ignored Pages artifact, and fresh automated evidence.

- [ ] **Step 1: Generate source-derived assets**

```powershell
npm.cmd run generate:qr
npm.cmd run build
```

- [ ] **Step 2: Run the complete source gate**

```powershell
npm.cmd run lint:js -- --no-fix
npm.cmd run lint:css
npm.cmd run test:unit -- --runInBand
npm.cmd run test:playground
```

- [ ] **Step 3: Commit generated assets, then package the clean commit**

```powershell
git add build
git commit -m "build: compile Core AI map 3.1.3"
npm.cmd run plugin-zip
```

Require `git status --short --untracked-files=no` to be empty before the Pages build so `sourceCommit` identifies all ZIP inputs.

- [ ] **Step 4: Build and verify a local Pages artifact**

Use the pinned official Playground source directory when available. If it is unavailable, run the same production CLI against the deterministic CI fixture and report the official-runtime build separately as unrun.

```powershell
$playgroundSource = (Resolve-Path -LiteralPath $env:PLAYGROUND_SOURCE_DIR).Path
npm.cmd run build:playground -- --source $playgroundSource
npm.cmd run verify:playground-artifact -- --directory dist-playground --source-commit (git rev-parse HEAD)
```

- [ ] **Step 5: Run rendered browser QA**

Make the exact Pages artifact available at a publicly reachable HTTPS preview,
then use the globally configured Browser Run MCP service at 1366 × 1024 and
1024 × 768. Treat the retained loader and acceptance scripts as the assertion
contract; do not launch them with local Playwright for an agent run. Use
`browser_snapshot` to locate and verify controls through attract, neutral, and
all four stories, and use screenshots only where collision, overflow, or SVG
visual evidence is required. Require zero all-card collisions/overflows;
preserved SVG path/signal/boundary behavior; no PHP notice exposed in the page;
and zero console errors, page errors, or failed requests. Record returned run
IDs and artifact references with the release evidence, do not commit private
artifact bodies or credentials, and call `browser_close` in final cleanup on
success or failure. If no preview URL exists, report that single blocker and do
not fall back to a local browser.

- [ ] **Step 6: Inspect source/build agreement**

```powershell
git diff --check
git status --short
git diff --stat main...HEAD
```

Confirm no unrelated or temporary artifacts are staged.

- [ ] **Step 7: Rerun final gates from the exact committed head**

```powershell
npm.cmd run lint:js -- --no-fix
npm.cmd run lint:css
npm.cmd run test:unit -- --runInBand
npm.cmd run test:playground
npm.cmd run build
npm.cmd run plugin-zip
git status --short --branch
```

### Task 7: Reconcile repository state without conflating release gates

**Files:**

- No source files expected.

**Interfaces:**

- Consumes: verified branch commits and the existing PRs #1 and #3.
- Produces: clear GitHub history while leaving deployment and iPad acceptance open.

- [ ] **Step 1: Follow the development-branch finish workflow**

Present the verified branch’s integration choices before push/merge. Do not claim the release is deployed or booth-approved.

- [ ] **Step 2: Close superseded PRs after final history is addressable**

Close PR #1 and PR #3 with concise comments linking to the final implementation history. Preserve the distinction between repository closure and Cloudflare deployment.

- [ ] **Step 3: Report remaining manual gates**

Leave physical iPad/Safari cold start, warm start, visible 60-second reset, offline/recovery, and final visual inspection explicitly open until performed on booth hardware.
