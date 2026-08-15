---
name: Core AI Living Block Map
description: A fixed-stage kiosk exhibit that lights one path at a time and lets the rest of the diagram wait in the dark.
colors:
  blue: "#3858e9"
  blue-dark: "#1e3a8a"
  blue-tint: "#eef1ff"
  blue-line: "#aab5ff"
  blue-wash: "#f4f6ff"
  ink: "#1e1e1e"
  ink-soft: "#50575e"
  text-muted: "#646970"
  canvas: "#f6f7f7"
  surface: "#ffffff"
  line: "#dcdcde"
  line-strong: "#8c8f94"
  line-dormant: "#a7aaad"
  line-ghost: "#c3c4c7"
  warning: "#dba617"
  warning-ink: "#8a6300"
  warning-tint: "#fff8e1"
  warning-line: "#f2d675"
typography:
  display:
    fontFamily: "Core AI EB Garamond, georgia, Times New Roman, serif"
    fontSize: "54px"
    fontSizes: ["54px", "52px"]
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Core AI EB Garamond, georgia, Times New Roman, serif"
    fontSize: "34px"
    fontSizes: ["34px"]
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Core AI Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "22px"
    fontSizes: ["22px", "20px", "18px", "17px", "15px", "14px"]
    fontWeight: 620
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Core AI Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontSizes: ["19px", "18px", "16px", "15px", "14px", "13px"]
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Core AI Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    fontSizes: ["12px", "11px", "10px"]
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "0.1em"
  numeral:
    fontFamily: "Core AI IBM Plex Mono, ui-monospace, sfmono-regular, menlo, monospace"
    fontSize: "12px"
    fontSizes: ["13px", "12px", "11px", "10px"]
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0.035em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  mark: "6px"
  panel: "8px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  xxxl: "42px"
components:
  block-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "16px"
    width: "236px"
    height: "148px"
  block-card-active:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  block-card-parked:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px"
    width: "176px"
    height: "100px"
  actor-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px"
    width: "180px"
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 26px"
    height: "64px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.xs}"
    padding: "0 8px"
    height: "60px"
  button-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "60px"
  rail-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
    height: "68px"
  rail-button-active:
    backgroundColor: "{colors.blue}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
  result-chip:
    backgroundColor: "{colors.blue-tint}"
    textColor: "{colors.blue-dark}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  offline-pill:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.warning-ink}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "30px"
  inspect-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "24px 32px 92px"
    width: "520px"
---

# Design System: Core AI Living Block Map

## Overview

**Creative North Star: "The Keynote Stage"**

The exhibit is staged, not published. A fixed 1366 × 1024 composition — the code calls
it `__stage` and means it — holds every component in its authored position, and the
system's entire job is to decide what is lit right now. Choose a flow and one blue
path draws across the board in 600ms; the cards on that path fill with a pale wash and
take a border, and everything else falls to 0.4 opacity and goes `disabled`. The path
finishes, and only then does the conclusion appear. That withheld beat is the design.

The voice is a product introduction, not a reference work. It says one thing, waits
for it to land, and then says the next. Nothing is enumerated for completeness. There
is no index, no alphabetical anything, no dense unbroken column of prose, and no
attempt to be exhaustive about a subject that could easily fill a manual. Four flows,
each with one premise and one conclusion; depth waits inside a panel the visitor
chooses to open. **This is the opposite of an encyclopedia and it must stay that way.**

Materially it is almost austere. The ground is WordPress's own admin gray (`#f6f7f7`)
under a 56px graph rule at 3% ink. Cards are white with a single hairline and a shadow
so slight it reads as contact rather than lift. Type carries the drama instead:
EB Garamond at 52–54px with tight negative tracking, set against Inter at 11–15px doing
all the structural work. The serif is what makes it feel like a stage rather than a
control panel — a headline in a museum, not a heading in a manual.

**Key Characteristics:**

- One flow lit at a time; every non-participant dimmed to 0.4 and genuinely disabled
- A fixed authored stage scaled by `--cai-scale`, never a responsive layout
- Near-flat surfaces, where a 1px shadow is a promise of interactivity rather than decoration
- Solid means live work; dashed means supporting — consistently, across lines, borders, and cards
- Editorial serif display over a plain functional sans; no third voice
- Motion that builds to a reveal, then stops completely

## Colors

