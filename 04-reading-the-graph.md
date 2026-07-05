---
title: Reading the Graph
description: The canvas — node cards, edges, colours, groups, and the confidence cues.
section: Using the App
order: 4
slug: reading-the-graph
---

# 4. Reading the Graph

Once a project is open you see the **workspace**: a filter rail on the left, the
graph canvas in the middle, and a details panel on the right. This chapter is about
the canvas — how to read the picture.

## Layout of the workspace

```
┌──────────────┬─────────────────────────────────┬──────────────┐
│  Filter rail │            Graph canvas          │  Details /   │
│  (chapter 5) │  (this chapter, chapters 7–9)    │  Insights    │
│              │                                  │ (chapter 6)  │
└──────────────┴─────────────────────────────────┴──────────────┘
```

Both side panels can be collapsed to a thin strip (and the details panel re-opens
whenever you select a node). The workspace is locked to the window height — the page
itself never scrolls; each panel owns its own scrollbar and the canvas stays put.

## Nodes: the cards

Each **card** on the canvas is one node — a class, a table, a route, a package. A
card shows:

- A **coloured dot / accent** indicating the node's kind (each kind has its own
  colour — models, tables, controllers, routes, services, etc. all differ).
- The node's **label** (usually the class name, or the route name/URI).
- Kind-specific detail depending on zoom (see *Level of detail* below) — a table
  card can show its columns; a route card shows its HTTP verb and URI; a controller
  shows a hint of its methods.

Colour is consistent everywhere: the same dot colour appears on the card, on
connection rows in the details panel, and in the **Legend** at the bottom of the
Insights panel. You never have to memorise it — the legend lists every kind present
in the current project.

## Edges: the lines

Lines between cards are **edges** — relationships. Their direction (the arrow) is
meaningful: it always runs **source → target**. For example:

- a route **→** the controller action it routes to,
- a controller **→** the table it queries,
- a model **→** a related model (a `belongsTo`/`hasMany` relationship),
- a class **→** the package it depends on.

### Solid vs. dashed

- **Solid** edges are **high-confidence** — proven from static facts.
- **Dashed** edges are **inferred** — likely by convention, but not proven. Treat
  them as strong leads rather than guarantees.

This is the single most important visual cue in Knoten: a dashed line means "the
analysis believes this but could not confirm it." (See
[confidence, chapter 1](/introduction#confidence).)

### Edge labels

By default, edges are labelled with what kind of relationship they are. You can turn
edge labels off in the **Links** section of the filter rail to declutter a dense
graph (see [chapter 5](/filtering-and-navigating)).

## Groups

Related nodes are tinted/organised by their **group** — a module, the app itself, a
package, or Vendor. This is what makes a modular monolith read as clusters and a
multi-package scan read as separate territories with links between them. You can show
or hide whole groups from the filter rail's **Groups** section (which only appears
when a project has more than one group).

## Level of detail (zoom)

The canvas adapts what each card shows to the current zoom, so a zoomed-out overview
stays legible and a zoomed-in view is rich:

- **Zoomed out:** cards shrink to their essentials (dot + label) so you can see the
  whole shape of the app.
- **Zoomed in:** cards reveal more — a table's columns, a controller's methods, a
  route's verb and path.

Pan by dragging the canvas background; zoom with the scroll wheel or the on-canvas
zoom controls. A **minimap** and zoom controls sit in a corner of the canvas.

## Automatic layout

Knoten arranges the graph automatically using a layered (left-to-right) layout, so
upstream things (routes) tend to sit to the left and downstream things (tables) to
the right — a request reads naturally across the canvas. The layout runs in a
background worker so even large graphs do not freeze the window; on a very large or
dense graph Knoten trades some layout polish for speed, and if the layout ever fails
it falls back to a simple grid so the graph always appears.

You can adjust how tightly the graph is packed with the **density** control
(comfortable vs. compact) — see [chapter 5](/filtering-and-navigating).

## Large graphs start focused

A big project can have thousands of nodes — too many to show every layer at once and
still be readable. So above ~150 nodes Knoten **trims the first view to the
architecture backbone** (routes, controllers, models, tables, services, and the main
flow participants) and starts the *detail layers* hidden — form requests, views,
traits, interfaces, enums, console commands, providers, events, listeners, observers,
channels, packages. Every hidden layer is one click away in the filter rail.

The **Vendor** group also starts hidden regardless of graph size, since third-party
code is external to the architecture you are mapping.

## Selecting and focusing

- **Click a node** to select it. The details panel (chapter 6) fills with everything
  about it, and the canvas **gathers its neighbourhood in around it** so its direct
  connections are framed close-up instead of scattered across the canvas.
- **Click the background** (deselect) to release the focus — the gathered nodes glide
  back to their real positions and the full graph reframes.
- **Search** (chapter 5) highlights matching nodes.

## What you can do from here

- Filter and search the graph → [chapter 5](/filtering-and-navigating).
- Inspect a node in depth → [chapter 6](/details-panel).
- Follow a flow or find a blast radius → [chapter 7, Traces](/traces).
- Read a class's methods as plain steps → [chapter 8, Method Flow](/method-flow).
- Draw your own boundaries and notes → [chapter 9](/contexts-and-notes).

Next: [Filtering & Navigating →](/filtering-and-navigating)
