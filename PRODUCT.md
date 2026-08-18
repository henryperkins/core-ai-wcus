# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary visitor is a WordCamp attendee standing at the booth: **WordPress-fluent
and new to AI**. They already know plugins, blocks, hooks, and the editor. What they
do not know is what Core AI is made of, which pieces are Core and which are plugins,
and where WordPress stops and an outside service begins. They arrive on their feet,
have a few minutes at most, are not accompanied by a presenter, and leave whenever
they choose. The exhibit is self-guided by requirement, not by preference.

The release operator is a second, non-visitor audience: they build the Playground
artifact, verify its identity on both public hostnames, and perform the physical
booth sign-off on the real device. Their surface is procedural and factual.

A site owner placing the block in the editor is a third audience. The block exposes
editable visitor copy but no arbitrary QR image or URL fields.

## Product Purpose

One interactive exhibit that explains how the WordPress Core AI building blocks fit
together — as open, provider-neutral parts rather than one AI product or one model
built into WordPress.

It succeeds when a first-time visitor, after following exactly **one** flow, can
answer three questions:

1. What action did I take?
2. What did the movement in the diagram represent?
3. What did the component I inspected contribute?

Four flows carry that lesson:

1. **WordPress uses AI** — a feature inside WordPress needs an AI-generated result.
2. **AI uses WordPress** — a person asks an outside assistant for available booking
   times. The MCP Adapter plugin translates the request, and Core's Abilities API
   validates the input and permission before WordPress returns times or refuses it.
3. **An agent learns WordPress** — Agent Skills → coding agent → a WordPress task. This
   happens outside the site; nothing inside WordPress runs.
4. **WordPress tests the result** — code written by an agent is judged by WP-Bench.

It is explicitly not a glossary, an onboarding modal, a spotlight tour, coach marks,
a forced walkthrough, or a long-form documentation surface.

## Positioning

The exhibit is built out of the thing it explains: one dynamic, server-rendered
`core-ai/core-ai-map` block enhanced by the WordPress Interactivity API, running on a
real WordPress — in the visitor's own browser via Playground for the static
deployment. A slide deck or a docs page could carry the same diagram; neither can
demonstrate the architecture by being an instance of it.

Its teaching mechanism is a participation contract rather than a legend to decode:
**highlighted means participating and tappable**. One moving part at a time, one
golden path per flow, and technical depth held back in contextual panels reached by
tapping a component that is already visibly part of the story.

It speaks for the WordPress AI team as an official Core AI artifact, and it is
provider-neutral by construction.

## Operating Context

**Current status: pre-booth hardening.** The exhibit has not yet faced visitors.
Remaining work is factual accuracy, release gates, and physical device sign-off.

- A landscape, full-screen, touch kiosk. Authored stage is 1366 × 1024. 1024 × 768 is
  a compatibility view, not a fully supported touch layout: the stage scales by 0.7496
  there, so authored control sizes render at three quarters. See Accessibility &
  Inclusion for the figures.
- Attract loop runs assemble → path → signal → caption → release. Reduced-motion
  visitors see a settled preview. After engagement, motion settles rather than looping.
  Sixty seconds of inactivity returns the kiosk to the attract screen after a visible,
  extendable ten-second warning.
- Two delivery forms. (a) The plugin installed on a WordPress site, on a full-width
  template at a non-home/root permalink. (b) A browser-executed WordPress Playground
  artifact on Cloudflare Pages — `core-ai-living-block-map.pages.dev` and
  `wcus.hperkins.com` (CNAME in DNS-only mode; the orange-cloud proxy breaks Pages
  routing). Playground pins the `beta` channel to reach a WordPress 7.1 release
  candidate, disables network access, and keeps each visitor's state in that
  visitor's browser.
- The booth site `wcus-ai/wcus-ai.github.io` introduces the exhibit with a static
  poster and an explicit external link. No iframe, no embedded kiosk, no imitation of
  the interaction, and no runtime data flow between the two repositories. The booth
  build requests no kiosk or Playground asset before the visitor activates the link.
