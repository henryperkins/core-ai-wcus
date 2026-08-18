# AI Uses WordPress Flow Design

**Status:** Approved

**Date:** August 17, 2026

## Objective

Make the **AI uses WordPress** flow answer three questions without requiring
prior knowledge of MCP or the Abilities API:

1. What did the person ask the assistant to do?
2. Where does that request cross into WordPress, and which parts are Core?
3. How does WordPress decide whether to return a result or refuse the request?

The flow must remain an architectural explanation, not a simulated product
demo. It should use one specific example to make the architecture legible while
clearly identifying that example as an ability registered by site or plugin
code rather than an action supplied by Core.

## Teaching transaction

Use a booking-availability request throughout the flow because the existing
Abilities Anatomy example already uses `bookings/get-availability`.

```text
A person asks for available booking times
    -> an outside assistant acts as a specific WordPress user
    -> the assistant sends an MCP call
    -> the MCP Adapter plugin translates it to bookings/get-availability
    -> the Core Abilities API validates the input and invokes the ability
    -> the ability's permission callback allows or refuses that user
    -> WordPress returns available times or a refusal
```

The copy must not imply that Core ships a booking system. The example ability
is registered by site or plugin code. Core supplies the common registration,
validation, permission, execution, and result contract. The MCP Adapter is a
WordPress plugin, not Core, and serves only as the protocol translator at the
site boundary. The assistant remains outside WordPress and has no authority of
its own.

## Entry and continuity

The welcome screen names the first action honestly: **Start with WordPress uses
AI**. It no longer promises a choice while immediately opening a predetermined
flow.

After the first flow settles, its existing contextual continuation control
offers **Now see AI use WordPress**. The bottom flow rail remains available for
direct access and replay, so the sequence is guided but never forced.

## Flow-level explanation

The selected flow uses this content model:

- **Situation:** A person asks an outside assistant to check which booking
  times are available on this WordPress site.
- **Outcome:** An assistant checks booking availability in WordPress.
- **Narrative:** The assistant acts as a WordPress user and sends an MCP call
  for the example `bookings/get-availability` ability. The MCP Adapter plugin
  translates the call. Core's Abilities API validates the input, checks the
  ability's permission for that user, runs it, and returns available times or a
  refusal.
- **Takeaway:** The adapter translates; it does not create the action or grant
  permission. Site or plugin code registers the example ability, while the
  Core Abilities API supplies the execution and permission-checking contract
  that returns available times or a refusal.

This copy establishes what happens, where every participant lives, and how
authority is preserved.

## Transaction visualization

Replace the abstract `tools/call` to `ability` token swap with a three-part,
plain-language transaction:

1. **MCP call** leaves the assistant.
2. **Get availability** appears after translation inside WordPress.
3. **Available times or refusal** appears as the settled result.

Motion is a single finite explanation, not decoration. It uses only opacity
and transforms and does not loop. Reduced-motion visitors receive the same
three semantic stages immediately in their settled positions. The visible
story copy and live announcements contain the equivalent information; the
moving labels remain decorative.

## Optional three-step component walkthrough

Inspecting a participating component continues to work independently. Inside
the **AI uses WordPress** panels only, add a contextual sequence:

1. **AI assistant** — receives the person's request and sends the MCP call as a
   particular WordPress user.
2. **MCP Adapter** — translates that call to the example WordPress ability.
3. **Abilities API** — validates input, checks the ability's permission, runs
   the callback, and returns available times or a refusal.

Each panel shows `Step n of 3` and a single continuation action to the next
participant. The final panel returns to the settled flow. Back, Close, and
Escape remain valid exits at every step. Advancing moves focus to the shared
panel heading/close region, announces the newly opened step, and updates the
focus-return target to that participant's map card.

## Accessibility and resilience

- The full explanation is understandable with animation disabled.
- Progress is visible text, not color alone.
- Every new control has an unambiguous visible label.
- Focus never moves to hidden content and returns to the most recently viewed
  map participant when the panel closes.
- Server-rendered and hydrated states agree; JavaScript only enhances an
  already understandable flow.
- All visitor-facing strings remain translatable.
- Existing authored story or panel copy is preserved unless it exactly matches
  a superseded default.

## Non-goals

- No onboarding modal, forced tour, chat simulation, or fake live API result.
- No new booking feature, ability registration, MCP server, or authentication
  implementation.
- No redesign of the fixed map geometry, type system, or visual identity.
- No claim that the MCP Adapter or example booking action is part of Core.
- No automatic advance through component panels.

## Acceptance criteria

- A first-time visitor can identify the person request, the boundary crossing,
  the Core API, the non-Core adapter, the permission decision, and the final
  result/refusal from this flow alone.
- The first flow hands off directly to **AI uses WordPress**.
- The flow renders all three transaction states both with and without motion.
- The three component panels form an optional, keyboard-operable sequence with
  correct focus restoration and announcements.
- Exact-default migrations do not overwrite customized block attributes.
- Unit, lint, build, and generated-output checks pass; physical kiosk/browser
  validation remains a separately reported human gate when unavailable.
