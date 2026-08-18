# AI Uses WordPress Flow Remediation Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the AI uses WordPress flow clearly teach a concrete booking-availability request, the WordPress boundary, Core versus plugin ownership, permission enforcement, and the returned result or refusal.

**Architecture:** Preserve the dynamic server-rendered block, canonical `block.json` defaults, exact-default migration system, fixed-stage map, and Interactivity API store. Extend existing story continuation and component-inspection mechanisms instead of introducing a tour subsystem. Keep the example illustrative: site/plugin code owns `bookings/get-availability`; Core owns the Abilities API contract; the MCP Adapter plugin translates at the boundary.

**Tech Stack:** WordPress dynamic block/PHP, `@wordpress/interactivity`, SCSS, Jest/jsdom, `@wordpress/scripts`.

**Execution note:** The worktree contains the uncommitted 3.2.4 implementation being refined. Work in place, preserve unrelated changes, and do not commit unless requested.

---

### Task 1: Lock the content and ownership contract

**Files:**
- Modify: `src/core-ai-map/block.test.js`
- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/view.test.js`

- [x] Add failing assertions for the booking-availability situation, outcome, narrative, takeaway, and participant roles.
- [x] Assert that the first flow offers a direct continuation to AI uses WordPress.
- [x] Assert explicit Core, plugin, outside-WordPress, and site/plugin ability ownership language.
- [x] Run the targeted suites and confirm failures describe only the missing contract.

### Task 2: Lock the transaction and guided-panel behavior

**Files:**
- Modify: `src/core-ai-map/render-contract.test.js`
- Modify: `src/core-ai-map/view.test.js`

- [x] Add failing renderer assertions for MCP call, example ability, result/refusal, panel progress, and panel continuation controls.
- [x] Add failing interaction assertions for assistant → MCP Adapter → Abilities API progression, announcements, final return, Escape, and updated focus restoration.
- [x] Add a reduced-motion assertion that the settled transaction remains semantically complete.
- [x] Run the targeted suites and observe the intended failures.

### Task 3: Implement canonical content and safe migrations

**Files:**
- Modify: `src/core-ai-map/block.json`
- Modify: `src/core-ai-map/render.php`

- [x] Update canonical story and participant-role defaults to one coherent booking example.
- [x] Add the first-flow continuation in the existing story layout.
- [x] Add an exact-default migration pass for every superseded value so authored custom copy remains untouched.
- [x] Update visible map strip/bridge labels to match the concrete transaction.
- [x] Run content and render contract tests to green before interaction work.

### Task 4: Implement the optional three-step panel sequence

**Files:**
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/view.js`
- Modify: `src/core-ai-map/style.scss`

- [x] Render progress and a contextual continuation only for participating AI uses WordPress panels.
- [x] Advance inspection through assistant, MCP Adapter, and Abilities API without clearing the selected flow.
- [x] Move focus to stable visible panel UI, announce each step, update the map-card return target, and preserve Close/Escape exits.
- [x] Return from the final panel to the settled flow and restore focus to the Abilities API card.
- [x] Run renderer and interaction tests to green.

### Task 5: Implement the transaction motion and reduced-motion equivalent

**Files:**
- Modify: `src/core-ai-map/render.php`
- Modify: `src/core-ai-map/style.scss`

- [x] Replace the abstract two-token swap with MCP call → Get availability → Available times or refusal.
- [x] Use one finite transform/opacity sequence and an immediately legible settled state.
- [x] Ensure the reduced-motion state shows all three semantic stages without relying on animation.
- [x] Check fixed-stage placement against existing cards, paths, story band, and controls.
- [x] Run style lint and relevant contract tests.

### Task 6: Polish, build, and verify

**Files:**
- Modify as needed: `README.md`, `readme.txt`, `PRODUCT.md`
- Generated: `build/core-ai-map/*`

- [x] Run the Impeccable detector once on the final UI source and resolve applicable findings.
- [x] Run the targeted unit suites, then the complete unit suite.
- [x] Run JavaScript lint, CSS lint, and the production build.
- [x] Re-run generated-output and unit checks after the build.
- [x] Review the final diff for scope, custom-copy preservation, accessibility, and stale abstract terminology.
- [x] Report public-shell reachability and the repository-required physical/browser QA gate honestly; do not launch a prohibited local browser.