- Production is deployed manually from a verified `dist-playground/`. Automatic Git
  production and preview deployments are off, because the repository root is not a
  deployable Playground artifact.
- A deployment is verified by artifact identity — byte count and SHA-256 of the
  fingerprinted plugin ZIP compared against the build manifest on both public
  hostnames — never by what appears on screen.
- The booth gate is a human, physical-device sign-off: clear site data, Cache Storage,
  OPFS, and service workers; foreground cold and warm boots; the sixty-second reset;
  the operating system's reduced-motion setting; external power, disabled display
  sleep, wired network, no persisted Playground `site-slug`. Agents must not imitate
  it with a local browser.
- Agent browser work uses the globally configured Browser Run MCP service against a
  publicly reachable HTTPS URL. It cannot reach localhost or private networks, and no
  local browser engine may be installed or launched for an agent task. With no preview
  URL, the correct outcome is to record the blocker and stop the browser portion.

## Capabilities and Constraints

- One block, `core-ai/core-ai-map`: dynamic, server-rendered, one per page, full width.
- Requires WordPress 7.0 and PHP 7.4; tested to 7.1. The unit suite additionally needs
  a PHP 8.3 CLI named `php` on `PATH`, because several contract tests execute the
  server renderer directly.
- A component panel answers, in this order: flow-to-component breadcrumb, **Its role
  in this flow** (with the structured Receives / Does / Passes on rows), **Why that
  matters**, component title, fixed **Where** and **Core status** facts, **What it is**,
  **Under the hood**, and **Keep exploring** with canonical link and QR. Actor and
  transient-layer panels are shorter and carry no fabricated implementation notes or
  QR codes. With no flow selected, the breadcrumb and role sections stay hidden.
- **AI uses WordPress** consistently follows the illustrative
  `bookings/get-availability` ability from MCP call to available times or refusal.
  Its participating panels add an optional Assistant → MCP Adapter → Abilities API
  sequence with visible progress; Back and Escape remain available throughout.
- The Abilities API inspector has dedicated tabs. WP-Bench has a five-stage run loop
  from task and sandbox through checks to evidence, and is a test bench rather than a
  live request path. The MCP Adapter is labelled **WordPress plugin · not in Core**.
- Eight committed canonical QR SVGs with fixed, selectable destinations. There are no
  arbitrary editable QR-image or URL fields, by design.
- Serialized cards, actors, stories, and panels merge with current canonical defaults
  by `id`, so a release can supply new structure to an already-published block.
  User-authored copy fields stay editable rather than being overwritten. Only exact
  known legacy defaults migrate.
- Offline support is scoped to a single non-root kiosk permalink and disabled on the
  home/root URL, so the worker cannot control unrelated site pages. It requires HTTPS.
  Turn Offline mode off and load the kiosk page once while online before deactivating
  or deleting the plugin.
- `build/` is committed so the ZIP installs without Node.js on the target site.
  GPL-2.0-or-later. EB Garamond, IBM Plex Mono, and Inter ship as local WOFF2 files
  with their license texts in `assets/fonts/`.
- Every volatile technical claim is audited against current primary documentation
  before a release is considered complete, in this source priority: current WordPress
  developer documentation and Core dev notes; current official WordPress repositories
  and release files; the current WordPress.org plugin listing; and only then the May
  2026 speaker guide, for framing alone. Prerelease behavior is stated as scheduled or
  present in a release candidate — never as already shipped. Numeric counts that
  current project documentation does not make a durable public contract are removed.
- Known upcoming change: WordPress 7.1 ships 19 August 2026. The Playground pin moves
  from `beta` to `7.1` after that date. The `beta` channel moves upstream while a
  built artifact does not, so a deployed booth stays on whatever RC its build source
  carried.

## Brand Commitments

- Name: **Core AI Living Block Map**. Block name `core-ai/core-ai-map`. Web-app short
  name "Living Block Map".
- The exhibit speaks for the WordPress AI team as an **official Core AI artifact**.
  The "The WordPress Contributors" attribution is correct as written, and the exhibit
  may carry that authority.
