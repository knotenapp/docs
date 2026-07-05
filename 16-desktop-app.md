---
title: Desktop App
description: Native features, native menus, and building installers.
section: Going Deeper
order: 16
slug: desktop-app
---

# 16. Desktop App

Knoten ships as a **native desktop application** for macOS, Windows, and Linux. It is
the same web app and the same analysis engine, wrapped in an Electron shell that
bundles a PHP runtime — so there is nothing to install or configure. You open the app
and start analysing projects.

## Why use the desktop app

- **Zero setup** — no PHP, Node, Composer, or web server to install; it is all inside.
- **Native file access** — a real folder picker, native "Save As", and "Reveal in
  file manager" / "Open in editor" that work directly with your OS.
- **Native menus** — Open Project, Open Recent, Re-scan, and Welcome live in the
  standard application menu bar.
- **Feels like an app** — its own window, icon, and dock/taskbar entry.

Everything in this manual applies to the desktop app; the differences are only in
*how you reach* a few actions.

## What is different from the web app

The desktop shell exposes native capabilities that the browser cannot, and Knoten uses
them automatically when running inside it:

| Action | Web app | Desktop app |
|--------|---------|-------------|
| Open a project | In-app dialog with a path field | **Native folder picker** (and File → Open menu) |
| Open Recent | Quick-pick list in the app | Native **File → Open Recent** menu, kept in sync |
| Re-scan | ↻ button in the filter rail | **File → Re-scan** menu (in-app button hidden) |
| Reveal a file | Handled by the local server | Native OS reveal |
| Open in editor | Navigates to the editor's URL scheme | Native shell hands off to the editor |
| Export PNG | Browser download | **Native "Save As"** then writes the file directly |

These are chosen at runtime — the app detects it is inside the desktop shell and shows
the native affordances instead of the in-app ones, so you never see duplicated
controls.

## Reveal & open in editor

The desktop shell can reveal any file in your OS file manager and open it in your
chosen editor at the exact line (see the **Reveal** / **Open** buttons in the details
panel, [chapter 6](/details-panel)). Editor choice comes from your Editor
preference in Settings ([chapter 17](/configuration#editor-preference)).

## Where the desktop app stores its state

Because the app folder is read-only, the desktop build relocates Knoten's writable
state — its storage directory and the small SQLite database — to a per-user location,
via the `KNOTEN_STORAGE_PATH` mechanism ([chapter 17](/configuration)). Your
recent-projects list, graph cache, and the contexts/notes local storage all live
there. This is transparent in normal use.

## Building the desktop app (for maintainers)

The desktop project lives under `desktop/`. It contains the Electron main process
(`main.js`), the preload bridge (`preload.js`), a splash screen, build scripts, and a
bundled copy of the compiled Laravel app under `desktop/app-bundle/`. A PHP runtime
(FrankenPHP) is bundled so no system PHP is required.

Common scripts (run from `desktop/`):

```bash
npm run prepare:app     # refresh the bundled app copy
npm run icon            # generate app icons

npm run dist:linux      # build Linux installers (.deb, AppImage)
npm run dist:win        # build a Windows installer (NSIS)
npm run dist:mac        # build a macOS app
```

Installers are produced with `electron-builder` and can be published to GitHub
releases. End users just download and run the installer for their platform — none of
the above is needed to *use* Knoten.

Next: [Configuration →](/configuration)
