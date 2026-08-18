---
target: all non-flow elements and components of the Core AI Living Block Map
total_score: 24
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 4
timestamp: 2026-08-17T21-43-07Z
slug: src-core-ai-map-render-php
---
Method: dual-agent (A: /root/assessment_a · B: /root/assessment_b)

# Non-flow interface critique

## Scope

This review excludes the four flow choices, their situations and takeaways, numbered paths, live/configuration movement, participant states, flow-specific role strips, and flow-context sections inside component panels. It includes the welcome/attract state, global chrome, boundary scaffold, neutral component browser, general component details, About/provenance, feedback QR, WP-Bench deep dive, offline/readiness behavior, reset/inactivity, reduced motion, and failure states.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | Offline is visible, but readiness, cache failure, and impending reset are silent. |
| 2 | Match system / real world | 3/4 | Inside/outside language is strong; “Boundary view,” “runtime,” and the left-zone label require translation. |
| 3 | User control and freedom | 3/4 | Browse, Start over, Back, Escape, and focus restoration work; timed reset can still take control away. |
| 4 | Consistency and standards | 3/4 | Native controls and tokens are disciplined; the neutral legend, feedback float, and four-items-in-three-columns grid break the system. |
| 5 | Error prevention | 2/4 | Disabled/inert states are strong; pre-hydration controls look live and unsupported/failure states have no guardrails. |
| 6 | Recognition rather than recall | 2/4 | Zones and labels help, but Browse details hide the map and do not consistently repeat location/Core status. |
| 7 | Flexibility and efficiency | 3/4 | Browse is a useful expert path with keyboard support; its ordering and density reduce efficiency. |
| 8 | Aesthetic and minimalist design | 2/4 | The visual system is excellent, but welcome, Browse, and WP-Bench expose competing information. |
| 9 | Error recognition and recovery | 1/4 | Navigation recovery is good; operational failures are swallowed and offer no retry. |
| 10 | Help and documentation | 3/4 | Contextual panels and canonical links are strong; neutral taxonomy is implicit and some depth is excessive for a kiosk. |
| **Total** |  | **24/40** | **Acceptable; significant pre-booth refinement needed.** |

## Design Specificity Verdict

The exhibit is highly authored and unmistakably specific to WordPress Core AI. The fixed keynote-stage composition, WordPress palette, serif naming register, provider-neutral topology, and exact inside/outside boundary could not be transplanted into an unrelated AI product unchanged.

Specificity erodes in the non-flow accretions: the feedback QR reads like generic event engagement, Browse drifts toward the glossary the product explicitly rejects, and WP-Bench behaves like a parallel mini-exhibit. The right move is refinement, not redesign: make every neutral surface reinforce one taxonomy—Core, installed plugin/project, outside WordPress, and evaluation.

The deterministic detector returned a clean `[]` with zero findings for `src/core-ai-map/render.php`. That confirms there are no mechanical rule violations in its coverage; it does not detect the state-semantic, hierarchy, or cognitive-load problems below. No false positives were produced.

No reliable visual overlay or browser screenshot is available. Browser automation and mutable injection were not exposed, and project policy forbids launching a local browser. Visual conclusions are therefore source-, contract-, and test-based.

## Overall Impression

The non-flow interface already has an excellent structural answer to “where”: a WordPress plate, outside zones, boundaries, and explicit badges. Its largest missed opportunity is that the welcome and neutral browser do not teach users how to interpret those signals as a Core/plugin/outside taxonomy. The interface teaches line mechanics more explicitly than it teaches the product boundary the audience came to understand.

## Item-by-item assessment

