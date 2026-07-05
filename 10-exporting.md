---
title: Exporting
description: Saving the graph as a PNG image or as the full JSON data contract.
section: Using the App
order: 10
slug: exporting
---

# 10. Exporting

Knoten can export the current graph two ways: as a **PNG image** (to drop into docs, a
wiki, or a slide) and as **JSON** (the full underlying data). Both are triggered from
the canvas toolbar.

## Export as PNG

Renders the graph to a high-resolution image (2400 × 1600). Importantly, it **fits the
whole graph into the image regardless of your current zoom or pan** — so the export is
complete even if you were zoomed into a corner. The image uses your current theme's
background colour, so a dark-theme export looks right on a dark page.

- **Web app:** the PNG downloads to your browser's downloads folder, named after the
  project (e.g. `my-app-knoten.png`).
- **Desktop app:** a native **Save As** dialog opens first (instantly), then Knoten
  writes the image straight to the path you choose — this avoids the browser's slow
  "buffer the whole image, then prompt" behaviour on large graphs.

> **Tip:** filter the graph down before exporting. A PNG of the full backbone reads
> far better than a PNG of every layer at once. Turn off edge labels
> ([chapter 5](05-filtering-and-navigating.md)) for a cleaner picture, or focus a
> context ([chapter 9](09-contexts-and-notes.md)) to export just one domain.

The PNG captures what is currently visible and laid out — your filters, heatmap, and
focus all show through — so you can compose the exact view you want, then export it.

## Export as JSON

Downloads the **complete project graph** as JSON — the same data contract the backend
produces and the same one the `knoten:scan --output` command writes
([chapter 15](15-cli-commands.md)). The file is named `<project>-knoten.json`.

The JSON contains everything: every node (with kind, label, file, line, fully-qualified
name, confidence, and metadata), every edge (with kind, source, target, confidence,
detail, and call sites), the project profile, statistics, unresolved references,
parse warnings, and the schema source/drift. The full shape is documented in
[chapter 18](18-how-it-works.md) and [chapter 19](19-reference.md).

### What JSON export is good for

- **Feeding other tools** — pipe the graph into your own scripts, dashboards, or
  diagram generators.
- **Diffing architecture over time** — export on each release and compare.
- **Sharing an exact snapshot** — hand someone the JSON and they have the whole map
  without re-scanning.
- **Programmatic checks** beyond the built-in rule engine.

Because it is the same contract everywhere (in-app, CLI, and export), anything you
build against the JSON works regardless of which produced it.

Next: [Architecture Rules →](11-architecture-rules.md)
