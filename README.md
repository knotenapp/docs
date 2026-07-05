---
title: Knoten Documentation
description: How to use and understand Knoten — the static architecture and database visualiser for Laravel.
slug: index
---

# Knoten Documentation

Knoten reads a Laravel project's source code and draws an **interactive map of its
architecture**: how routes, controllers, services, models, jobs, events, packages,
and database tables depend on one another. Nothing runs — it is pure static
analysis — so it is safe to point at any project, including one you have never
opened before.

This manual explains **how to use Knoten and how to understand what it shows you**.
It is organised into five sections, from first run to full reference.

> **New here?** Read [Introduction & Concepts](01-introduction.md) for the ideas,
> then [Installation](02-installation.md) to get it running. After that, jump to
> whatever you need.

## Contents

### 1. Getting Started
*What Knoten is, and how to get it running.*

- [Introduction & Concepts](01-introduction.md) — what Knoten is, and the graph model: nodes, edges, and confidence.
- [Installation & Setup](02-installation.md) — running the web app, the desktop app, and the requirements for each.
- [Opening a Project](03-opening-projects.md) — the welcome screen, the open dialog, recents, multiple roots, excludes, and rescanning.

### 2. Using the App
*Reading, navigating, and interrogating the architecture map.*

- [Reading the Graph](04-reading-the-graph.md) — the canvas: node cards, edges, colours, groups, and the confidence cues.
- [Filtering & Navigating](05-filtering-and-navigating.md) — the filter rail: search, layers, groups, links, heatmaps, orphans, density.
- [The Details Panel](06-details-panel.md) — the node inspector, plain-language summaries, metrics, flags, insights, legend.
- [Traces](07-traces.md) — request, dependency, impact, relationship, authorization, and connection-path traces.
- [Method Flow](08-method-flow.md) — drilling into a class to read each method as plain-language, branch-aware steps.
- [Contexts & Notes](09-contexts-and-notes.md) — drawing your own boundaries and pinning sticky notes onto the map.
- [Exporting](10-exporting.md) — saving the graph as a PNG image or as the full JSON data contract.

### 3. Enforcing Architecture
*Turning the map into rules you can check and gate merges on.*

- [Architecture Rules](11-architecture-rules.md) — the `knoten.php` rules file: node selectors, edge and confidence filters.
- [Rule Presets](12-rule-presets.md) — bundled boundary sets, and enabling or copying them from the UI or CLI.
- [Checking & CI](13-checking-and-ci.md) — running checks in the app, scaffolding a CI gate, and failing a build on violations.

### 4. Going Deeper
*Schema sources, the command line, the desktop build, configuration, and internals.*

- [Database Schema](14-database-schema.md) — migration replay vs. reading the live database, and schema drift.
- [Command Line](15-cli-commands.md) — the `knoten:scan`, `knoten:check`, and `knoten:preset` commands.
- [Desktop App](16-desktop-app.md) — native features, native menus, and building installers.
- [Configuration](17-configuration.md) — `config/knoten.php`, environment variables, preferences, and stored state.
- [How Analysis Works](18-how-it-works.md) — the scan pipeline, the extractors, caching, and why confidence exists.

### 5. Reference

- [Reference](19-reference.md) — every node kind and edge kind, the exported JSON shape, and a glossary.

---

## The 60-second tour

1. **Open a project** (§1.3). Knoten scans it and draws the graph.
2. **Read the map** (§2.1). Cards are your classes and tables; lines are the
   relationships; colour tells you the kind.
3. **Filter down** (§2.2). Hide layers you do not care about, search for a name, or
   turn on a heatmap.
4. **Click a node** (§2.3). The right panel explains it in plain words, lists every
   connection, and offers traces.
5. **Trace a flow** (§2.4). Follow a request from a URL to the database, or ask "what
   breaks if I change this?".
6. **Enforce it** (§3). Write architecture rules, check them in-app, and gate your CI.

> **A note on honesty.** Static analysis of Laravel can never be perfect. Knoten
> never pretends certainty: every node and edge carries a *confidence* level, and
> anything it inferred rather than proved is drawn dashed and labelled. See
> [Introduction](01-introduction.md#confidence) and [How Analysis Works](18-how-it-works.md).

---

## For maintainers of this docs repo

This folder is a **self-contained documentation source** designed to be published as
a docs site (e.g. a `docs.` subdomain) that fetches the Markdown from GitHub.

- **[`manifest.json`](manifest.json) is the navigation source of truth.** It defines
  the five sections and their pages, in order, with titles, slugs, files, and
  descriptions. Build your sidebar/nav from it rather than hard-coding chapters.
- **Each page carries YAML frontmatter** (`title`, `description`, `section`, `order`,
  `slug`) so a renderer can read metadata without parsing the body.
- **Slug/route rule:** a file's route is its filename with the leading `NN-` prefix
  and the `.md` extension removed (`03-opening-projects.md` → `opening-projects`).
  Rewrite relative in-body `*.md` links the same way. `README.md` is the home page
  (slug `index`). This rule is also recorded in `manifest.json` (`linkRule`).
- Chapters are numbered so they sort correctly when browsed directly on GitHub.
