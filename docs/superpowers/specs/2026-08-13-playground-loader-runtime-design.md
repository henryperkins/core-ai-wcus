# Playground Loader Runtime Design

## Goal

Make the cold-load heading and polite live region say exactly:

> Building a real WordPress 7.0 site in your browser — no server, about 45
> seconds.

The text must be exposed before Playground's upstream progress component can
announce its shorter fallback, and it must remain consistent inside the runtime
frame.

## Architecture

The deployed application has three document layers: the outer Playground UI, the
`remote.html` runtime iframe, and the WordPress site iframe. Both the outer UI
and `remote.html` can expose their own loading status. The upstream outer Vite
graph is cyclic, so rewriting only one fingerprinted bundle can load the
original bundle again. Instead, the generated `index.html` owns a small,
first-party accessible loading screen and makes Playground's React root inert
and `aria-hidden` before React starts. The shell recursively detects the ready
Living Block Map, removes those attributes, and hides itself. A bounded timeout
restores Playground's own UI so a failed boot remains diagnosable.

The build separately locates the JavaScript module referenced by `remote.html`,
replaces its single pinned `Preparing WordPress` caption, writes the modified
bytes under a content-derived filename, and updates both `remote.html` and the
offline asset manifest. The ineffective outer-document `MutationObserver` is
removed. A build failure is preferable to silently shipping stale copy when an
upstream root, caption, module reference, or manifest contract changes.

## Verification

- A pure build test will prove the outer screen and inert root are present,
    the original runtime module is replaced, the modified module has a
    content-derived filename, `remote.html` and the offline manifest point to
    it, and the original module is absent.
- A cold-browser verifier will navigate a Pages-compatible local artifact,
    require the outer heading and `role=status` to expose the approved copy with
    no exposed upstream fallback, verify the same copy inside `remote.html`, and
    prove the outer shell restores the Playground root when the map is ready.
- The existing Playground suite, linters, WordPress unit suite, artifact
    build, literal `/remote.html` routing check, and kiosk browser acceptance
    remain release gates.

## Scope

This changes only the loader copy pipeline and its verification. It does not
change the map, Blueprint, WordPress plugin, loading duration, or public
deployment without separate authorization.
