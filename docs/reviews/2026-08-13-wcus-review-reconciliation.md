# wcus.hperkins.com Review Reconciliation

Reviewed on 13 August 2026 against:

- the original `Review of wcus hperkins com (Core AI Living Block Map)`;
- the follow-up `Re-review — wcus hperkins com`;
- repository commit `54e0b0e` plus worktree setup commit `e5d3d46`;
- the live exhibit at 1418 × 828 in the Codex in-app browser.

## Outcome

The two reviews agree on the remaining user-facing defects. The follow-up also
confirms that the contrast and architecture-copy changes in `54e0b0e` are
correct, but exposes a release-identity problem that can leave earlier visitors
on the old 3.1.1 build.

This remediation release will be 3.1.2. It will include a fingerprinted
Playground plugin ZIP, explanatory boot copy, both geometry fixes, dimmed actor
cards in the neutral map, stronger deployment verification, and a booth
runbook. It will not deploy the site or clear any browser's stored data.

## Evidence-checked priority list

### P0 — implement before the next deployment

1. **Release identity and stale delivery are confirmed.** The plugin header,
   `CORE_AI_MAP_VERSION`, package metadata, block metadata, Blueprint metadata,
   service-worker cache name, and readmes all still identify 3.1.1. The
   Blueprint also requests the stable `./core-ai-map.zip` path. Version 3.1.2
   will update every release surface, and the Blueprint will request
   `./core-ai-map-3.1.2.zip`.
2. **Deployment verification is too weak.** The existing runbook checks status
   and content type but does not prove which plugin bytes arrived. The build
   manifest will record the plugin artifact's relative path, byte count, and
   SHA-256. The runbook will compare the deployed ZIP with the local artifact.
3. **Post-deploy site-data clearing is currently described as a one-off.** It
   will become an explicit every-deployment booth-browser step, followed by a
   fresh boot and build-identity verification.

### P1 — implement in the exhibit and kiosk shell

1. **The loader still gives no useful expectation.** `patchKioskIndex()`
   injects the Blueprint URL and hides Playground tools, but it does not replace
   the generic loading text. The shell will rewrite `Preparing WordPress` to
   `Building a real WordPress 7.0 site in your browser — no server, about 45 seconds.`
2. **The reviewed date overlaps the map hint.** Live measurement at 1418 × 828
   found a 4.21 × 14.07 px intersection. The brand flex spacing will be reduced
   enough to preserve the complete date without moving the centered hint.
3. **The About back button overlaps the persistent header.** Live measurement
   found a 132.33 × 43.66 px intersection with the brand. The button is not
   inside the 452.81 px-wide white dialog card. It will move into the card as
   its first focusable child and participate in normal flow.

### P2 — implement as a structural improvement

1. **The outside columns are empty in the neutral map.** All five actor elements
   have `hidden=true` immediately after `Add the blocks to the canvas`. They will
   remain visible at a deliberately dimmed opacity when no story is selected,
   while story selection retains the current member/sidecar filtering.
2. **Booth recovery and physical-device checks need one runbook.** The runbook
   will cover foreground cold/warm timing, the visible-only 60-second reset,
   reduced motion, wired networking, disabled sleep, prewarming, crash-dialog
   recovery, and post-deploy storage clearing.

## Already resolved — verify, do not rework

- Muted text now uses `--core-ai-text-muted: #646970`; dashed rules retain
  `--core-ai-line-strong: #a7aaad`. The follow-up measured zero contrast
  failures across 39 text nodes.
- The provider, Connectors, and story 03 copy revisions are present in source,
  generated assets, and the live exhibit.
- Focus trapping, Escape handling, focus restoration, hidden-panel semantics,
  reduced-motion handling, local QR destinations, and caching headers remain
  correct.
- The Cloudflare cache split is correct: fingerprinted `/assets/*` is immutable,
  while the root, worker, remote shell, and Blueprint paths revalidate.

## Valid recommendations that remain manual

- Time cold and warm boots on the actual booth hardware with the browser truly
  foregrounded. Automated hidden-tab timing is not a trustworthy hardware
  acceptance result.
- Verify the 60-second inactivity reset while `document.visibilityState` is
  `visible`.
- Verify the reduced-motion experience with the operating-system setting on.
- Clear site data on the booth browser after deployment, then perform a fresh
  cold boot and a second warm boot.
- Keep the kiosk foregrounded, disable sleep, prefer wired networking, and keep
  a reload/clear-data recovery card with the hardware.

These checks are documented by this branch but cannot be truthfully marked as
performed from the development machine.

## Not included in 3.1.2

- **Static landing page:** conditional on whether the URL is intended for broad
  sharing. Moving the live exhibit off `/` changes the product entry flow and
  needs an explicit product/URL decision.
- **Blueprint editor bundle removal:** the upstream Playground application
  requests those chunks even though the kiosk hides the editor UI. Deleting
  requested files from the copied artifact would risk boot failures; removing
  them safely requires a custom upstream Playground build. The reviews also
  establish that this approximately 458 KB reduction does not address the
  45-second compute-bound boot.
- **Persisted `site-slug`:** the original review reproduced an incomplete saved
  Playground. It must not be enabled for the booth.
- **Playground crash-dialog replacement:** that dialog is owned by the upstream
  runtime. This release mitigates the failure operationally through prewarming,
  sleep/network guidance, and a reload/clear-data recovery procedure.
- **Live deployment:** building and validating deployable artifacts is in scope;
  publishing to Cloudflare Pages is a separate external side effect.

## Verification baseline note

The Windows checkout inherited `core.autocrlf=true` while `.editorconfig`
requires LF. That caused JavaScript lint failures, a QR byte mismatch, and a
line-sensitive service-worker test failure before remediation began. Native PHP
was also absent, so PHP-backed Jest helpers could not start. The implementation
plan adds an LF checkout rule and documents the PHP 8.3 CLI prerequisite. A
portable PHP 8.3 runtime is used only for this worktree's verification.