| Element and states | Purpose and rendering | UX/cognitive effect | Core AI value and enhancement |
|---|---|---|---|
| Kiosk root, fixed stage, graph grid | Isolates one 1366×1024 exhibit and scales it uniformly. The graph rule supplies quiet technical texture. | Strong focus and specificity; unsupported portrait/small viewports simply shrink everything. | Indirect. Add an unsupported-orientation message below the compatibility floor rather than miniature controls. |
| Brand, persistent H1, one-state guidance | “WordPress Core AI · Living Block Map” anchors authority; a hidden H1 preserves structure after welcome; guidance changes by state. | Excellent recognition with little visible load. | Direct “what.” Keep it. Use input-neutral “Open” rather than “Tap” in neutral guidance. |
| WordPress plate, rules, zones, Boundary view | Visually locates components inside WordPress, outside with assistants/providers, and below the runtime. | This is the strongest comprehension device. “Outside · assistants” does not accurately cover Agent Skills, coding agents, and code artifacts; “Boundary view” is meta-language. | Direct “where.” Rename to “Outside WordPress · assistants and coding tools,” “WordPress boundary,” and “Evaluation · separate from live requests.” |
| Dormant neutral hairlines | Suggest latent topology before a flow is chosen. | Recessive, but directionless lines ask visitors to infer relationships. | Weak without a flow. Keep purely decorative or omit them in Browse so zones carry the neutral lesson. |
| Diagram key | Shows solid request/work, dashed support, and dimmed non-participants. It appears on every map state. | Useful during a flow, semantically wrong in Browse: there is no active request, selected flow, or dimmed card. | Direct “how” only during flows. In Browse, hide it or replace it with Core/plugin/outside/evaluation taxonomy. |
| Welcome heading and orientation | Defines Core AI as open, provider-neutral building blocks, under “Four ways WordPress and AI meet.” | Clear prose and strong authority. The heading frames a catalogue rather than directly answering what Core AI is. | Direct “what,” but incomplete on status. Add one sentence: badges show what ships in Core, what is installed, and what stays outside WordPress. |
| Four numbered welcome names | Lists all flows as 01–04, while CSS still creates three columns. | Looks like a required four-step curriculum even though one flow is enough; item four becomes an orphaned second row. | Indirect. Restore the approved choose/follow/tap row and let the rail introduce four choices, or at minimum use a balanced four-column strip and label it “Four paths.” |
| Welcome legend and entry actions | Three-item visual grammar, primary “Trace the first flow,” secondary Browse. | Button hierarchy is strong and only two choices are actionable. Intro says “Pick one,” though visitors cannot pick among the four inert names here. | Direct. Say “Trace the first flow, then choose another,” or restore “Explore the first flow.” |
| Attract preview and caption | Cycles assemble → draw → signal → settle → release, with changing flow captions. | Memorable, but caption rotation competes with reading the already dense welcome. Reduced motion removes animation yet still swaps settled previews every 6.5 seconds. | Demonstrates “how.” Remove the in-card duplicate caption or pause/freeze on engagement; freeze the first preview under reduced motion. |
| Feedback QR float | Offers a question form on another device. | It competes before the visitor learns anything, creates a fourth elevated surface against the Three Floats rule, and lacks a visible text URL fallback. | Not explanatory. Move it into About or a post-flow continuation, narrow the copy to Core AI, and show a short URL. |
| Browse controls and neutral note | Clears the active story and exposes every component; the note says all components are on one canvas. | A useful expert escape hatch. The note describes inventory rather than giving a reading strategy. | Strong potential for “what/where.” Replace the note with: compare what ships in Core, what is installed as a plugin/project, and what stays outside WordPress. |
| Neutral component canvas | Shows 12 equally tappable cards plus four rail choices and chrome—roughly 18 visible actions. | High choice load and glossary-like behavior. No recommended starting point; all cards carry similar weight. | Direct inventory, weak hierarchy. Strengthen zone/category grouping, nominate one neutral starting card/category, and preserve the full inventory as optional depth. |
| Browse keyboard traversal | `browseAll()` focuses AI Plugin while actors precede it in DOM; absolute visual placement differs from DOM order. | Keyboard traversal does not form a coherent spatial route and earlier actors are awkward to reach. | Indirect but important. Align DOM/focus order to a zone-based reading sequence or implement roving spatial focus. |
| General inspector | Hides the canvas, then shows Back, component badge/title/definition, optional technical material, and QR. | Escape/focus restoration are excellent. Hiding the canvas turns “where it belongs” into a memory task. | Direct “what,” weaker “where.” Add fixed `Where` and `Core status` rows to every panel, or retain a dim inert map as context. Rename “Block details” to “Component details.” |
| Scroll continuation, technical panels, Abilities tabs, canonical QR | Progressive depth sits below a concise lede; Abilities uses three accessible tabs; seven QR blocks show visible selectable URLs. | Good disclosure overall. The universal continuation can promise sections absent from short actor panels, and long technical sections become seminar material. | Direct optional “how.” Show the continuation only when the active panel both overflows and contains the named sections; keep definition/status in the first screenful. |
| WP-Bench run loop | A second boundary diagram with five stage buttons and stage detail, defaulting to stage 03. | Highly specific but cognitively a second exhibit: five choices plus Back, and the default breaks the numbered sequence. | Direct evaluation “how.” Default to stage 01, add Next/Previous, progressively reveal later stages, and clarify the benchmark’s WordPress version versus the kiosk runtime. |
| About trigger/dialog | Opens a modal containing AI-assistance disclosure, tool, human responsibility, and review date. | Trustworthy and well controlled by Back/Escape, but “About this exhibit” promises broader product context than it supplies. Returning from a long About visit can leave the attract loop stopped. | Indirect trust. Add a concise Core AI/exhibit description, state that it is a dynamic server-rendered WordPress block, move feedback here, and restart the attract scheduler on return. |
| Offline pill | Yellow “Offline mode” appears when cached or disconnected. | Clear status but sounds like failure; network changes are not announced. It may compete with Bench’s top-right Back control. | Operational only. Use “Offline · exhibit still works,” reserve a non-colliding status slot, and announce changes. |
| Manual and inactivity reset | Start over safely returns to welcome. Inactivity resets at 60 seconds on map/About and 90 seconds in Inspect/Bench. | Manual reset is excellent. Silent auto-reset can interrupt slow reading; the 90-second deep-state exception is undocumented. | No direct teaching value. Add a 10-second extendable warning, announce it, and count scroll/virtual-cursor reading as activity. Align documentation with actual timing. |
| Readiness and failure states | SSR shows the welcome immediately; Interactivity adds `.is-ready`; cache readiness is written only to `data-offline-ready`; service-worker/wake failures are swallowed. | Controls look active before hydration, but there is no starting, failed, or retry state. A kiosk can look usable while doing nothing. | Operational trust. Gate actions until ready, show a brief start state, then offer Reload/fallback if enhancement fails; expose detailed readiness only to the operator. |
| Accessibility preferences and announcements | Native buttons, inert/hidden screens, visible focus, Escape/focus restoration, live announcements, reduced motion, and increased contrast. | Unusually strong foundation. Network changes and reset warnings are missing; reduced-motion content still auto-advances. | Supports every lesson. Keep the foundation and close those residual gaps. |

