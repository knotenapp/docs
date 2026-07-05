---
title: Contexts & Notes
description: Drawing your own boundaries and pinning sticky notes onto the map.
section: Using the App
order: 9
slug: contexts-and-notes
---

# 9. Contexts & Notes

Knoten discovers your architecture automatically, but *you* often know things the code
does not spell out — "these twelve classes are really the Billing domain", or "start
reading here". **Contexts** and **notes** let you annotate the map with that knowledge.

Both are **your own annotation layer**, saved per project in the app's local storage.
They are never part of the analysed graph and never touch your source files — they are
purely a lens you draw on top.

## Contexts (boundaries)

A **context** is a named boundary you draw around a cluster of nodes — a "Billing
domain", a "User management" area, a "Legacy" zone. It reads on the canvas as a
labelled, coloured fence around its members.

### Creating a context

1. Switch the canvas to **region (draw) mode** — the cursor becomes a crosshair.
2. Either **click nodes** to pick them one by one, or **drag a marquee** across the
   canvas to select everything inside the box.
3. **Commit** the selection. Knoten creates the context, gives it a default name
   ("Context 1"), a distinct colour, frames it, and drops you back to navigate mode.

The box itself is derived from the live positions of the member nodes, so it moves
with them if the layout changes.

### Managing contexts

From the contexts panel you can:

- **Rename** a context inline (double-purpose: a clearer label than "Context 2").
- **Recolour** it — cycle through a palette of distinct hues.
- **Focus** it — its members stay lit while everything else dims, and the canvas
  frames and zooms to it. Click it again to release the focus.
- **Edit members** — re-enter draw mode pre-loaded with the current members, then add
  or remove nodes and save.
- **Remove** it.

Contexts are automatically saved as you create and edit them, scoped to the current
project. Open a different project and you see that project's contexts (and none of the
first project's).

## Notes (sticky notes)

A **note** is a freeform sticky note pinned to a fixed spot on the canvas — an
onboarding pointer, a "TODO: split this up", a "start here" marker.

### Using notes

- **Add** a note at a canvas position; it starts empty and picks a pastel colour.
- **Type** into it to set its text.
- **Drag** it to reposition (the position saves when you finish dragging).
- **Recolour** it — cycle the pastel palette.
- **Remove** it.

Like contexts, notes are saved per project in local storage and never modify your
source.

## Where this data lives

Contexts and notes are stored in the browser's / desktop app's `localStorage`, keyed
by project path:

- contexts under `knoten:regions:<project-path>`
- notes under `knoten:annotations:<project-path>`

Consequences worth knowing:

- They are **per machine / per browser profile.** They do not travel with the project
  and are not shared with teammates through the repo.
- Clearing site data (or using a different browser) loses them.
- They survive re-scans and reopening the same project.

## When to use which

- Use a **context** to name a *group of nodes* — a domain, a module, a bounded area.
- Use a **note** to leave a *message at a spot* — guidance, a reminder, a warning.

Together they turn Knoten from a generated diagram into a living map annotated with
your team's understanding.

Next: [Exporting →](10-exporting.md)
