---
title: How Analysis Works
description: The scan pipeline, the extractors, caching, and why confidence exists.
section: Going Deeper
order: 18
slug: how-it-works
---

# 18. How Analysis Works

This chapter is for readers who want to **understand** what Knoten does under the hood —
so you can trust the map, judge the inferred parts, and know its limits. You do not need
any of this to use Knoten, but it explains *why* the graph looks the way it does.

## The pipeline, end to end

When you open a project, Knoten runs one pipeline:

```
  project folder
        │
        ▼
  1. Scan        walk every PHP file, parse it, collect "class facts"
        │
        ▼
  2. Schema      replay migrations (or read the live DB) → tables
        │
        ▼
  3. Extract     ~20 extractors turn class facts + schema into nodes & edges
        │
        ▼
  4. Assemble    merge, de-duplicate, group, tag coverage → one ProjectGraph
        │
        ▼
  5. Cache       fingerprint the sources, store the graph JSON
        │
        ▼
  6. Render      lay out and draw on the canvas
```

### 1. Scanning

Knoten walks the project with a file finder, **skipping the directories that never
hold first-party graphable code** — `vendor`, `node_modules`, `storage`, `public`,
`.git`, `bootstrap`, and `tests` — plus any folders you excluded. Every `*.php` file is
parsed into an abstract syntax tree with names fully resolved (so `Post::class` and
`extends Model` are already fully-qualified when read).

From each class it collects **framework-agnostic facts**: the class's name and parent,
the interfaces it implements, the traits it uses, its constructor-injected
dependencies, the classes it references in method bodies, its `use` imports, the views
it renders, its `$fillable`/`$casts`, its public methods, the Eloquent relationships it
declares, the models it authorizes against, the custom cast classes it names, and —
crucially — the **exact method + line** of each reference (so edges can point at real
call sites). Files that fail to parse become **warnings** rather than aborting the scan.

### 2. Schema

In parallel, the schema is reconstructed — by replaying migrations (default) or reading
the live database — into a set of tables with columns and foreign keys. This is covered
in [chapter 14](/database-schema).

### 3. Extraction

About twenty focused **extractors** each turn those facts into part of the graph. They
fall into a few families:

**Node producers** (which classes become which kind of node):

- **Convention/namespace extractors** — controllers (`Http\Controllers`), services
  (`\Services\` or a `Service` suffix), form requests, API resources, jobs, policies,
  middleware, actions, Livewire components, service providers, events, listeners,
  observers.
- **Base-type/marker extractors** — kinds identified by the framework type they extend
  or implement, with a namespace/suffix fallback: notifications, mailables, exceptions,
  validation rules, casts, scopes, Blade components, factories, seeders.
- **The model extractor** — a class is a model when its parent chain reaches a known
  Eloquent base (`Illuminate\Database\Eloquent\Model` or the framework `User`). If the
  chain runs off the edge of the scan into an unknown base *and* the class looks
  Eloquent-shaped (a table, `$fillable`, `$casts`, relationships, or a `Models`
  namespace), it is included as **inferred** rather than dropped — Knoten labels it
  rather than guessing silently.
- **The generic extractor** — the catch-all: every first-party class a specialised
  extractor did *not* claim still becomes a node (a generic class, or a
  provider/command by naming convention), refined to interface/trait/enum by type. This
  is why a package or module shows *all* of its files, not just the recognisable Laravel
  archetypes.
- **Non-class producers** — routes (parsed from `routes/*.php`, including
  `Route::resource()` expansion and route groups), tables (from schema), packages (from
  `composer.json`/`.lock`), frontend pages and Blade/Volt views, and broadcast channels.

**Edge producers** (how nodes connect) — inheritance/implements/uses-trait, constructor
injection (`injects`), model↔table (`maps-to`), controller/service→table (`queries`,
bridged through the model a class references), route→controller (`routes-to`),
route→middleware, Eloquent relationships, foreign keys, validation, resource
transforms, job dispatch, event dispatch/handling, notification/mail sends, exception
throws, policy authorization (from `$this->authorize('update', Post::class)` and
`->can()`/`can:` route guards), observer/model, cast usage, factory→model,
package dependency, and loose method-body references (kept only where they touch a
generic node, so an established graph does not gain a hairball of incidental links).

### 4. Assembly

All the nodes and edges are merged into one `ProjectGraph`. Knoten then:

- **de-duplicates** by id (a graph id must be unique so the UI can key on it),
- **tags coverage** — a separate pass over `tests/` counts how many test files
  reference each class, producing the "tested ×N" signal,
- **assigns groups** — module / app / package / vendor (see
  [chapter 1](/introduction#grouping)),
- **marks scheduled** commands/jobs (from the scheduler in `Kernel.php`,
  `routes/console.php`, or `bootstrap/app.php`), and
- computes **statistics** (counts per kind, relationship/edge totals).

### 5. Caching { #caching }

The finished graph is stored as JSON, keyed by a **fingerprint** of every scanned PHP
file's modified-time + size plus the Composer manifests. On the next open, Knoten
recomputes the fingerprint; if it matches, it returns the cached graph **without
re-parsing a single file** — which is why re-opening an unchanged project is instant.
Any change to any source file (or the manifests) changes the fingerprint and forces a
fresh scan. The exclude set and the schema source are part of the cache key, so scoped
scans and live-vs-migration scans each get their own cached graph.

### 6. Rendering

The frontend lays the graph out with a layered algorithm (in a background worker so the
UI never freezes) and draws it. Method flow and the on-demand analyses (traces) run
in the browser against the same graph data.

## Why confidence exists

Every detection above is either a **fact** or an **inference**. Knoten records which,
per node and per edge, as its **confidence** ([chapter 1](/introduction#confidence)):

- **High** — proven: typed injection, `::class` arguments, explicit relationships,
  parent chains that reach a known base within the scan, foreign keys with explicit
  targets.
- **Inferred** — convention or best effort: default table names, naming-convention
  matches (e.g. `<Model>Policy` guards `<Model>`, `<Model>Factory` builds `<Model>`),
  method-body references, models whose base is outside the scan.
- **Dynamic / unresolved** — could not be resolved at all (a relationship to a model
  not in the scan, a fully dynamic reference). These are surfaced as **unresolved
  references** rather than invented as edges.

This is a deliberate design choice: it lets you trust the solid map completely and
treat dashed/amber parts as leads. Architecture rules can even filter on confidence, so
you can choose to enforce only what is proven ([chapter 11](/architecture-rules)).

## Known limits

Understanding these prevents surprises:

- **Fully dynamic code** — a class resolved from a runtime string, a relationship built
  from a variable — cannot be seen statically. It shows as unresolved, not as a firm
  edge.
- **String middleware aliases** (`'auth'`) do not resolve to a node; only class-name
  middleware (`SomeMiddleware::class`) does.
- **String artisan command names** on the scheduler can't be tied to a class, so only
  class-based schedule entries (`$schedule->command(SendEmails::class)`) get the
  "Scheduled" badge.
- **`morphTo()`** with no concrete target has no single edge to draw (it is
  polymorphic); it is noted rather than forced.
- **Convention-based links** assume Laravel conventions (table pluralisation,
  `<Model>Policy`/`<Model>Observer`/`<Model>Factory` naming). A project that breaks
  convention may show those links as inferred or miss them — which is exactly why they
  are marked inferred.

The guiding principle throughout: **surface for transparency, never guess silently.**

Next: [Reference →](/reference)