The neutral ramp and the accent are WordPress's own admin tokens — `#3858e9` with
`gray-100/300/400/500/600/700/800/900`, plus `#c3c4c7` between 300 and 400 — which is
what lets an exhibit about WordPress look
like it belongs to WordPress. The blue derivatives and the caution set are
project-authored extensions on top of that foundation.

### Primary

- **Live Blue** (`blue`): the color of work happening now. It draws the active flow
  path at 2.4px, borders and tints the cards on that path, fills the selected rail
  button and the primary call to action, sets the tap cue, and paints the 3px focus
  ring. It is never a background field and never a decorative accent.
- **Deep Blue** (`blue-dark`): text only, and only on `blue-tint`. It sets resolved
  values — router results, socket labels, breadcrumbs, the applied workbench state.
- **Participant Wash** (`blue-wash`): the palest fill in the system, and the single
  signal that a card belongs to the selected flow.
- **Result Tint** (`blue-tint`) and **Result Line** (`blue-line`): the chip pairing for
  a settled value, and the dashed border on a sidecar card standing beside the path.

### Neutral

- **Ink** (`ink`): all primary text, and the icon stroke on a card at rest.
- **Soft Ink** (`ink-soft`): supporting sentences under a card name, panel notes, the
  secondary action.
- **Muted Text** (`text-muted`): the label register — zone titles, badges, rail
  numbers, the colophon — and the stroke of the dashed configuration path.
- **Canvas** (`canvas`): the stage ground, carrying the 56px graph rule.
- **Surface** (`surface`): every card, panel, and dialog.
- **Hairline** (`line`) and **Strong Hairline** (`line-strong`): the two border weights.
  `line` frames a component inside WordPress; `line-strong` draws the dashed edge of
  something outside it. `line-strong` is gray-500 rather than gray-400 because the
  boundary it draws is a graphic the visitor has to read, and 3:1 is the floor for
  that — it clears at 3.02:1 on the canvas and 3.24:1 on a card.
- **Dormant Line** (`line-dormant`) and **Ghost Line** (`line-ghost`): the two weights
  that are allowed to fail 3:1, because neither carries meaning. `line-dormant` is the
  latent connector at rest, held at 62% so it stays under the boundary it sits behind,
  and the nearer of the two ghost cards stacked behind an actor. `line-ghost` is the
  farther one. The three edges of that stack run `line-ghost`, `line-dormant`,
  `line-strong` from back to front, and stay in that order under `prefers-contrast:
  more` — which is the reason they are tokens rather than literals.

### Tertiary

- **Caution** (`warning`, `warning-ink`, `warning-tint`, `warning-line`): reserved
  entirely for the offline pill in the top bar. It is the only non-blue signal color in
  the exhibit, and it marks an operational state rather than content.

### Named Rules

**The One Live Path Rule.** Live Blue marks exactly one thing at a time: the work
happening right now. Two lit paths on one stage is a bug, not a busy screen.

**The Two Blues Rule.** `blue-wash` says *this card is in the story*. `blue-tint` says
*this is a settled result*. They are one step apart in lightness and they are never
swapped.

**The Borrowed Ramp Rule.** The grays are WordPress admin tokens, exactly. Don't
substitute a near neighbor, and don't introduce a gray the admin palette doesn't have.

## Typography

**Display Font:** Core AI EB Garamond (variable 400–800; falls back to Georgia)
**Body Font:** Core AI Inter (variable 100–900; falls back to the system UI stack)
**Label/Mono Font:** Core AI IBM Plex Mono (400/500/600/700)

**Character:** A literary serif announcing, and a neutral grotesque explaining. The
serif appears at scale with aggressive negative tracking (−0.035 to −0.045em) so it
reads as a plate rather than a paragraph; Inter never exceeds 22px and does every piece
of structural work beneath it. All three are bundled as local WOFF2 — the kiosk never
waits on a network for type.

The variable-weight axes are used at optical values rather than the standard ladder:
620, 650, 680, 560. These are deliberate, not typos. Preserve them.

### Hierarchy

- **Display** (EB Garamond 500, 54px, 0.98, −0.045em): a component's name in the
  inspect panel, and the About dialog title. The welcome headline is the same register
  one step down — 52px, line-height 1, −0.035em, balanced wrap, capped at 760px.
- **Headline** (EB Garamond 500, 34px, 1.02, −0.035em): titles of sub-surfaces reached
  from inside the map — the WP-Bench run loop, the Abilities inspector, the workbench.
- **Title** (Inter 620, 22px, 1.05, −0.02em): the name on a component card. Drops to
  15px/1.15 when the card parks or becomes a sidecar and the description is dropped.
