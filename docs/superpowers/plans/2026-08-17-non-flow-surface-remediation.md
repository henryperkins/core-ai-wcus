# Non-flow Surface Remediation Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine every approved non-flow surface so the exhibit teaches what Core AI is, where each component belongs, and how to operate the kiosk without adding persistent visual clutter.

**Architecture:** Keep the existing server-rendered dynamic block, fixed 1366×1024 stage, Interactivity API store, and canonical data model. Add only product-owned taxonomy metadata and transient readiness/reset state to the existing PHP context; keep all interaction behavior in `view.js` and all presentation in the incumbent SCSS system. Preserve the full topology in Browse and WP-Bench, but provide a clear first item and sequential navigation.

**Tech Stack:** WordPress dynamic block/PHP, `@wordpress/interactivity`, SCSS, Jest/jsdom, `@wordpress/scripts`.

**Execution note:** This branch contains the uncommitted 3.2.4 surface being remediated. Work in place, preserve unrelated changes, and do not create commits unless requested.

---

### Task 1: Lock secondary-surface and sequencing contracts

**Files:**
- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/render.test.js`
- Modify: `src/core-ai-map/view.test.js`

- [x] Add renderer assertions that feedback lives inside About with a visible URL, About explains the exhibit/block architecture, the inspector uses “Component details,” and continuation guidance is absent for context-only panels.
- [x] Add WP-Bench assertions for stage 01 as the default and Previous/Next controls.
- [x] Add behavior assertions that closing About into attract restarts the preview scheduler and that bench navigation advances/clamps in canonical order.
- [x] Run the targeted suites and confirm the new assertions fail for the intended missing behavior.

### Task 2: Distill About, feedback, continuation, and WP-Bench

**Files:**
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/view.js`
- Modify: `src/core-ai-map/style.scss`

- [x] Move the feedback QR into About, show its selectable destination, and add concise Core AI/exhibit architecture copy.
- [x] Restart the attract preview when About closes back to welcome.
- [x] Make the continuation cue content-safe and hide it for short context-only panels.
- [x] Open WP-Bench on task/stage 01 and add accessible Previous/Next sequencing while retaining the five-stage topology.
- [x] Run the targeted suites to green.

### Task 3: Lock and implement welcome/taxonomy/context contracts

**Files:**
- Modify: `src/core-ai-map/block.test.js`
- Modify: `src/core-ai-map/normalize.test.js`
- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/view.test.js`
- Modify: `src/core-ai-map/block.json`
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/view.js`
- Modify: `src/core-ai-map/style.scss`

- [x] Add failing assertions for the direct Core AI heading, concise taxonomy-first intro, Choose/Follow/Open steps, neutral “Open” guidance, renamed zones, hidden neutral flow legend, and a neutral AI Client focus target.
- [x] Add failing assertions that Inspect retains a dim inert map and every component panel exposes fixed Where/Core status metadata.
- [x] Update exact-default migration behavior without overwriting author-customized copy.
- [x] Reorder component DOM traversal by zones, retain the complete inventory, and make AI Client the neutral first focus.
- [x] Implement the copy/layout/context changes and run the targeted suites to green.

### Task 4: Lock and implement operational hardening

**Files:**
- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/view.test.js`
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/view.js`
- Modify: `src/core-ai-map/style.scss`

- [x] Add failing assertions for pre-hydration action gating and a reload fallback, an announced offline status, visible cache readiness in About, and an extendable 10-second reset warning.
- [x] Add behavior assertions for one consistent inactivity timeout, scroll/focus activity, reduced-motion preview freeze, network/cache status, and cleanup of every new timer/listener.
- [x] Add a post-apply disabled state and “Applied” label contract.
- [x] Implement the minimum transient state and recovery UI inside the existing visual hierarchy, then run targeted suites to green.

### Task 5: Polish and verify the complete change set

**Files:**
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/view.js`
- Modify: `src/core-ai-map/style.scss`
- Generated: `build/core-ai-map/*`

- [x] Remove the retired home-indicator markup/style and any now-dead state helpers.
- [x] Run the latest-critique checklist independently against the final source.
- [x] Run `npm run test:unit -- --runInBand src/core-ai-map/render-contract.test.js src/core-ai-map/view.test.js src/core-ai-map/render.test.js src/core-ai-map/block.test.js src/core-ai-map/normalize.test.js`.
- [x] Run `npm run lint:js`, `npm run lint:css`, and `npm run build`.
- [x] Re-run the relevant tests against generated output, then run the Impeccable detector once on `src/core-ai-map/render.php`.
- [x] Report browser visual QA as unavailable under the repository’s public-HTTPS-only browser policy; do not substitute a locally launched browser.
