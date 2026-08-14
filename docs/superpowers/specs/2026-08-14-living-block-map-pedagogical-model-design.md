# Living Block Map Pedagogical Model Design

**Status:** Approved

**Date:** August 14, 2026

**Primary repository:** `henryperkins/core-ai-wcus`

**Booth-site integration:** `wcus-ai/wcus-ai.github.io` pull request 9

## Objective

Turn the Core AI Living Block Map into a self-guided visual explanation that
lets a first-time visitor answer three questions after following one flow:

1. What action did I take?
2. What did the movement in the diagram represent?
3. What did the component I inspected contribute?

The exhibit must teach the architecture without becoming a glossary, a guided
tour, or a long-form documentation surface. It must establish one broad idea,
open with one understandable flow, explain the active visual grammar, and move
technical depth into contextual component panels.

The booth site must introduce the exhibit as an interactive explanation and
send the visitor to its dedicated full-screen deployment. It must not embed or
imitate the kiosk.

## Evidence and explanatory framework

The content model comes from the WordPress AI speaker guide:

- Explain Core AI as open, provider-neutral building blocks rather than one AI
  product or one model built into WordPress.
- Explain each project through what it is, why it matters, and what to
  demonstrate.
- Choose one golden path and keep a live demonstration to one moving part at a
  time.

Source:

- <https://make.wordpress.org/ai/handbook/resources-and-links/guide-to-talking-at-wordpress-meetups-and-wordcamps-about-the-core-ai-projects/>

The guide was last updated May 7, 2026. It is an explanatory framework, not a
current project-status source. Shipping versions, release dates, protocol
support, counts, and implementation behavior must be checked against current
primary documentation before exhibit copy changes.

## Decision

Use a synchronized, additive two-repository refinement.

In the Living Block Map repository:

- Preserve the incumbent 3.2.0 fixed-stage visual system and flow-first state
  model.
- Add the missing orientation, complete interaction grammar, visual key,
  phase-aware situation and conclusion, flow outcome labels, and exact panel
  hierarchy.
- Preserve the existing participant contract, focus restoration, replay
  behavior, neutral component browser, and full-screen kiosk architecture.
- Audit volatile factual copy against current primary sources.

In booth-site pull request 9:

- Preserve the static poster, external link, startup disclosure, responsive
  layout, analytics tuple, and no-embed architecture.
- Update only the visitor-facing promise and the files that contractually
  document or test that promise.

Do not introduce a shared cross-repository manifest. Three teaser strings do
not justify a network or build dependency between the sites.

## Non-goals

- No glossary.
- No onboarding modal, spotlight tour, coach marks, or forced walkthrough.
- No inline booth-site iframe, mock map, or duplicated kiosk interaction.
- No new provider-specific branding on the map.
- No redesign of the map's visual identity, geometry system, or type system.
- No unrelated refactor of the WordPress block, Astro site, analytics worker,
  or deployment topology.
- No claim that automated checks prove physical iPad, Safari, Guided Access,
  booth-network, or external-tab behavior.

## Repositories and ownership

The Living Block Map remains the source of truth for exhibit behavior and
technical content. Pull request 9 remains the source of truth for how the WCUS
site introduces and hands off to the exhibit.

There is no runtime data flow between the repositories:

```text
WCUS project page
    -> static teaser poster and concise promise
    -> explicit external link
    -> dedicated Living Block Map deployment
    -> welcome orientation
    -> one selected flow
    -> contextual component inspection
```

The booth-site build must not request WordPress Playground or kiosk assets
before the visitor activates the external link.

## Living Block Map interaction model

### State sequence

The existing `screen`, `story`, `inspect`, and `flowPhase` state remains the
foundation. The visitor-visible sequence is:

```text
Welcome
    -> Explore the first flow
        -> Map / WordPress uses AI / moving
        -> Map / WordPress uses AI / settled
        -> Inspect a participating component
        -> Return to the same settled flow
    -> Browse all components
        -> Map / no selected flow
        -> Choose any flow or inspect any component
```