## Cognitive Load

Non-flow cognitive load is high: 5 of 8 checklist failures.

- Single focus: fail—welcome combines orientation, four numbered names, legend, two actions, rotating caption, feedback QR, and About.
- Chunking: pass—copy is grouped into cards, tabs, role rows, and panels.
- Grouping: pass—zones, plate, panels, and tabs are strong.
- Visual hierarchy: fail—Browse gives 12 cards similar weight; feedback earns an unauthorized float.
- One thing at a time: fail—attract changes while reading; WP-Bench exposes all stages plus detail.
- Minimal choices: fail—Browse exposes about 18 actions; WP-Bench exposes six.
- Working memory: fail—the map disappears when a general panel opens.
- Progressive disclosure: pass—welcome → map → panel → tabs/deep dive is structurally sound.

## Emotional Journey

Arrival feels authoritative and intriguing. The first valley occurs when 01–04 suggests a longer curriculum than the one-flow success contract. Browse then turns curiosity into analysis paralysis. General panel ledes restore confidence, but hiding the map breaks spatial continuity and long technical sections can feel like homework. WP-Bench is a peak for experts and a cliff for casual visitors. Back and Start over provide a predictable exit; a silent timeout can make the ending feel confiscatory.

## What’s Working

- The boundary scaffold is excellent: plate, zones, rules, and explicit badges attack the audience’s central “where does WordPress stop?” confusion.
- The visual world is disciplined and memorable—an official WordPress exhibit, not a generic AI dashboard.
- Accessibility fundamentals are unusually strong: native buttons, visible focus, inert backgrounds, Escape, focus restoration, live announcements, reduced-motion parity, and increased-contrast tokens.