- Provider-neutral. New provider-specific branding on the map is an explicit non-goal.
- Voice: precise and non-overclaiming. The repository consistently states what a check
  does *not* prove — local checks prove local source and package state, artifact
  identity proves the deployment, and only a person on the device proves the booth.
  Preserve that habit; it is part of the exhibit's credibility, not boilerplate.
- Every pull request for this work carries the AI-assistance disclosure: assistance
  yes, tool named, used for implementation, tests, and deployment preparation, final
  work human-reviewed with the human contributor responsible for it.
- The incumbent visual world is not up for replacement. The 3.2.0 fixed-stage visual
  system, geometry, type system, and flow-first state model are preserved; work on
  this exhibit is refinement, not redesign.

## Evidence on Hand

- Eight canonical destinations, fixed as QR targets and committed under `assets/qr/`:
  the Abilities API reference, `wp_ai_client_prompt()`, the Connectors API Make post,
  `wordpress.org/plugins/ai`, `WordPress/mcp-adapter`, `WordPress/wp-bench`, and
  `WordPress/agent-skills`, plus the Core AI question form shown in About.
- The WordPress AI speaker guide (make.wordpress.org/ai handbook, last updated
  7 May 2026) is the explanatory framework only — what a project is, why it matters,
  what to demonstrate. It is never a project-status source.
- Approved design record:
  `docs/superpowers/specs/2026-08-14-living-block-map-pedagogical-model-design.md`.
  Remediation plans under `docs/superpowers/plans/`; review reconciliation under
  `docs/reviews/`.
- Visitor copy is held by contract tests, not only by the renderer:
  `src/core-ai-map/render-contract.test.js`, `view.test.js`, `render.test.js`,
  `normalize.test.js`.
- Absences that future work must not fabricate: no testimonials, named customers,
  visitor counts, benchmarks, or usage data; no recorded physical iPad, Safari,
  Guided Access, booth-network, or real QR-scan sign-off; no deployment claim; no
  pricing or licensing beyond GPL-2.0-or-later.

## Product Principles

1. **Highlighted means participating and tappable.** Every participant — including the
   outside actors and the transient provider layer — is highlighted, enabled, cued,
   and opens a panel. No numbered step is a dead tap, and nothing dimmed pretends to
   be interactive.
2. **One moving part at a time.** One golden path per flow. Depth waits in a
   contextual panel; it never crowds the canvas.
3. **Teach without a presenter.** Every interface state carries its own instruction,
   because the visitor is standing, alone, and free to leave.
4. **Reduced motion is parity, not a fallback.** The same situation, path, conclusion,
   participants, and panel content must survive with animation switched off.
5. **Claim only what was verified, and name what was not.** State the boundary of every
   check rather than letting a green result imply more than it proved.

## Accessibility & Inclusion

- Reduced motion conveys the same premise, path, conclusion, participants, and panel
  content without animated dependency; the flow enters its settled state immediately
  and shows situation and takeaway together.
- Visible focus throughout. Background content is inert while a detail panel is open,
  Escape closes it, and focus returns to the card that opened it.
- All primary and secondary actions are native buttons. Non-participants use the
  native `disabled` state and receive no misleading accessible action label.
- Controls are authored at 68 logical pixels in the story rail, 60 in the header and
  the panel, dialog and tab surfaces, and 44 in nested controls such as Apply. The
  stage transform carries those to 51, 45 and 33 at 1024 × 768, and the About footnote
  from 34 to 25. Every control meets SC 2.5.8 by size at both sizes. Only the Apply
  control and the About footnote fall below SC 2.5.5 at 1024 × 768 — everything else
  clears it, the 60-pixel class by less than a pixel — which is why that size is a
  compatibility view rather than a fully supported touch layout.
- The visual key uses visible text. Its line and card samples are decorative and
  hidden from assistive technology, so solid, dashed, and dimmed never acquire
  different meanings between the welcome screen and the map.
- Assistive announcements identify the flow and its situation on selection, then
  announce the takeaway when an animated flow settles.
- The fixed stage retains no horizontal or nested canvas scrolling at either supported
  landscape size.
- Safari, Add to Home Screen, Guided Access, and physical iPad touch and landscape
  acceptance remain separate human on-device gates.
