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

Drift appears in the **Insights** panel (a "Schema drift" section) and on individual
table nodes. It is a fast way to catch a migration nobody ran, a manual `ALTER TABLE`
that never became a migration, or a shared-database surprise.

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
connecting to a remote host on its own.

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
