---
title: Opening a Project
description: The welcome screen, the open dialog, recents, multiple roots, excludes, and rescanning.
section: Getting Started
order: 3
slug: opening-projects
---

# 3. Opening a Project

Knoten analyses a **project folder** — any directory that contains a Laravel
`artisan` file or a `composer.json`. This chapter covers every way to open one, plus
scoping and refreshing the scan.

## The Welcome screen

When Knoten has no project open, it shows the Welcome screen:

- A short description of what Knoten does.
- An **Open a project** button (see below).
- **Jump back in** — a quick-pick list of up to four projects, combining your
  **recently opened** projects and any **auto-discovered** ones. Click one to open it.
- Three feature cards summarising the architecture map, the code-to-database map,
  and Knoten's honest-confidence approach.

If you arrived here because a path could not be opened, the screen tells you which
path failed ("Couldn't find a Laravel project at …").

## The Open Project dialog

Click **Open a project** (on the Welcome screen or in the filter rail) to open the
dialog. There you can:

- **Type or paste an absolute path** to a project folder.
- **Pick from recent projects** — the last 10 projects you opened, most recent first.
- **Pick from discovered projects** — projects Knoten found automatically in your
  configured project roots (see [Configuration](17-configuration.md)).

On the **desktop app**, "Open a project" skips the dialog and opens your operating
system's native folder picker instead — choose a folder and Knoten opens it.

### What counts as a valid project

A folder is treated as a Laravel project if it contains **either** an `artisan`
file **or** a `composer.json`. If you point Knoten at something that is not a
project, it returns you to the Welcome screen with the failed path shown.

## Recent & discovered projects

- **Recent projects** are remembered automatically every time you successfully open
  one. The list holds the 10 most recent, and is stored in Knoten's own storage
  directory (`storage/knoten/recent.json`) — it is about *which projects you opened*,
  not their contents.
- **Discovered projects** are found by scanning the directories listed in
  `config/knoten.php` (`project_roots`). Each immediate sub-folder that contains an
  `artisan` file is offered. By default Knoten looks in a couple of sensible home
  locations; you can point it anywhere via the `KNOTEN_PROJECT_ROOTS` environment
  variable. See [chapter 17](17-configuration.md).

## Opening multiple roots at once

Knoten can analyse **several project roots together into one combined graph**. This
is how you answer *"how are my packages wired together?"* — open the main app and
its in-house packages at the same time, and dependencies from one into another show
up as edges between groups.

To do this, provide multiple paths separated by **commas or newlines** in the path
field. Class facts from every root are merged before analysis, so a reference from
one package into another's namespace becomes a real cross-package edge. When you open
more than one root, nodes group by the **project/package** they belong to (see
[grouping in chapter 1](01-introduction.md#grouping)).

The first path you list is treated as the **primary** root — its schema source and
any schema drift are what get badged in the UI.

## Scoping a scan: excluded paths

Large projects sometimes contain big areas you do not want on the map — an admin
panel (Filament, Nova), a generated SDK, and so on. You can **exclude folders** to
shrink the graph:

- In the filter rail, find the **Excluded paths** section.
- Type a **relative** path (e.g. `app/Filament`) and press Enter or click **+**.
- The graph re-scans with that folder skipped. Remove an exclusion with its **×**.

Excludes are relative to the project root, and each exclusion is part of the scan's
identity — a scoped scan is cached separately from the full one, so toggling excludes
is fast after the first build.

> Knoten *always* skips `vendor`, `node_modules`, `storage`, `public`, `.git`,
> `bootstrap`, and `tests` when collecting classes — you never need to exclude those.
> (Tests are still read separately, only to compute the "tested ×N" coverage signal.)

## Re-scanning

Knoten caches each project's graph and reuses it instantly when nothing has changed.
It automatically detects changes by fingerprinting every scanned PHP file (modified
time + size) plus the Composer manifests, so simply **re-opening a project after you
edit it** rebuilds the graph.

To force a fresh scan explicitly:

- **Web app:** click the circular **re-scan** button (↻) at the top of the filter rail.
- **Desktop app:** use **File → Re-scan** in the native menu (the in-app button is
  hidden there to avoid duplication).

A re-scan, an exclude change, or a schema-source toggle all keep you on the *same*
project, so your current filters, selection, and any active trace are preserved — the
view does not reset out from under you. Opening a *different* project resets the view.

## What happens during a scan

1. Knoten walks the project, parses every PHP file, and collects class facts.
2. It reads the database schema (from migrations by default — see
   [chapter 14](14-database-schema.md)).
3. It runs its extractors to build nodes and edges, then lays them out.
4. The result is cached and drawn on the canvas.

The first scan of a large project takes a few seconds; subsequent opens are instant
until the source changes.

Next: [Reading the Graph →](04-reading-the-graph.md)
