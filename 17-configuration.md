---
title: Configuration
description: config/knoten.php, environment variables, preferences, and stored state.
section: Going Deeper
order: 17
slug: configuration
---

# 17. Configuration

Knoten needs very little configuration to run. This chapter covers the few settings
that exist: where it looks for projects, your in-app preferences, and the environment
variables the desktop build uses. Most users only ever touch the project-roots setting
(and only if auto-discovery misses their projects).

## In-app preferences

Two preferences are exposed in the UI, both stored **locally** (in the browser /
desktop app), requiring no account:

### Appearance (theme)

Light, dark, or follow-the-system theme. The choice is remembered in a cookie and
respected across the whole app; exported PNGs use the active theme's background
([chapter 10](/exporting)). Reach it from **Settings** in the filter rail.

### <a id="editor-preference"></a>Editor preference

Which editor the **Open** action uses to jump to a file at a line
([chapter 6](/details-panel#reveal--open)). Options: **System default**, VS Code,
VS Code Insiders, Cursor, Windsurf, Zed, PhpStorm, WebStorm, IntelliJ IDEA, and
Sublime Text. Each specific editor opens via its deep-link URL scheme (e.g.
`vscode://file/…`), jumping straight to the file and line; "System default" uses the OS
file association. The choice is saved locally and persists across sessions.

## Project discovery — `config/knoten.php`

The one server-side setting worth knowing. It controls which directories are scanned to
**auto-discover** Laravel projects for the Open dialog and the Welcome screen's
quick-picks ([chapter 3](/opening-projects)):

```php
// config/knoten.php
return [
    'project_roots' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('KNOTEN_PROJECT_ROOTS', '~/sites, ~/sites/invoxpro')),
    ))),
];
```

- Each **immediate child folder** of a root that contains an `artisan` file is offered
  as a discoverable project.
- Paths may use **`~`** for the current user's home directory.
- Override the default with the **`KNOTEN_PROJECT_ROOTS`** environment variable — a
  **comma-separated** list — to scan wherever your projects live:

  ```dotenv
  KNOTEN_PROJECT_ROOTS="~/code, ~/work/clients, /var/www"
  ```

This only affects *discovery*. You can always open a project by typing/pasting its
path, regardless of the roots.

## Environment variables

### `KNOTEN_PROJECT_ROOTS`

Comma-separated project-discovery roots (see above).

### `KNOTEN_STORAGE_PATH`

Points Laravel's storage directory somewhere writable. The **desktop build** sets this
so it can keep the app folder read-only and relocate writable state (the storage
directory and SQLite database) to a per-user location. On the web app you normally
leave it unset and use the default `storage/` directory. When set, Knoten uses it as
its storage path at boot.

## Where Knoten keeps its own state

Knoten stores a little state about *your usage* (never about your project's contents
beyond the cached graph):

| What | Where |
|------|-------|
| Recent projects list | `storage/knoten/recent.json` |
| Graph cache (per project + scope + schema source) | `storage/knoten/cache/` |
| Contexts (drawn boundaries) | Browser/desktop `localStorage`, per project |
| Notes (sticky notes) | Browser/desktop `localStorage`, per project |
| Editor preference, theme | Browser/desktop `localStorage` / cookie |

The graph cache is keyed by a fingerprint of the scanned files, so it invalidates
itself whenever your source changes — you never need to clear it manually. See
[chapter 18](/how-it-works#caching).

## Standard Laravel configuration

Knoten is a Laravel app, so the usual `config/` files exist (`app.php`, `database.php`,
`session.php`, `cache.php`, `logging.php`, `fortify.php`, `inertia.php`, and so on).
For normal use you do not need to touch any of them — the defaults are set up for a
local, single-user, SQLite-backed tool. The Fortify auth backend it ships is not
surfaced in the UI ([chapter 2](/installation#no-login-required)).

## The target project's `.env`

Knoten reads a *target project's* `.env` only for two read-only purposes:

- to profile its stack (app name, database engine) for the Insights panel, and
- to connect to its **live database** when you enable that schema source
  ([chapter 14](/database-schema)).

It never writes to a target project's `.env`, and it never reads `.env.example` for
credentials (those are placeholders).

Next: [How Analysis Works →](/how-it-works)