Selecting a different flow changes `story` and reruns the flow. Selecting the
already active flow replays it. Replay never clears the selection or returns to
the welcome screen.

Opening a component sets `screen` to `inspect` but preserves `story`. Closing
the panel restores `screen` to `map`, leaves the flow assembled, keeps its
conclusion visible, and restores focus to the component that opened the panel.

### Welcome orientation

The welcome card remains on top of the existing animated attract canvas. It is
the only broad explanatory surface.

Use this heading:

> What is WordPress Core AI?

Use this orientation copy:

> WordPress Core AI is a set of open building blocks that let WordPress use AI
> services and work with outside assistants—without tying WordPress to one
> provider.
>
> Explore four flows to see what happens inside WordPress, what happens outside
> it, and how the projects connect.

The welcome card then presents a compact three-step instruction row:

1. **Choose a flow**
2. **Follow the numbered path**
3. **Tap a highlighted component to see its role**

Below the instruction row, render an accessible visual key with real line and
card samples plus visible text:

- **Solid arrow:** active request or work
- **Dashed line:** configuration or supporting information
- **Dimmed component:** not part of this flow

The primary action is:

> Explore the first flow

It opens the first configured story, currently `uses-ai`, and focuses the card
carrying step 1 after the assembled DOM is available.

The welcome surface also provides a visually quieter secondary action:

> Browse all components

It opens the neutral map with `story` empty and focuses the first available
component. This is an optional escape hatch for experienced and returning
visitors; it must not compete visually with the golden path.

The complete instruction lives in the welcome card, so the top-bar guidance is
hidden on the attract screen rather than duplicating it.

### Active-flow guidance and visual key

When a flow is selected, the top-bar instruction is:

> Follow %1$s. Highlighted components take part in this flow. Tap one to learn
> what it contributes.

`%1$s` is the authored numbered run such as `1 → 2 → 3`.

The visual key remains available in a compact, non-interactive canvas position
while the map is open. It must not overlap a card, path, zone label, story
caption, flow control, or the component detail panel at the supported stage
sizes. The welcome and map legends share markup semantics and visual tokens so
solid, dashed, and dimmed never acquire different meanings.

### Situation and conclusion

Each selected flow has two pieces of pedagogical copy:

- `situation`: why this movement is about to happen.
- `takeaway`: what the completed path demonstrates.

The situation appears immediately when the flow is selected and remains
visible. The takeaway is initially hidden while `flowPhase` is `transition` and
appears under **What this flow shows** when the path settles. After settlement,
both situation and takeaway stay visible beside the assembled diagram.

This progression must not rely on animation. When reduced motion is active,
the flow enters the settled state immediately and shows the situation and
takeaway together. Assistive announcements identify the flow and situation on
selection, then announce the takeaway when an animated flow settles.

Use these situations:

| Flow | Situation |
| --- | --- |
| WordPress uses AI | A feature inside WordPress needs an AI-generated result. |
| AI uses WordPress | An outside assistant asks WordPress to perform an allowed action. |
| An agent learns WordPress | A coding agent receives WordPress-specific guidance before writing code. |
| WordPress tests the result | Code written by an agent needs to be tested against real WordPress behavior. |

Use these takeaways:

| Flow | What this flow shows |
| --- | --- |
| WordPress uses AI | A WordPress feature uses a common AI interface instead of integrating directly with every provider. Provider configuration supports the request, while the AI service remains outside WordPress. |
| AI uses WordPress | The assistant does not bypass WordPress. The MCP Adapter translates the request, and the selected ability still applies WordPress permissions. |
| An agent learns WordPress | Agent Skills changes the information available to the coding agent. Nothing runs on the WordPress site during this flow. |
| WordPress tests the result | The generated code runs in a disposable WordPress environment and is judged by WordPress tests, not by another model's opinion. |

The fixed 1366 by 1024 stage uses a two-region story band so the persistent
situation and conclusion fit without obscuring the map. At 1024 by 768 the
stage continues to scale as one authored composition; content must not clip or
require an additional scroll region.

### Flow navigation

The bottom rail remains the primary navigation on the map screen. Its visible
label is state-aware:

- No selected flow: **Choose a flow**
- Selected flow: **Choose another flow**

Each button renders its existing sequence number, official title, and a concise
outcome subtitle:

| Flow | Outcome |
| --- | --- |
| WordPress uses AI | WordPress requests an AI result |
| AI uses WordPress | An assistant requests a WordPress action |
| An agent learns WordPress | A coding agent receives WordPress guidance |
| WordPress tests the result | WordPress evaluates generated code |

The controls must continue to read as navigation rather than five content
cards. Titles and outcomes use a compact stacked label inside the existing
rail. The active button remains visually distinct and carries
`aria-pressed="true"`.

### Participation contract

The rule remains:

> Highlighted means participating and tappable.

For a selected flow:

- Every member, sidecar, external actor, and transient provider layer listed as
  a participant is highlighted, enabled, given the same tap cue, and connected
  to a contextual panel.
- Every nonparticipant is dimmed, disabled, and carries no tap cue.

This includes:

- AI assistant
- Coding agent
- External AI service
- A WordPress task
- AI provider plugin

In Browse all components mode, all components are fully visible and tappable,
but none shows the flow-specific tap cue because no story supplies a role.

### Component-panel hierarchy

The existing contextual panels remain a right-side region. Their visible
content order is:

1. Flow-to-component breadcrumb
2. **Its role in this flow**
3. **Why that matters**
4. Component title and **What it is**
5. **Under the hood**
6. **Keep exploring** with canonical link and QR code

Keep the structured `Receives`, `Does`, and `Passes on` rows under **Its role in
this flow**. They communicate movement more clearly than a single dense
paragraph. The existing contextual `lesson` supplies **Why that matters**.

Rename the existing headings:

| Current | New |
| --- | --- |
| What this tells you | Why that matters |
| What this component is | What it is |
| Technical detail | Under the hood |
| Scan to continue / continuation language | Keep exploring |

Actor and transient-layer panels remain shorter. They still begin with the
breadcrumb, role, why-it-matters lesson, title, and definition. They do not
need fabricated implementation notes or QR codes.

When no flow is selected, the breadcrumb and role-specific sections remain
hidden and the panel begins with the component title and general definition.

## Content schema and migration

Extend each story default with:

- `situation`
- `outcome`

Keep `copy` as a compatibility field for previously authored
blocks and attract-preview captions. New rendering must use `situation` for the
flow premise and `takeaway` for the settled conclusion. This work does not
remove or deprecate `copy`; any later removal requires a separately approved
design.

Add separate labels for the empty and selected rail states. Do not encode
English conditionals in JavaScript when the strings belong in translatable
server context.

The scalar welcome defaults also change. Existing published blocks can contain
serialized the previous `title`, `intro`, and `prompt`, so rendering must
migrate only exact known legacy defaults:

- The former question heading migrates to the new orientation heading.
- The former single-sentence instruction migrates to the new orientation
  copy.
- The existing `Explore the first flow` prompt remains unchanged.

Any custom editor-authored scalar or story value must be preserved. The
existing defaults-first, saved-values-second merge behavior must provide new
story fields to older blocks without replacing unrelated customization.

Update the block fixture or normalization contract only where the registered
schema requires it. Do not make the fixture a second source of visitor copy.

## Accessibility and failure behavior

- All primary and secondary actions remain native buttons.
- The visual key uses visible text; its samples are decorative and hidden from
  assistive technology.
- Flow buttons keep native focus, `aria-pressed`, and minimum kiosk touch
  targets.
- Disabled nonparticipants use the native `disabled` state and receive no
  misleading accessible action label.
- Opening a panel moves focus into it; closing restores focus to the opening
  card.
- Reduced motion shows the same situation, path, conclusion, participants, and
  panel content without animated dependency.
- Replaying or switching flows cancels old timers so a stale flow cannot reveal
  a conclusion in the new flow.
- Reset and inactivity behavior continue to clear flow timers and return to the
  welcome screen.
- If `situation` or `outcome` is unavailable after the registered defaults and
  saved values are merged, omit only that text region and its heading. Never
  expose a placeholder or an empty heading.
