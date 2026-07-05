---
title: The Details Panel
description: The node inspector, plain-language summaries, metrics, flags, insights, and legend.
section: Using the App
order: 6
slug: details-panel
---

# 6. The Details Panel

The panel on the right has two faces:

- **Insights** — shown when nothing is selected: a read of the *whole* project.
- **Node view** — shown when you select a node: everything about that one thing.

Both let you click through to related nodes, so the panel doubles as a navigator.
The panel can be collapsed to a thin strip and re-opens when you select a node.

---

## Insights (nothing selected)

When no node is selected, the panel summarises the whole graph. Click any item to
focus it on the canvas; select a node to switch to the node view.

- **Project profile** — the project's name, description, and stack: PHP and Laravel
  versions, the database engine, and recognised technologies (Inertia, Livewire,
  Volt, Fortify, Sanctum, Filament, React, Vue, Tailwind, Pest, and more). This is
  read from the project's `composer.json`, `composer.lock`, `package.json`, and `.env`.
- **Hotspots** — the five most-connected nodes, central to your architecture. These
  are the classes worth understanding first.
- **Database access map** — every table with a count of how many code paths reach it,
  and a "no model" flag for tables that no Eloquent model maps to.
- **Schema drift** — shown only when you are reading a live database and it disagrees
  with your migrations (see [chapter 14](/database-schema)).
- **Needs attention** — orphan tables (no model) and unresolved references.
- **Legend** — every node kind present in the project with its colour, plus a
  reminder that dashed edges and amber dots mark *inferred* links, and *LOC* = lines
  of code.

---

## Node view (a node selected)

Selecting a node fills the panel with a structured breakdown. From top to bottom:

### Header

- The node's **kind** (with its colour dot) and a one-line **plain-language
  explanation** of what that kind is — e.g. *"An Eloquent model — a PHP class mapped
  to a database table."*
- The node's **name** and **namespace**.

### Badges

A row of context badges when relevant, such as:

- the **group / module** it belongs to,
- **Hotspot** — among the most-connected nodes,
- **table:** — the table a model maps to,
- **lines of code**,
- **Laravel package** — a package that ships a service provider,
- **tested ×N** — how many test files reference it,
- **Scheduled** (and its cadence, e.g. `daily`) — for commands/jobs on the scheduler,
- **inferred** — the node was resolved by convention, not proven.

### In plain words

For the common kinds (models, controllers, services, actions, jobs, routes, tables),
Knoten writes **a few plain-English sentences** describing what the node is and does,
built from its metadata and connections — for readers who want the gist without the
technical labels. For example, a model might read: *"Post is a type of record your app
stores and works with. Each one is saved in the 'posts' table. It's linked to other
records: Comments, User…"*

### Metrics

- **Connections** — total links, split into *in* and *out*.
- **Used by** — how many nodes depend on this one *directly*, and the *total impact*
  (everything that reaches it transitively — its full blast radius as a number).

### Reveal / Open

Two buttons (when the node has a source file):

- **Reveal** — show the file in your OS file manager.
- **Open** — open the file in your editor, **at the exact line**. Which editor is used
  comes from your Editor preference (Settings) — VS Code, Cursor, Windsurf, Zed,
  PhpStorm, WebStorm, IntelliJ, Sublime, or the system default. Editors are opened via
  their deep-link URL scheme so you jump straight to the code. See
  [chapter 17](/configuration#editor-preference).

### Needs attention

Warnings specific to this node, such as:

- *"No route points to this controller — possibly unused."*
- *"No Eloquent model maps to this table."*
- *"No table backs this model."*
- *"N unresolved references from this node."*

### Route details

For a route: its HTTP method badges, the URI, and the controller action it maps to.

### Trace & explore actions

A set of buttons that launch analyses on the canvas — this is one of Knoten's most
powerful features, covered in full in [chapter 7, Traces](/traces). Depending on
the node kind you may see:

- **Explore methods** — open the class on the canvas to read each method's flow
  ([chapter 8](/method-flow)).
- **Trace this request** — follow a request from a route to the database.
- **Trace dependencies** — everything this node reaches downstream.
- **Trace impact** — everything that depends on this node (blast radius).
- **Trace relationships** — how a model links to other models.
- **Trace authorization** — the guard chain protecting a route/controller.
- **Find path to…** — pick another node and show the shortest connection between them.

### Structure

Depending on the kind, the panel then lists the node's internals:

- **Methods**, **Fillable** attributes, **Casts** (attribute → type), **Query
  scopes**, **Traits**.
- For a table: its **Columns** (name, type, nullable) and the **migrations** that
  defined it.
- For a package: a **View on Packagist** link.

### Connections

Finally, every connection grouped by relationship, with plain headings that read
naturally in each direction — *"Reads / writes these tables"* / *"Accessed by this
code"*, *"Depends on (injected)"* / *"Injected into"*, *"Handled by"* / *"Exposed by
these routes"*, *"Relationships"* / *"Inverse relationships"*, and so on. Each row:

- shows the connected node's colour dot and label,
- click it to **jump to that node**,
- shows the relationship type (e.g. `belongsTo`) and any detail,
- carries a small **amber dot** when the link is *inferred* rather than proven.

Long lists are capped with a "Show N more" expander so a hub node does not render
hundreds of rows at once.

---

## Using the panel to navigate

Because every connection row and every Insights item is clickable, the fastest way to
explore an unfamiliar codebase is often to **click your way through the panel**: start
at a hotspot, read its plain-words summary, jump to a connection, read that one, and
so on — the canvas keeps up, focusing each node as you go.

Next: [Traces →](/traces)