## Priority Issues

1. **P1 — Welcome no longer teaches how to use the exhibit.** Four numbered flow names replace the approved choose/follow/tap row, render into a three-column grid, and imply four required steps.
   - **Fix:** Restore choose/follow/tap; let the rail introduce the four paths; make the heading directly answer what Core AI is.
   - **Suggested command:** `$impeccable clarify` followed by `$impeccable layout`.

2. **P1 — Neutral Browse makes the Core taxonomy implicit and presents a choice wall.** The key describes a nonexistent active flow, while 12 equal cards plus four flow buttons overwhelm the optional expert path.
   - **Fix:** Replace the neutral key/note with Core/plugin/outside/evaluation guidance, strengthen zone grouping, and nominate a starting category without hiding inventory.
   - **Suggested command:** `$impeccable distill`.

3. **P1 — Browse loses “where” after selection and keyboard order is incoherent.** The inspector hides the map and omits consistent location/Core-status rows; DOM focus order does not match the canvas.
   - **Fix:** Add `Where` and `Core status` to every general panel; retain location context; align traversal to a zone-based order.
   - **Suggested command:** `$impeccable layout` plus `$impeccable harden`.

4. **P1 — Operational states are not kiosk-hardened in the UI.** Pre-hydration controls look live; cache/wake failures are silent; offline wording is ambiguous; inactivity resets without warning.
   - **Fix:** Add ready/failure/reload states, actionable offline language, a reserved status position, and an announced extendable reset warning.
   - **Suggested command:** `$impeccable harden`.

5. **P2 — Secondary surfaces compete with the lesson.** Feedback creates a fourth float; About lacks actual exhibit context; WP-Bench acts like a second exhibit; the universal scroll hint can overpromise.
   - **Fix:** Consolidate feedback and provenance in About, sequence WP-Bench from stage 01, and render continuation hints from actual panel content/overflow.
   - **Suggested command:** `$impeccable distill` followed by `$impeccable polish`.

## Persona Red Flags

- **Jordan, first-timer:** Reads 01–04 as required steps; “Pick one” conflicts with only “Trace the first flow”; Browse produces 12 equal choices; the neutral key refers to a flow that does not exist.
- **Sam, accessibility-dependent:** Focus traversal jumps around the absolute canvas; fixed scaling undermines zoom/reflow; silent 60/90-second reset can interrupt reading; reduced-motion previews still replace content automatically.
- **Riley, stress tester:** Can press controls before enhancement; cache/wake failures are swallowed; offline readiness is stored but not shown; long About visits can stop the attract cycle; no visitor-facing recovery exists.

## Minor Observations

- Rename “Block details” to “Component details.”
- Add a visible short URL to the feedback QR.
- Clarify WP-Bench’s WordPress version as its benchmark target.
- The About trigger meets the documented 24px compatibility floor but not the enhanced 44px target at 1024×768.
- Remove or document the hidden home-indicator markup, always-false `isCardOffstage`, unused inspect-canvas transform, and presentationless `.is-ready`/`data-offline-ready` states.
- The Apply control remains enabled and labelled “Apply” after the applied state; disable it or change its label/state semantics.

## Questions to Consider

- If one flow is enough, why does the first screen number all four like a curriculum?
- What if Browse taught one taxonomy—Core, plugin, outside, evaluation—instead of merely exposing every noun?
- Is collecting questions more important than earning the visitor’s first interaction?
- When the map disappears behind a panel, what evidence remains for “where it belongs”?
- What should a visitor see when the interactive exhibit cannot become interactive?