- The fixed stage must retain no horizontal or nested canvas scrolling at the
  two supported landscape sizes.

## Current-source factual audit

Before implementation copy is considered complete, audit every volatile claim
in `src/core-ai-map/block.json` and the hard-coded panel material in
`src/core-ai-map/render.php`.

Use this source priority:

1. Current WordPress developer documentation and Core dev notes
2. Current official WordPress organization repositories and release files
3. Current WordPress.org plugin listing
4. The May 2026 speaker guide only for explanatory framing

At minimum, verify:

- Abilities API availability and behavior
- AI Client availability, provider routing, and JavaScript limitations
- Connectors behavior and version status
- MCP Adapter installation form, transports, and supported protocol version
- AI plugin name, minimum WordPress version, and current experiments
- WP-Bench execution model, runtime version, and any numeric test counts
- Agent Skills repository ownership, contents, and install contexts
- WordPress 7.1 release status on the day the copy is finalized

Confirmed prerelease material must say that it is scheduled or present in the
current release candidate. Do not write future behavior as already shipped.
Remove volatile numeric counts when the current primary project documentation
does not make them a durable public contract.

Set `reviewedDate` to the date this audit is completed. Keep the exhibit's
runtime version statement separate from the status of the latest WordPress
release.

Current source starting points:

- <https://developer.wordpress.org/apis/abilities-api/>
- <https://developer.wordpress.org/reference/functions/wp_ai_client_prompt/>
- <https://make.wordpress.org/core/2026/03/18/introducing-the-connectors-api-in-wordpress-7-0/>
- <https://github.com/WordPress/mcp-adapter>
- <https://wordpress.org/plugins/ai/>
- <https://github.com/WordPress/wp-bench>
- <https://github.com/WordPress/agent-skills>
- <https://make.wordpress.org/core/7-1/>

## Booth-site pull request 9

Pull request:

- <https://github.com/wcus-ai/wcus-ai.github.io/pull/9>

Preserve its existing integration architecture:

- Static 1366 by 1024 WebP poster
- No iframe or embedded kiosk
- No new client-side script
- Lazy loading and asynchronous decoding
- Separate-tab link with `noopener noreferrer`
- Existing `click_outbound / site / living-block-map` analytics tuple
- Visible WordPress Playground startup and landscape disclosure
- Responsive WCUS design-system treatment

Replace the visible teaser promise with:

**Heading**

> See how WordPress and AI connect

**Description**

> Choose from four interactive flows. Follow the numbered path, then tap a
> highlighted component to understand the role it plays.

**CTA**

> Explore the Living Block Map

Keep the existing operational disclosure:

> Runs a real WordPress 7.0 site in your browser. The first load can take a
> minute or more. Best viewed in landscape.

Update the following pull-request files so code, contract tests, and review
evidence agree:

- `src/components/LivingBlockMapTeaser.astro`
- `tests/living-block-map-teaser.test.ts`
- `docs/superpowers/specs/2026-08-14-living-block-map-teaser-design.md`
- `design-qa.md`

Do not change the poster, destination URL, tracking vocabulary, global tokens,
or responsive layout unless rendered verification proves the revised heading
or CTA causes a concrete wrapping or overflow defect.

## Living Block Map implementation surfaces

Source changes:

- `src/core-ai-map/block.json`
- `src/core-ai-map/render.php`
- `src/core-ai-map/view.js`
- `src/core-ai-map/style.scss`
- focused unit and render-contract tests under `src/core-ai-map/`
- release documentation and metadata

Generated `build/` output is updated only after source checks pass. The release
is a backward-compatible 3.2.1 refinement of the 3.2.0 flow-first model. All
plugin/package/readme identities must move together if a release artifact is
created.

The service-worker architecture, Playground hosting model, QR-generation
mechanism, and booth-site analytics worker are out of scope and remain
unchanged.

## Test strategy

Implementation follows test-driven development. Each behavior change begins
with a focused failing test that fails because the old behavior is still
present.

