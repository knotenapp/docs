---
title: Installation & Setup
description: Running the web app, the desktop app, and the requirements for each.
section: Getting Started
order: 2
slug: installation
---

# 2. Installation & Setup

Knoten runs in two ways. Most users want the **desktop app** (a native window, no
setup). Developers working on Knoten itself, or self-hosting it, run the **web app**.

## Which one do I want?

| You want to… | Use |
|--------------|-----|
| Just open Laravel projects and explore them | The **desktop app** (chapter 16) |
| Develop or customise Knoten | The **web app** (below) |
| Host Knoten for a team | The **web app** behind your own server |

The two share the exact same analysis engine and UI. The desktop app simply bundles
the web app together with a PHP runtime and a native shell.

---

## The web app (local development)

### Requirements

- **PHP 8.3+** (the project targets 8.4)
- **Node.js 18+**
- **Composer**
- **npm** (or a compatible package manager)

Knoten stores its own tiny bit of state (recent projects, a graph cache) on disk and
ships configured for **SQLite**, so there is no database server to set up.

### One-command setup

From the project root:

```bash
composer run setup
```

This runs the whole first-time setup for you:

1. `composer install` — PHP dependencies
2. copies `.env.example` → `.env` (if you do not already have one)
3. `php artisan key:generate` — application key
4. `php artisan migrate --force` — creates Knoten's own SQLite database
5. `npm install` — frontend dependencies
6. `npm run build` — builds the frontend assets

### Running it

Start everything with one command:

```bash
composer run dev
```

This launches four processes together (via `concurrently`):

- the **PHP dev server** (defaults to `http://localhost:8000`),
- the **queue listener**,
- **Pail** log streaming, and
- the **Vite** dev server for the frontend.

Open the served URL in your browser and Knoten opens straight into its workspace —
there is no login screen. (The root URL `/` redirects to `/knoten`.)

> **Frontend not updating?** If a change to the UI does not appear, the assets may
> need rebuilding. Run `npm run dev` (hot reload) or `npm run build` (one-off), or
> the combined `composer run dev`.

### Building for production

```bash
npm run build           # client assets
npm run build:ssr       # client assets + server-side rendering bundle
```

Knoten uses Inertia's built-in SSR, which works automatically in Vite dev mode — no
separate Node SSR server is needed while developing.

---

## No login required

Knoten is a **local, single-user, open-and-go tool**. Its main surface — the whole
`/knoten` workspace and all its API endpoints — is deliberately *not* behind
authentication, because the person running it already has full access to the machine
and the projects on it.

The project does still ship a complete authentication backend (Laravel Fortify:
login, registration, password reset, two-factor). These routes remain registered but
are **not surfaced in the UI**. They exist because Knoten is built on the Laravel
React starter kit, and they are kept so the app can be adapted into a hosted,
multi-user service later without rebuilding auth from scratch. For day-to-day use you
can ignore them entirely.

The only settings that *are* surfaced are **Appearance** (light/dark/system theme)
and **Editor** (your preferred IDE for the "Open" action) — both stored locally in
the browser, requiring no account. See [chapter 6](06-details-panel.md) and
[chapter 17](17-configuration.md).

---

## Verifying it works

Open the app. If you have no project configured yet, you will see the
[Welcome screen](03-opening-projects.md). Knoten also ships a small sample Laravel
project it can analyse out of the box (`tests/Fixtures/sample-project`), which it
falls back to if nothing else is available — a good way to see a populated graph
immediately.

Next: [Opening a Project →](03-opening-projects.md)
