---
title: Database Schema
description: Migration replay vs. reading the live database, and schema drift.
section: Going Deeper
order: 14
slug: database-schema
---

# 14. Database Schema

The **tables** in Knoten's graph are real database tables, and the model → table and
controller/service → table links are what make the "code-to-database map" possible.
This chapter explains where that schema comes from, and how to compare it against your
live database.

## Two sources of schema

Knoten can reconstruct your schema two ways:

1. **Migration replay** (the default) — offline, credential-free.
2. **Live database** (opt-in) — read directly from your real database.

You switch between them with the **Schema source** toggle in the filter rail
([chapter 5](/filtering-and-navigating)).

## Migration replay (default)

By default Knoten reconstructs each table by **replaying your migrations in filename
order** — exactly as Laravel would apply them — building up an in-memory picture of the
final schema. It is cumulative: a `create` followed by later `table()` alterations,
`renameColumn`s, `dropColumn`s, and `drop`s all replay in order, so the result is the
table's *final* state.

This means:

- **No database connection or credentials are needed** — it reads the migration PHP
  files, not a live database. This is why Knoten is safe to run offline and against any
  project.
- It understands the common Blueprint patterns: `id()`, `timestamps()`,
  `softDeletes()`, `rememberToken()`, `morphs()`, foreign keys
  (`foreign()->references()->on()`, `foreignId()->constrained()`,
  `foreignIdFor(User::class)`), column renames and drops, table renames and drops, and
  more.
- It reads migrations wherever they live — the root `database/migrations` **and** any
  nested ones (each module ships its own; packages keep publishable `.stub`
  migrations). Templated stubs with `{{ table }}` placeholders have their table name
  recovered from the filename.
- Unparseable migrations are skipped rather than aborting the whole scan.

Each table node shows its columns (name, type, nullable) and the migrations that
defined it, in the details panel.

## Multi-tenant connections

Tables are keyed by **connection *and* name**, so a `users` table on a landlord
connection and one on a tenant connection stay two distinct nodes instead of
collapsing into one. Knoten picks up a non-default connection from a migration's
`protected $connection = 'tenant'` property or a `Schema::connection('tenant')->create(...)`
call, and from a model's `$connection`; the model then maps to the table on *its*
connection, and foreign keys resolve within it. Default-connection tables are
unchanged (`table:users`); a pinned connection is shown as a badge on the table node.
(A connection built dynamically — `Schema::connection(config('...'))` — can't be
resolved to a name, so those tables stay on the default.)

## Reading from the live database (opt-in)

Toggle **Live database** on to introspect your project's **real database** instead.
Knoten reads the connection details from the project's **`.env`** (never
`.env.example`, whose values are placeholders), connects through a throwaway read-only
connection, and lists the real tables, columns, and foreign keys.

Key facts:

- **Supported engines:** SQLite, MySQL/MariaDB, and PostgreSQL. Other drivers are not
  introspected.
- **Local only, for safety:** the automatic `.env` connection is made *only* to a
  **SQLite file** or a **loopback host** (`127.0.0.1` / `localhost` / `::1`). A project
  whose `.env` points at a **remote** host falls back to migrations — Knoten never
  silently connects across the network from a `.env` it just read. To check a remote
  database on purpose, use **Check remote drift** (see below).
- **Read-only and isolated:** the connection is registered under a throwaway name and
  purged afterwards, so it never leaks into Knoten's own configuration. Network engines
  use a short connection timeout.
- **Framework tables** the project's migrations do not create (like `migrations`
  itself, and SQLite internals) are excluded so they do not appear as orphan tables.
- **Graceful fallback:** if the database is unreachable, the driver is unsupported, or
  the database is empty (usually a fresh, unmigrated database), Knoten **falls back to
  the migration replay** — a scan never breaks because of a database problem. The
  toggle's status line tells you which happened: "Connected — reading from the
  database" vs. "Could not connect — using migrations".
- The two sources are **cached separately**, so flipping the toggle back and forth is
  instant after the first build of each.

## Schema drift