- **Lede** (Inter 400, 19px, 1.5): the first paragraph of an inspect panel only. One per
  panel — it is the sentence the visitor came for.
- **Body** (Inter 400, 15px, 1.5–1.55): everything else in a panel; 16px/1.4 for welcome
  orientation copy, which rises to 18px/560 for its first sentence.
- **Label** (Inter 650–700, 10–12px, uppercase, 0.06–0.15em): zone titles, badges, the
  rail label, section headings inside a panel, the tap cue at 11px in Live Blue.
- **Numeral** (IBM Plex Mono 650, 12–13px, 0.035–0.06em): the welcome step numerals, the
  "keep scrolling" pill, and the reviewed-date stamp. Monospace marks a value, never a
  sentence.

### Named Rules

**The Serif Speaks Once Rule.** EB Garamond appears only where the exhibit *names*
something — the welcome headline, a component title, a sub-surface title. It never sets
body copy, never sets a label, and never sets a control.

**The Two Voices Rule.** There are exactly two reading voices, serif and sans, plus mono
for values. A third family, or Inter pressed into display duty at 34px+, breaks the
staging.

## Layout

One authored composition at 1366 × 1024, centered and scaled by `--cai-scale`, which
`view.js` recomputes on resize. Nothing inside the stage is responsive: cards are
absolutely placed via `--cai-x` / `--cai-y`, the SVG wire layer is a 1366 × 1024
coordinate space, and there are no breakpoints below the stage boundary. 1024 × 768 is
the same composition at a smaller scale, not a different layout: `--cai-scale` is
0.7496 there, so every size in this document renders at three quarters of the figure
stated. 68px rail buttons render at 51, 64px primaries at 48, 60px controls at 45,
44px nested controls at 33, and the 34px colophon box at 25.

The stage divides into four bands. A 60px top bar inset 24px left and right, 18px from
the top, laid out in flow — identity, the one instruction that applies right now, then
mode controls — so a longer instruction cannot collide with either end. The canvas
occupies the middle, with a translucent white plate at (240, 112) sized 790 × 488
marking the inside-WordPress region, zone labels at y=78, and a component browser
legend card at (24, 654). A two-region story band carries the persistent situation and
the revealed conclusion beside the diagram. The bottom band is fully allocated: a flow
rail at `bottom: 48px` on a `112px + 4×1fr` grid, and a 34px colophon at `bottom: 12px`.

Spacing runs on a 4px base with 8/12/16/24 doing most of the work; 24px is the stage
inset and the panel's horizontal padding is 32px. The background graph rule is 56px,
which is decorative rather than a layout grid.

### Named Rules

**The Fixed Stage Rule.** Never add a media query inside the stage. If something doesn't
fit, re-author the composition or change the scale — the geometry below `__stage` is
allowed to assume 1366 × 1024 forever.

**The Allocated Band Rule.** The bottom band's vertical budget is spent. The rail label
takes a grid column rather than a line, and the colophon's line-height and padding are
pinned to keep its box at 34px — the smallest box that still measures 24px once the
stage is scaled to 0.7496. The arithmetic is `12 + 34 + 2 = 48`: two authored pixels
are all that separate the colophon from the rail. Adding a line anywhere down there,
or another pixel of height, pushes the rail into the canvas.

## Elevation & Depth

The system is flat by conviction. There are exactly two shadow registers and they mean
different things.

The first is contact, not lift: a 1px seat under every pressable card. It is so slight
it reads as the card resting on the canvas rather than floating above it — and it is
removed on `:disabled`. That makes elevation a *permission signal*. A card that cannot
answer a tap does not get to look like one that can.

The second is float, reserved for the three surfaces that genuinely leave the stage
plane: the welcome card, the inspect panel, and the About dialog. All three use a 24/64
diffuse shadow at increasing opacity as they claim more of the visitor's attention. The
panel's is directional (cast leftward across the map it covers); the dialog's is the
deepest in the system and pairs with a scrim.

Everything else conveys depth through the flat vocabulary instead: opacity (0.4 for a
dimmed card, 0.62 for a parked one), a 0.945 scale-down, and a translucent plate. No
surface blurs what is behind it — the welcome card did until its backdrop turned out
to be two levels of signal recomposited on every frame of the attract loop.

### Shadow Vocabulary

- **Seat** (`box-shadow: 0 1px 2px rgba(30, 30, 30, 0.05)`): every pressable card,
  strip, and provider layer. Removed on `:disabled`.
