---
title: Traces
description: Request, dependency, impact, relationship, authorization, and connection-path traces.
section: Using the App
order: 7
slug: traces
---

# 7. Traces

A **trace** walks the graph from a starting node, following a chosen set of
relationships in a chosen direction, and highlights the whole path it finds. Traces
turn the static map into a set of answers to concrete questions: *"what happens when
this URL is hit?"*, *"what breaks if I change this?"*, *"how do these two classes even
relate?"*

While a trace is active the canvas shows only the traced path (everything else dims),
lays it out as a readable sequence, and a small trace panel lets you step through it.

## Starting a trace

Select a node, then use the **trace buttons** in the details panel
([chapter 6](/details-panel)). Which buttons appear depends on the node — you
will not see "Trace this request" unless you have a route selected, for instance.
Clear a trace to return to the full graph.

## The six traces

### 1. Request trace

**Start from:** a route. **Direction:** forward.

Follows a request from a URL **all the way through to the database** — through its
middleware, form-request validation, policy/authorization checks, the controller
action, any services/actions/jobs it delegates to, the events it fires, the pages it
renders, and finally the tables it reads or writes. This is the "what actually happens
when someone hits this endpoint" view.

Siblings at the same step are ordered the way a request really unfolds: guards first
(middleware, validation), then the controller, then what it pulls in, then the data
layer.

### 2. Dependency trace

**Start from:** any depend­able node (controller, service, model, job, action, …).
**Direction:** forward.

The forward counterpart to the impact trace: **everything this node reaches** — the
data and code it relies on downstream. From a job or action this is the
async/background fan-out; from a service or controller it is its downstream data and
call graph.

### 3. Impact trace (blast radius)

**Start from:** any depend­able node. **Direction:** reverse.

**Everything that depends on this node** — what would be affected if you changed or
removed it. It walks the dependency edges *backwards*, and includes foreign keys (a
table's dependents include the tables that reference it). This is the trace to run
before a refactor: it answers "if I touch this, what do I need to check?"

Routes are excluded as starting points here — nothing flows *into* a route, so its
blast radius is empty; use a request trace from a route instead.

### 4. Relationship map

**Start from:** a model. **Direction:** both ways.

Walks a model's **Eloquent relationships** (and their inverses) to show how it links
to other models — the local ER picture centred on one model. It deliberately follows
*only* relationship edges, so you see data relationships without the call-graph noise.

### 5. Authorization trace

**Start from:** a route or controller. **Direction:** forward.

The **guard chain** for a request: the middleware, form request, and controller it
flows through, the services/actions/jobs that handle it, and the policies and models
that authorize it. It answers *"what gates this endpoint?"* — following the
call-delegation edges so authorization is found wherever it lives (a controller, a
form request's `authorize()`, a middleware's `handle()`, or a service the request
reaches). It intentionally omits the data/view/event fan-out that the request trace
shows, so you see only the protection layer.

### 6. Connection path ("Find path to…")

**Start from:** any node, **to** any other node. **Direction:** both ways.

Pick a second node and Knoten shows the **shortest connection path(s)** between the
two — every node and edge that lies on a shortest route from one to the other. This
answers *"how do these two things relate at all?"* Use the **Find path to…** button in
the details panel, then search and pick the destination. If the two are not connected
by any real relationship, Knoten tells you so rather than inventing a path.

> "Real relationship" here means call/data flow, foreign keys, and Eloquent
> relationships — not incidental structural links like sharing a base class, so two
> unrelated classes never look "connected" just because they both extend `Model`.

## Reading a trace

- The **highlighted nodes** are the path; everything else dims.
- **Depth** is distance from the start in hops (the start node is depth 0). The trace
  panel and layout order the path by depth, so it reads as a sequence.
- The **edge that first reached** each node tells you *how* it got there (its label).
- A **playhead** animation can step through the path hop by hop, at selectable speeds,
  so you can watch a request propagate.

## Choosing the right trace

| Your question | Trace |
|---------------|-------|
| What happens when this URL is hit? | **Request** (from a route) |
| What does this class rely on? | **Dependency** |
| What breaks if I change this? | **Impact** |
| How is this model related to others? | **Relationship map** |
| What protects this endpoint? | **Authorization** |
| How do A and B relate at all? | **Connection path** |

## Under the hood

All six traces are the *same* breadth-first engine with different presets — a set of
edge kinds, a direction, and which node kinds are valid start points. This is why they
feel consistent, and why new trace types can be added without new machinery. See
[chapter 18](/how-it-works) if you want the details.

Next: [Method Flow →](/method-flow)