When you read the live database *and* it differs from what your migrations describe,
Knoten computes and surfaces the **drift** — the high-signal difference between the two:

- **Tables only in the database** — present live, but no migration creates them
  (hand-applied changes, or tables owned by another app sharing the database).
- **Tables only in migrations** — migrated, but missing from the database (un-run
  migrations).
- **Column differences per table** — columns present in one but not the other.

Drift appears in the **Insights** panel (a "Schema drift" section), on individual table
nodes, and in the **Check remote drift** modal (below). It is a fast way to catch a
migration nobody ran, a manual `ALTER TABLE` that never became a migration, or a
shared-database surprise.

### Reading the drift report

The report groups the differences so the real signal stands out from the noise:

- A **summary** line — how many tables are only-in-migrations, only-in-DB, and have
  column differences — so you grasp the shape before scrolling.
- **Missing from the database** (migrated but absent — usually the real, actionable
  drift) is shown first and open; **Only in the database** (manual changes and packages)
  is collapsed. Each group is collapsible and counted.
- **Package & framework tables** (`activity_log`, `jobs`, `sessions`, `telescope_*`, …)
  are grouped and muted: their migrations live in `vendor/`, which the replay doesn't
  scan, so they *always* look DB-only — expected, not real drift.
- A **"widespread columns"** callout: when the same column shows up only-in-DB across
  many tables (say `facility_id` on 40 tables), it's almost certainly added by a shared
  macro or helper the migration reader can't expand — flagged once as a likely false
  positive instead of 40 separate rows.

Controls on the report:

- **Filter** the list by table or column name.
- **Sort** by name, or by most-differing-columns first.
- **Copy** the whole report as Markdown, to drop into a PR or issue.
- **Click a table** (in the Insights panel) to select and frame its node on the canvas.

> Drift compares table and column *presence* — the high-signal, low-noise part.
> Column *type* differences are intentionally left out for now, because database type
> names rarely match Blueprint method names exactly and would produce noise.

### Check remote drift

Because the automatic live-database read is local-only, remote databases are checked
through a deliberate, one-off action. The **Drift** tile in the filter rail opens the
**Check remote drift** modal, where you enter the connection by hand — driver
(MySQL/MariaDB or PostgreSQL), host, port, database, username, password. Knoten
connects **once**, reads the remote schema, diffs
it against the project's migrations, and shows the same drift report in the modal
(tables/columns only-in-database vs only-in-migrations), or an "in sync" confirmation.

The connection is transient — used for that single read and immediately purged — and
the **credentials are never stored**. This is the safe way to answer "does what's
deployed in staging/production still match our migrations?" without Knoten ever
connecting to a remote host on its own. Knoten waits up to **10 seconds** for a remote
connection before giving up.

> **Can't connect? Remote MySQL is usually blocked.** Managed and shared hosts firewall
> port 3306 from the internet by default, so a direct connection often fails with a
> `[2002] Operation timed out` error. The reliable, safe way in is an **SSH tunnel** —
> forward the remote database port to your machine and point Knoten at the local end:
>
> ```bash
> ssh -L 3307:127.0.0.1:3306 you@your-server
> ```
>
> Then connect with **Host `127.0.0.1`, Port `3307`** — the tunnel forwards to the remote
> database, which never has to be exposed publicly. (The alternative — enabling "Remote
> MySQL" and whitelisting your IP in the host's control panel — opens 3306 to the
> internet and is less safe.) A quick `nc -vz your-server 3306` tells you whether the
> port is reachable at all.

| Situation | Source |
|-----------|--------|
| Exploring a project you cannot or should not connect to | **Migrations** (default) |
| Sharing a snapshot / running in CI | **Migrations** — deterministic, no credentials |
| Auditing a local database | **Live database** |
| Hunting un-run migrations or manual schema edits (local) | **Live database** (read the drift) |
| Checking a remote/staging/production database against migrations | **Check remote drift** |

For most work the default migration replay is what you want. Reach for the live
database when the question is specifically "what does the real database look like, and
does it match the code?"

Next: [Command Line →](/cli-commands)
