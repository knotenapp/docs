---
title: Introduction & Concepts
description: What Knoten is, and the graph model — nodes, edges, and confidence.
section: Getting Started
order: 1
slug: introduction
---

# 1. Introduction & Concepts

## What Knoten is

Knoten (German for "node" or "knot") is a **static architecture and database
visualiser for Laravel projects**. You point it at a project folder; it parses
every PHP file, reads the migrations, routes, and Composer manifests, and builds a
single interactive graph of the whole application. From that graph you can:

- See the **architecture map** — routes → controllers → services → models →
  tables, plus jobs, events, listeners, policies, notifications, packages, and more.
- See the **code-to-database map** — exactly which controllers, services, actions,
  and components read or write each table, bridged through Eloquent models.
- **Trace a request** from a URL through middleware, validation, authorization, and
  business logic all the way to the database.
- Find a node's **blast radius** — everything that would be affected if you changed it.
- **Enforce architecture rules** (e.g. "controllers must not query tables directly")
  and gate your CI on them.

It is **read-only and offline by default**. Knoten never boots the target app,
never runs its code, and (unless you explicitly ask it to read a live database)
never needs any credentials. This is why it is safe to open a project you have
never seen.

## What it is *not*

- It is **not a runtime profiler.** It does not observe your app while it runs; it
  reads the source. A relationship that only exists at runtime (a fully dynamic
  string class name, say) may show as *unresolved* rather than as a firm edge.
- It is **not a linter or formatter.** It maps structure and can enforce *dependency
  boundaries*, but it does not check code style.
- It **does not modify your project** — except for the two features that write files
  on your explicit request: enabling/copying rule presets and scaffolding a CI gate,
  both of which only ever touch `knoten.php` and a workflow file, and never overwrite
  without confirmation.

## The graph model

Everything Knoten shows is built from one data structure: the **project graph**. It
has two kinds of parts.

### Nodes

A **node** is one thing in your application — a model, a controller, a database
table, a route, a package, and so on. Each node has:

- a **kind** (its type — see the [full catalogue](/reference#node-kinds)),
- a **label** (usually the class basename, e.g. `PostController`),
- optionally a **file** and **line** (so it can be opened in your editor),
- a **fully-qualified class name** (for PHP classes),
- a **confidence** level, and
- **metadata** (lines of code, columns, HTTP methods, relationships, and so on).

Knoten recognises **34 node kinds** — from the obvious (models, controllers,
routes, tables) to the fine-grained (form requests, API resources, jobs, policies,
middleware, actions, Livewire/Volt components, Blade views, events, listeners,
observers, broadcast channels, notifications, mailables, exceptions, validation
rules, casts, query scopes, Blade components, factories, seeders, service
providers, console commands) down to generic classes, interfaces, traits, and enums.
Anything a specialised detector does not claim still becomes a node, so a package
or module shows *all* of its files — nothing is silently dropped.

### Edges

An **edge** is a directed relationship between two nodes — "this controller
**routes-to** that action", "this model **belongsTo** that model", "this service
**queries** that table". Each edge has:

- a **kind** (see the [full catalogue](/reference#edge-kinds)),
- a **source** and a **target** node,
- a **confidence** level,
- an optional **detail** (e.g. the relationship method name), and
- optional **call sites** — the exact method and line where the relationship
  originates, so a click can jump you straight to the code.

Edges are always read **source → target**. A request flows *forward* along the
arrows; asking "what depends on me?" walks them *backwards*.

## <a id="confidence"></a>Confidence: honesty over certainty

Static analysis of a dynamic framework like Laravel can never be 100% certain. A
model's table name might be a convention or an explicit property; a job dispatch
might be a plain call or hidden behind a variable. Rather than pretend, Knoten
attaches a **confidence** level to *every* node and edge:

| Level | Meaning | How it looks |
|-------|---------|--------------|
| **High** | Resolved from unambiguous static facts — typed constructor injection, `Model::class` arguments, explicit relationships. | Solid line, no warning marker. |
| **Inferred** | Resolved by convention or best-effort inference — default table names, naming-convention matches, method-body references. | **Dashed** edge and an **amber dot**. |
| **Dynamic** | Could not be resolved statically at all — surfaced for transparency, never guessed. | Reported as an *unresolved reference* in the panel. |

Wherever you see a dashed line or a small amber dot, read it as *"likely, but the
analysis could not prove it."* This lets you trust the solid parts of the map
completely, and treat the inferred parts as leads. See
[chapter 18](/how-it-works) for exactly how each kind is detected.

## Grouping

Every node is also assigned a **group** so related code reads as a cluster:

- **Single project:** nodes group by **module** when the project uses a modular
  layout (a `module.json` alongside a namespace, e.g. `Modules/Billing`), and
  everything else falls under **App**.
- **Multiple roots** (you can open several packages at once): nodes group by the
  **project/package** they belong to, so cross-package dependencies become visible
  as links *between* groups — the answer to "how are my packages connected?".
- **Third-party Composer packages** always group under **Vendor** (and start hidden).

## Where to go next

- Get it running → [chapter 2, Installation](/installation).
- Understand the picture on screen → [chapter 4, Reading the Graph](/reading-the-graph).
- See the exhaustive list of every node and edge type → [chapter 19, Reference](/reference).
