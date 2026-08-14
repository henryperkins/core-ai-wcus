# Playground Loader Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the approved cold-load copy from the first accessible loading
state through Playground's nested runtime and prove it in a real cold frame.

**Architecture:** Generate a kiosk-owned accessible outer loading screen, keep
the upstream React root inert until the Living Block Map is ready, and patch the
exact JavaScript module referenced by `remote.html` under a content-derived
filename. Remove the outer-document text observer because iframe DOM and
progress state are separate ownership boundaries.

**Tech Stack:** Node.js ESM, `node:test`, WordPress Playground static assets,
Cloudflare Pages static routing, Browser Run MCP agent verification, and
retained Playwright callback assertions for non-agent harnesses.

## Global Constraints

- Exact copy:
    `Building a real WordPress 7.0 site in your browser — no server, about 45 seconds.`
- Preserve the literal `/remote.html` Pages rewrite and its 200/no-Location
    behavior.
- Preserve the pinned WordPress 7.0, PHP 8.3, Blueprint, and plugin artifact.
- Fail the build if the pinned upstream loader contract changes unexpectedly.
- Restore the upstream root after a bounded timeout so boot failures remain
    diagnosable.
- Do not modify, delete, or stage existing untracked artifacts.
- Do not commit, push, or deploy without separate authorization.
- Agent-run browser verification must use Browser Run against a public HTTPS
    preview, prefer accessibility snapshots, record private run/artifact
    references, and call `browser_close` on success or failure. If no preview
    URL exists, report that blocker instead of launching a local browser.

---

### Task 1: Protect the runtime loader build contract

**Files:**

- Modify: `tests/playground/cloudflare-build.test.mjs`
- Modify: `scripts/build-cloudflare-playground.mjs`

**Interfaces:**

- Consumes: `remote.html`, its `/assets/wordpress-*.js` module, and
    `assets-required-for-offline-mode.json`.
- Produces: a fingerprinted patched module, rewritten remote HTML, and
    rewritten offline manifest.

- [x] **Step 1: Extend the minimal Playground fixture with a real remote
        module reference**

Create `assets/wordpress-fixture.js` containing one `Preparing WordPress`
caption, make `remote.html` load it, and list it in the offline manifest.

- [x] **Step 2: Add build-result assertions before implementation**

Assert that the output module contains the exact approved copy, its filename
contains the patched-content hash, `remote.html` and the offline manifest point
to that filename, and `assets/wordpress-fixture.js` no longer exists.

- [x] **Step 3: Run the focused test and confirm the expected failure**

Run: `npm run test:playground`

Expected: the loader fingerprint/reference assertions fail because the build
still copies the upstream module unchanged.

- [x] **Step 4: Implement the minimal runtime patch**

Export the two caption constants and a pure loader-module patch helper. During
the artifact build, resolve the exact module from `remote.html`, require one
upstream caption and one manifest entry, replace the caption, hash the patched
bytes, write the fingerprinted module, update both references, and remove the
copied original. Generate the accessible outer screen, inert/root handoff, and
bounded fallback in `index.html`. Remove the outer `MutationObserver` bootstrap.

- [x] **Step 5: Run the focused test and confirm it passes**

Run: `npm run test:playground`

Expected: all Playground tests pass and the fixture proves the new asset graph.

### Task 2: Verify the actual accessible runtime surface

**Files:**

- Create: `tests/browser/playground-loader.js`
- Modify: `README.md`

**Interfaces:**

- Consumes: a publicly reachable HTTPS preview of the exact `dist-playground`
    Pages artifact.
- Produces: Browser Run evidence containing the runtime frame URL, accessible
    heading text, live-region text, browser/network errors, and private run and
    artifact references.

- [x] **Step 1: Write the browser regression**

Using Browser Run, navigate a cache-busted public HTTPS preview root and require
the kiosk-owned heading/status while the React root is absent from the
accessibility tree. Then wait for `/remote.html`, require the same
heading/status there, and verify the outer loader closes and restores the root
when the map is ready. Reject any exposed `Preparing WordPress`, HTTP error,
console error, page error, or failed request. Use `browser_snapshot` for these
control and accessibility assertions, retain the callback's assertions as the
contract, and call `browser_close` in final cleanup.

- [x] **Step 2: Document the cold-loader command and evidence boundary**

Add the Browser Run procedure and public-preview prerequisite beside
`npm run test:playground`. State that the Node suite proves the artifact graph
while Browser Run proves the accessible runtime surface. Record returned run
IDs and artifact references without committing their private bodies.

- [x] **Step 3: Run against the pre-fix artifact and confirm failure**

Expected: the runtime frame exposes `Preparing WordPress`, demonstrating that
the browser verifier catches the production defect.

- [x] **Step 4: Rebuild and rerun against the patched artifact**

Expected: the heading and status expose the exact approved text without an
outer-DOM rewrite.

### Task 3: Complete release-quality verification

**Files:**

- Verify only; no additional files are expected.

**Interfaces:**

- Consumes: the final source diff and generated local artifact.
- Produces: fresh evidence for source quality, artifact integrity, routing,
    and cold-browser behavior.

- [x] **Step 1: Run source gates**

Run `npm run lint:js -- --no-fix`, `npm run lint:css`,
`npm run test:unit -- --runInBand`, and `npm run test:playground`.

- [x] **Step 2: Build release artifacts**

Run `npm run build`, `npm run plugin-zip`, and `npm run build:playground` with
the pinned official Playground source directory.

- [x] **Step 3: Verify routing and browser behavior**

Require `/remote.html` to return 200 with no `Location`, then use Browser Run
against the exact public HTTPS preview for the loader and kiosk acceptance
assertions at 1366×1024 and 1024×768. Prefer accessibility snapshots for
controls, use screenshots only for visual assertions, record the private run
and artifact references, and call `browser_close` in final cleanup. Without a
preview URL, report this browser gate as blocked rather than using local
Playwright.

- [x] **Step 4: Inspect the final diff and repository status**

Require `git diff --check` to pass and confirm all pre-existing untracked
artifacts remain unmodified and unstaged.