### Living Block Map automated checks

Add or update tests for:

- Exact welcome heading, orientation, instructions, primary action, secondary
  action, and visual-key labels
- Primary entry selecting `uses-ai` and focusing step 1
- Secondary entry opening the neutral component browser
- Exact selected-flow instruction with the authored number sequence
- Situation visibility during transition
- Takeaway visibility only after animated settlement
- Situation and takeaway visibility together in reduced motion
- Dynamic `Choose a flow` and `Choose another flow` labels
- All four outcome subtitles
- Replay retaining story selection and rerunning the current path
- Stale flow timers being cleared on replay, flow switch, reset, and teardown
- Participant highlighting, enabling, cueing, and accessible action names
- Nonparticipant dimming, disabling, and absence of a tap cue
- Actor and transient provider panels obeying the same contextual contract
- Panel breadcrumb, heading order, preserved story, and focus restoration
- Browse-mode panel behavior without a contextual role
- Exact-default migration without overwriting custom authored values
- Prerelease language and reviewed-date contract where deterministic

Run the repository's unit, lint, format, build, Playground artifact, plugin ZIP,
and artifact verification checks required by its release documentation.

### Living Block Map rendered checks

Validate at minimum:

- 1366 by 1024 target landscape
- 1024 by 768 compatibility landscape
- Reduced motion at a supported landscape size

Exercise this interaction loop:

```text
Welcome
-> Explore the first flow
-> observe situation and moving path
-> observe settled conclusion
-> inspect AI Client
-> close and confirm restored flow and focus
-> replay
-> choose AI uses WordPress
-> inspect an external actor
-> Browse all components
```

Check page identity, meaningful first render, framework/runtime overlays,
console health, focus, native disabled states, touch-target geometry, line and
card legend fidelity, clipping, overlap, card collision, story-band overflow,
rail wrapping, and panel scrolling.

### Booth-site pull request checks

First change the existing production-build regression test to require the new
heading, description, and CTA, and verify it fails against the old component.
Then change the component and rerun:

- Lint
- Formatter check
- Astro/type check
- Script checks
- Full tests
- Production build

Repeat responsive browser QA at:

- 390 by 844
- 1024 by 768
- 1366 by 1024

Confirm that the new promise renders without horizontal overflow, preserves
the static-poster hierarchy, retains the accessible separate-tab name and
disclosure association, emits the same tracking tuple, and requests no kiosk
resources before activation.

## Acceptance criteria

The design is complete when all of the following are true:

1. A first-time visitor can identify Core AI as open, provider-neutral building
   blocks before interacting.
2. The welcome screen visibly teaches choose, follow, and tap.
3. Solid, dashed, highlighted, and dimmed states have explicit meanings.
4. The primary welcome action opens WordPress uses AI; Browse all components is
   available as a quieter secondary path.
5. Every flow states its situation before or as movement begins and keeps its
   conclusion visible after settlement.
6. Every flow control predicts its outcome before activation.
7. Every highlighted component is enabled, cued, and opens a contextual panel;
   every dimmed component is disabled and uncued.
8. A contextual panel answers role, importance, definition, implementation, and
   continuation in that order.
9. Closing a panel returns to the same assembled flow and restores focus.
10. Replay reruns the selected path without clearing the scenario.
11. Reduced motion conveys the same premise, path, conclusion, and component
    roles without animated dependency.
12. Volatile technical claims are backed by current primary documentation and
    prerelease behavior is labeled honestly.
13. Pull request 9 introduces the exhibit with the approved heading,
    description, and CTA while preserving its static external handoff.
14. Automated repository checks and bounded desktop/tablet/mobile visual QA
    pass without relevant warnings, errors, overflow, or collision.
15. Physical iPad/Safari, Guided Access, booth networking, and real QR scanning
    remain documented human release gates until performed.

The final qualitative acceptance test gives a first-time visitor one flow and
asks:

> What did you do?
>
> What happened in the diagram?
>
> What did the component you tapped contribute?

A successful answer identifies the chosen flow, describes the active request
or work, and explains the inspected component's contribution in that path.