- **Welcome float** (`box-shadow: 0 24px 64px rgba(30, 30, 30, 0.1)`): the welcome card
  over the attract canvas.
- **Panel float** (`box-shadow: -24px 0 64px rgba(30, 30, 30, 0.12)`): the inspect
  panel's left edge, cast across the map.
- **Dialog float** (`box-shadow: 0 24px 64px rgba(30, 30, 30, 0.2)`): the About dialog,
  over a `rgba(30, 30, 30, 0.22)` scrim.
- **Scroll fade** (`box-shadow: 0 -16px 32px 12px var(--core-ai-surface)`): not depth —
  a surface-colored mask that lets the "keep scrolling" pill sit over panel text.

### Named Rules

**The Seat Is a Promise Rule.** The 1px seat means *this responds to a tap*. `:disabled`
takes it away. Never paint it on something inert, and never remove it from something
live.

**The Three Floats Rule.** Only the welcome card, the inspect panel, and the About
dialog leave the stage plane. Nothing else earns a 24/64 shadow — a fourth floating
surface means the composition has failed somewhere else.

## Shapes

A quiet, near-square form language. `--core-ai-radius` is 4px and it answers for almost
everything: cards, panels, controls, dialogs, the primary action. Smaller radii step
down proportionally — 3px on badges and inline chips, 2px on the smallest text buttons
and inline swatches. Two exceptions are deliberate: the brand mark at 6px, and the
component-browser legend card at 8px, the only 8px corner in the system, softened
because it sits directly on the canvas rather than in a frame.

Fully round corners are reserved for things that report state rather than accept input:
the offline pill, the meter track, the "keep scrolling" pill, and status dots.

Borders carry more meaning than corners do. **Solid 1px `line`** frames a component that
lives inside WordPress. **Dashed 1px `line-strong`** frames something that does not —
and an actor card additionally carries two offset ghost cards behind it (4px and 8px,
dashed, progressively lighter) so an outside participant reads as a stack of
somewhere-else rather than a single object on this board. The same dash logic governs
the wire layer: a solid 2.4px Live Blue stroke is the request, a dashed `text-muted`
1.6px stroke is configuration, a dashed 1.2px rule in `line-strong` is the zone boundary, and
a 1px `line-dormant` hairline at 62% is dormant structure.

### Named Rules

**The Dashed-Means-Supporting Rule.** Dashed always means *does not carry the live
request*. It covers outside actors, sidecar cards standing beside a flow, configuration
paths, and zone boundaries. A component executing the request is never drawn dashed.

**The 4px Rule.** `--core-ai-radius` is the answer. Deviate only when the element is
smaller than a fingertip, or when it reports state and therefore takes a pill.

## Components

### Buttons

- **Shape:** near-square (4px), except the underlined text button (2px).
- **Primary** (`button-primary`): solid Live Blue, white text, Inter 650 at 17px, 64px
  tall, 26px horizontal padding, with a 22px stroked icon at 1.7 weight. One per screen.
- **Control** (`button-control`): white, hairline border, Inter 620 at 14–15px, 60px tall
  authored — 45px at 1024 × 768
  with a 100px minimum width — Start over, Browse all components, Replay.
- **Run-loop link:** the one control that inverts to solid Live Blue, marking a jump into
  a sub-surface rather than a state change on this one.
- **Secondary** (`button-secondary`): no fill, no border, `ink-soft`, underlined at 4px
  offset. Deliberately quieter than the primary and never allowed to compete with it.
- **Hover / Focus:** hover is gated behind `@media (hover: hover)` and does one thing —
  swaps the border to Live Blue. Focus is a 3px Live Blue outline at 4px offset,
  system-wide, on every button and link.

### Cards / Containers

- **Component card** (`block-card`): 236 × 148, white, 4px, hairline border, seat shadow,
  16px padding, name over description with a badge and a 26px stroked icon at 1.6 weight.
  - *Active:* `blue-wash` fill, Live Blue border, icon stroke turns Live Blue.
  - *Dimmed:* opacity 0.4 and scale 0.945, plus the native `disabled` attribute.
  - *Parked:* 176 × 100, opacity 0.62, badge and description dropped, name to 15px, the
    card rotating to a horizontal icon-and-name row.
  - *Sidecar:* parked geometry with a `blue-wash` fill and a **dashed** `blue-line`
    border, an absolute uppercase label 23px above it, and the tap cue on its own line.
