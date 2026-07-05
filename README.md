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

> **New here?** Read [Introduction & Concepts](/introduction) for the ideas,
> then [Installation](/installation) to get it running. After that, jump to
> whatever you need.

## Contents

### 1. Getting Started
*What Knoten is, and how to get it running.*

- [Introduction & Concepts](/introduction) — what Knoten is, and the graph model: nodes, edges, and confidence.
- [Installation & Setup](/installation) — running the web app, the desktop app, and the requirements for each.
- [Opening a Project](/opening-projects) — the welcome screen, the open dialog, recents, multiple roots, excludes, and rescanning.

### 2. Using the App
*Reading, navigating, and interrogating the architecture map.*

- [Reading the Graph](/reading-the-graph) — the canvas: node cards, edges, colours, groups, and the confidence cues.
- [Filtering & Navigating](/filtering-and-navigating) — the filter rail: search, layers, groups, links, heatmaps, orphans, density.
- [The Details Panel](/details-panel) — the node inspector, plain-language summaries, metrics, flags, insights, legend.
- [Traces](/traces) — request, dependency, impact, relationship, authorization, and connection-path traces.
- [Method Flow](/method-flow) — drilling into a class to read each method as plain-language, branch-aware steps.
- [Contexts & Notes](/contexts-and-notes) — drawing your own boundaries and pinning sticky notes onto the map.
- [Exporting](/exporting) — saving the graph as a PNG image or as the full JSON data contract.

### 3. Enforcing Architecture
*Turning the map into rules you can check and gate merges on.*

- [Architecture Rules](/architecture-rules) — the `knoten.php` rules file: node selectors, edge and confidence filters.
- [Rule Presets](/rule-presets) — bundled boundary sets, and enabling or copying them from the UI or CLI.
- [Checking & CI](/checking-and-ci) — running checks in the app, scaffolding a CI gate, and failing a build on violations.

### 4. Going Deeper
*Schema sources, the command line, the desktop build, configuration, and internals.*

- [Database Schema](/database-schema) — migration replay vs. reading the live database, and schema drift.
- [Command Line](/cli-commands) — the `knoten:scan`, `knoten:check`, and `knoten:preset` commands.
- [Desktop App](/desktop-app) — native features, native menus, and building installers.
- [Configuration](/configuration) — `config/knoten.php`, environment variables, preferences, and stored state.
- [How Analysis Works](/how-it-works) — the scan pipeline, the extractors, caching, and why confidence exists.

### 5. Reference

- [Reference](/reference) — every node kind and edge kind, the exported JSON shape, and a glossary.

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
> [Introduction](/introduction#confidence) and [How Analysis Works](/how-it-works).

---

## For maintainers of this docs repo

This folder is a **self-contained documentation source** designed to be published as
a docs site (e.g. a `docs.` subdomain) that fetches the Markdown from GitHub.

- **[`manifest.json`](manifest.json) is the navigation source of truth.** It defines
  the five sections and their pages, in order, with titles, slugs, files, and
  descriptions. Build your sidebar/nav from it rather than hard-coding chapters.
- **Each page carries YAML frontmatter** (`title`, `description`, `section`, `order`,
  `slug`) so a renderer can read metadata without parsing the body.
- **Slug/route rule:** a page's route is `/` + its slug, where the slug is the
  filename with the leading `NN-` prefix and the `.md` extension removed
  (`03-opening-projects.md` → `/opening-projects`). The home page (`README.md`) is
  served at `/`. In-body links between pages are **already written as absolute
  `/slug` routes**, so no rewriting is needed. This is also recorded in
  `manifest.json` (`linkRule`).
- Chapters are numbered so they sort correctly when browsed directly on GitHub.

## License

The Knoten Documentation is licensed under
[Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE) — you are free
to share and adapt it, including commercially, with attribution.
