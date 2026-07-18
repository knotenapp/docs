---
title: Filtering & Navigating
description: The filter rail — search, layers, groups, links, heatmaps, orphans, and density.
section: Using the App
order: 5
slug: filtering-and-navigating
---

# 5. Filtering & Navigating

The **filter rail** on the left is your control panel for shaping what the canvas
shows. Everything here is non-destructive — you are hiding and showing parts of the
graph, never changing your project. This chapter walks through every control, top to
bottom.

You can collapse the whole rail to a thin strip with the **collapse** button (and
re-open it with the panel button), which is handy when you want maximum canvas.

## Project header & quick actions

At the top the rail shows the current project's name and path, plus:

- **Re-scan** (↻) — force a fresh scan (web app only; on desktop this lives in the
  File menu). See [chapter 3](/opening-projects#re-scanning).
- **Settings** — opens the Editor/Appearance settings.
- **Open a project** — the open dialog (hidden on desktop, where it lives in the
  native File menu).

Below that is the **Architecture** toolset. **Check architecture** is the primary
button — run the project's rules now ([chapter 13](/checking-and-ci)). Under it sit
three compact tool tiles, each opening a dialog:

- **Presets** — browse and enable bundled boundary sets ([chapter 12](/rule-presets)).
- **CI gate** — scaffold the files to enforce rules in CI ([chapter 13](/checking-and-ci)).
- **Drift** — check the project's migrations against a remote database
  ([chapter 14](/database-schema#check-remote-drift)).

## Search

The search box finds nodes fast. A term is matched against each node's **name,
table, route URI, class namespace, and kind** — so `User` finds the model, `users`
finds its table and routes, `Billing` pulls up a whole namespace, and `controller`
selects every controller.

**Entering a query**

- **Separate several terms with commas or spaces** to match *any* of them at once —
  e.g. `role, permission` finds both areas so you can see how they wire together.
- It is **debounced** — the graph re-filters once you pause typing, so a big graph
  does not thrash on every keystroke.
- A live **match count** sits under the box, or **"No nodes match"** when a query
  finds nothing — so an empty canvas is never a mystery.
- The **✕** button (or **Esc**) clears the search.

**Two ways to search — Filter vs. Highlight**

A toggle under the box picks how much you see around the matches:

- **Filter** (the default) — trims the graph down to *just* the matches. Best for
  decluttering to one area.
- **Highlight** — shows each match together with the nodes it **directly connects
  to**, then spotlights the matches and dims those neighbours, framing just that
  slice. Best for seeing a match *in context* — what it wires into — instead of
  losing it as a speck in the full graph.

**Jumping & shortcuts**

- **Enter** jumps to the best match and frames it on the canvas (an exact name beats
  a prefix beats a substring; ties favour the shorter, more specific name).
- **⌘/Ctrl + K** — or **/** — focuses the search box from anywhere.
- If some matches are in a **switched-off layer or group**, the count row offers a
  **"show N in hidden layers"** link — one click re-enables exactly those layers so
  the hidden matches appear.
- Opening a different project clears the search.

## Schema source

A toggle to read the schema from the project's **live database** (via its `.env`)
instead of replaying migrations. It shows its status: "Reading from migrations",
"Connected — reading from the database", or "Could not connect — using migrations".
This is covered fully in [chapter 14, Database Schema](/database-schema).

## Layers — showing and hiding node kinds

The **Layers** section lists every node kind present in the project, each with a
count, e.g. *Models 42, Controllers 18, Tables 40, …*. Click a layer to hide or show
that kind. Visible layers sort to the top, hidden ones to the bottom, so the list
always reads "active, then off".

- **Hide all / Show all** toggles every layer at once.
- On a large graph, the detail layers start hidden — this is where you bring them
  back (see [chapter 4](/reading-the-graph#large-graphs-start-focused)).

The full list of kinds and what each means is in
[chapter 19, Reference](/reference#node-kinds).

## Groups — showing and hiding clusters

When a project has more than one group (modules, multiple packages, or Vendor), a
**Groups** section appears listing each group with a count. Click to hide/show a whole
group; **Hide all / Show all** toggles them together. The **Vendor** group starts
hidden. Grouping is explained in [chapter 1](/introduction#grouping).

## Links — showing and hiding edge kinds

The **Links** section lists every *kind of relationship* in the graph with a count —
Relationships, Foreign keys, Routes, Injects, Container resolves, Bindings, Queries,
Config reads, Model ↔ table, Package deps, Renders, View includes, Embedded components,
Dispatches, Job chains, Sends, Throws, Policy checks, Middleware, and so on. Click a
link category to hide or show those edges. (The eleven Eloquent relationship kinds —
`hasMany`, `belongsTo`, etc. — collapse into one **Relationships** toggle.)

At the bottom of this section is an **Edge labels** toggle to turn the text labels on
edges on or off. The full edge catalogue is in
[chapter 19, Reference](/reference#edge-kinds).

## Excluded paths

Skip whole folders from the scan to shrink the graph — covered in
[chapter 3](/opening-projects#scoping-a-scan-excluded-paths).

## Statistics

At the bottom, four counters summarise the current graph: **Nodes**, **Edges**,
**Unresolved**, and **Warnings**.

- **Unresolved** — references Knoten found but could not tie to a node (e.g. a
  relationship to a model that lives outside the scan). The rail lists a few of them;
  they are informational, surfaced for transparency rather than hidden.
- **Warnings** — files that could not be parsed during the scan.

---

## Analysis overlays (from the canvas / details panel)

Beyond hiding and showing, Knoten offers a few analytical *modes* that recolour or
spotlight the graph. These are toggled from the canvas toolbar and details panel:

### Heatmaps

Recolour every node by a chosen metric, turning the graph into a heatmap:

- **Coverage** — do your tests reach this class? 🟢 **green** = a test names the class
  directly (a `use`, `new`, `::class`, or static call) **or**, for a controller /
  Livewire component, a test exercises a route that dispatches to it. 🔴 **red** = a
  first-party class no test reaches. ⚪ **grey (n/a)** = a node with no class behind it
  — routes, tables, views, pages, channels, packages — which coverage can't score.
- **LOC** — lines of code per class (find the big files).
- **Degree** — how connected each node is (find the hubs).

Turn the heatmap off to return to kind-colours.

> **Coverage is a *reference* signal, not execution coverage.** Knoten never runs
> Pest/PHPUnit or reads line/branch coverage. It reads `tests/` statically and asks
> *"do the tests reach this class?"* — either by **naming** it, or by hitting a
> **route** that dispatches to it (feature tests exercise a controller through its
> route, never by naming the controller class). So green means *"a test touches this,"*
> not *"every line runs under test"* — a test that imports a class but never asserts on
> it still counts. Known blind spots: a controller reached only through a fully dynamic
> URL (`$this->get($url)`) or a non-numeric literal slug can still read as untested.
>
> **LOC** is a class's source-line span (declaration to closing brace, blank lines and
> comments included) — a faithful *relative* size, not logical lines of code.
> **Degree** counts every edge touching a node across the *whole* graph — each of the
> 11 Eloquent relationship kinds individually — regardless of which layers or links you
> currently have hidden.

### Highlight orphans

Lights up **likely-unused nodes** (nothing points to them) and dims everything else —
a quick way to spot dead-ish code, controllers no route reaches, tables no model maps
to, and so on. (The details panel's *Needs attention* flags call out specific cases
like these too — see [chapter 6](/details-panel).)

### Density

Switch the layout between **comfortable** (more breathing room) and **compact**
(tighter packing) to fit more on screen.

---

## Navigation tips

- **Pan** by dragging the canvas background; **zoom** with the scroll wheel or the
  on-canvas controls.
- **Click a node** to select and focus it (chapter 4). **Click the background** to
  deselect.
- Use the **minimap** in the corner for orientation on large graphs.
- Press **⌘/Ctrl + K** (or **/**) to jump to the search box, type a name, and hit
  **Enter** to fly straight to the best match.
- Search + the Layers/Links filters together are the fastest way to isolate a
  sub-system: hide everything except, say, models and tables, then search a name.

Next: [The Details Panel →](/details-panel)