- **Actor card** (`actor-card`): 180 wide, min-height 120, dashed `line-strong` border,
  content-sized so a tap cue has somewhere to go, backed by two offset dashed ghosts.
- **Inspect panel** (`inspect-panel`): 520px anchored right, full stage height, hairline
  left border, directional float shadow, 92px of bottom padding to clear the
  continuation pill. Uses `container-type: scroll-state` so the pill appears only when
  there is more to read.
- **Internal padding:** 14px on a parked or actor card, 16px on a full card, 24/32 in the
  panel, 36/42 in the About dialog.

### Navigation

The flow rail is the primary navigation on the map screen: a `112px + 4×1fr` grid with
its own uppercase label in the first column rather than on its own line. Each button is
68px tall and stacks a muted number, a 14px/680 title, and an 11px outcome subtitle that
predicts what the flow will show. The active button inverts to solid Live Blue with all
three text layers turning white, and carries `aria-pressed="true"`. Hover, where
supported, only shifts the border.

### Signature: the tap cue

An 11px uppercase Live Blue line at 700 weight that appears on a card **only** while it
participates in the selected flow. It is the visual half of the participation contract —
the invitation to tap is never printed on a card that cannot answer — and it is why an
actor card sizes to its content instead of a fixed box.

### Signature: the two-state wire layer

The SVG layer beneath the cards holds four stroke treatments that are never mixed: the
live path (solid Live Blue, 2.4px, round cap, drawn by a 600ms `stroke-dashoffset`
animation), the configuration path (dashed `text-muted`, 1.6px, held at 0.9 opacity), the
zone rule (dashed `line-strong` at 1.2px, lighting to Live Blue at 1.6px), and dormant
hairlines (1px `line-dormant` at 62%, faded out when a flow takes over).

### Motion

`cubic-bezier(0.22, 1, 0.36, 1)` — a hard expo-out — governs everything that moves in
space: 620ms for a card taking its position, 520ms for the canvas, 320ms for a card
resizing. Color and opacity use plain `ease` at 180–420ms. On the attract screen, cards
drift on three staggered 6–7.9s float keyframes; the drift stops on engagement and never
returns. `prefers-reduced-motion` collapses every duration to 0.01ms, cancels all
animation, and snaps paths and tokens to their end state — the settled composition, not
a degraded one.

## Do's and Don'ts

### Do:

- **Do** light exactly one path at a time, and dim every non-participant to 0.4 with the
  native `disabled` attribute — dimming without disabling is a lie the visitor can tap.
- **Do** give a pressable card the 1px seat and take it away on `:disabled`. That shadow
  is the system's only promise of interactivity.
- **Do** draw anything that supports rather than executes with a dash — outside actors,
  sidecars, configuration paths, zone rules.
- **Do** withhold the conclusion until the path settles, and then leave it up. The beat
  before the reveal is the pedagogy.
- **Do** keep EB Garamond for naming only, at 34px or above, with negative tracking.
- **Do** use the WordPress admin grays exactly as tokenized, and keep Live Blue for live
  work.
- **Do** author new geometry in fixed 1366 × 1024 coordinates and let `--cai-scale` carry
  it to other sizes.
- **Do** author controls at 68px in the rail, 60px in the header and the panel, dialog
  and tab surfaces, and 44px for nested controls, and read all three as authored
  numbers — `--cai-scale` renders them at 51px, 45px and 33px at 1024 × 768. Anything a
  finger has to find owes 24px *rendered*, not authored.

### Don't:

- **Don't** write an encyclopedia. No index, no glossary, no alphabetical ordering, no
  exhaustive enumeration, and no unbroken column of reference prose. One premise, one
  reveal, one conclusion per flow — depth waits inside a panel the visitor opened.
- **Don't** put a tap cue, a seat shadow, or a pointer cursor on a card that cannot open
  a panel.
- **Don't** add a fourth floating surface. Three things leave the stage plane and that is
  the whole list.
- **Don't** introduce a media query inside `__stage`, or make any geometry below it
  responsive.
- **Don't** add a third type family, or promote Inter into the display register.
- **Don't** use Live Blue as a fill for anything that isn't the active flow, the selected
  rail button, or the primary action — and never as a decorative background.
- **Don't** swap `blue-wash` and `blue-tint`. Participation and result are different
  claims.
- **Don't** let any animation loop after the visitor engages, and don't build meaning that
  only exists while something is moving.
- **Don't** add provider-specific branding, logos, or vendor color to the map.
