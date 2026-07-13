---
title: Rule Presets
description: Bundled boundary sets, and enabling or copying them from the UI or CLI.
section: Enforcing Architecture
order: 12
slug: rule-presets
---

# 12. Rule Presets

Writing architecture rules from scratch is work. **Presets** are named, reusable sets
of rules — battle-tested boundaries you can adopt by name in one line, or copy into
your project and tweak. They are the fastest way to start enforcing architecture.

## What a preset is

A preset is a curated bundle of [rules](/architecture-rules) shipped *inside*
Knoten, referenced by a short name. Pulling one in is a one-line edit to your
`knoten.php`:

```php
return [
    'presets' => [
        'laravel-layers',
    ],
];
```

That's it — every rule in the `laravel-layers` preset is now enforced, without you
copying anything. The rules stay bundled with Knoten, so they can improve over time
without you re-copying them.

## The bundled presets

Knoten ships four presets out of the box:

| Preset | Title | What it enforces |
|--------|-------|------------------|
| **`laravel-layers`** | Layered architecture | A one-way HTTP → service → model dependency direction, and keeps raw database access out of controllers. |
| **`thin-controllers`** | Thin controllers | Keeps business logic out of controllers, pushing it into services/actions. |
| **`domain-purity`** | Domain purity | Keeps the domain (models) unaware of the layers above it (controllers, HTTP concerns). |
| **`console-isolation`** | Console isolation | Keeps console/command concerns from leaking into the wrong layers. |

`laravel-layers`, for example, contains rules such as *"Controllers must not query the
database directly"*, *"Services must not depend on controllers"*, *"Models must not
depend on services"*, and *"Models must not depend on controllers"*.

> **Preview a preset before adopting it.** In the presets dialog you can expand any
> preset to read its **actual PHP source** — every rule it contains — so there is no
> mystery about what enabling it will enforce.

## Two ways to use a preset

There are **two distinct actions**, and the difference matters:

### Enable (by name) — *linked*

Adds the preset's **name** to your `presets` array. The rules themselves stay inside
Knoten. Pro: you inherit improvements to the preset automatically; your `knoten.php`
stays tiny. This is the default, recommended way.

### Copy as editable rules — *unlinked*

Copies the preset's rules **inline** into your `rules` array, prefixed with a comment
noting where they came from, so **you own and can edit them**. Pro: full control — tweak
names, tighten selectors, delete rules you disagree with. Trade-off: the copy is
deliberately *unlinked* — it will **not** track future updates to the preset. Use this
when you want a preset as a starting point rather than a subscription.

## Managing presets from the app (no terminal)

Open the **Presets** tile in the filter rail. The dialog lists every bundled preset with
its title, description, and rule count, and for each one you can:

- **Enable / disable** it with the checkbox — this edits your project's `knoten.php`
  (creating the file if the project has none yet). Each row reflects the server's
  authoritative "enabled" state after the write.
- **Expand** it to preview its full PHP source.
- **Copy as editable rules** — copies its rules inline for you to edit.

This is the web/desktop equivalent of the `knoten:preset` command, so a user with no
terminal can adopt a boundary set entirely from the UI. Every action writes directly
to the project's `knoten.php`.

## Managing presets from the command line

The `knoten:preset` command does the same three things from a terminal:

```bash
# List every available preset with its rule count and description.
php artisan knoten:preset list

# Enable a preset in a project's knoten.php (creates the file if needed).
php artisan knoten:preset add laravel-layers

# Remove a preset from the file.
php artisan knoten:preset remove laravel-layers

# Target a specific project (defaults to the current working directory).
php artisan knoten:preset add thin-controllers --path=/absolute/path/to/project
```

An unknown preset name is rejected up front, so you never write a name that would later
fail a check. See [chapter 15](/cli-commands) for all CLI details.

## How editing your file is kept safe

Whether you enable or copy from the UI or the CLI, Knoten edits your `knoten.php` as
**precise string transforms** — it adds a name to the `presets` array or renders rules
into the `rules` array **without reformatting the rest of the file**. Your comments,
spacing, and hand-written rules are left untouched. When reading which presets are
enabled, Knoten *parses* the array rather than executing the file, so it never runs
your config as code and correctly ignores commented-out examples like
`// 'laravel-layers',`.

## Adopting presets — a good path

1. Open **Presets**, expand `laravel-layers`, and read what it enforces.
2. **Enable** it. If your project has no `knoten.php`, one is created for you.
3. Run **Check architecture** ([chapter 13](/checking-and-ci)) to see where you already
   comply and where you do not.
4. If a rule is too strict for your project, **copy** the preset and edit the offending
   rule (add a `confidence => 'high'` filter, narrow a selector, or remove it).
5. Add your own project-specific rules alongside.
6. Wire it into CI ([chapter 13](/checking-and-ci)).

Next: [Checking & CI →](/checking-and-ci)
