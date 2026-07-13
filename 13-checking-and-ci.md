---
title: Checking & CI
description: Running checks in-app, scaffolding a CI gate, and failing a build on violations.
section: Enforcing Architecture
order: 13
slug: checking-and-ci
---

# 13. Checking & CI

Once you have [architecture rules](/architecture-rules) (your own or from
[presets](/rule-presets)), you can **check** the project against them — in the
app while you explore, or in CI to block a merge that breaks a boundary.

## Checking in the app

Click **Check architecture** in the filter rail. Knoten runs your project's `knoten.php` rules
against the current graph and reports the result:

- **No rules file yet?** Instead of an error, Knoten steers you to set up a CI gate or
  enable a preset — there is simply nothing to enforce yet.
- **Rules pass** → a clean result: "Architecture OK — no violations found."
- **Rules fail** → the violations, each showing the offending source class, the
  forbidden target, and the kind of dependency.

The check evaluates the **same cached graph you are looking at** (respecting your
current excludes and schema source), so what it reports matches what is on screen.

### The violations overlay

When a check finds violations, a **floating "red board"** appears over the canvas
listing every class that breaks a rule. It is draggable (grab its header) and
collapsible, and it *stays* over the canvas as you work — so after you drill into one
offending class you can still see the others and jump between them. Click an offender
and Knoten:

1. opens that class's **method flow** ([chapter 8](/method-flow)), and
2. expands the exact **method** where the forbidden dependency originates.

That takes you from "a rule is broken" to "here is the precise line" in one click.

## Setting up a CI gate

To enforce rules automatically, you need two files in your project: the `knoten.php`
rules file and a CI workflow that runs the check. Knoten can scaffold both.

### From the app

Click **CI gate** in the filter rail. Knoten writes the starter files into the
analysed project from bundled templates:

- **`knoten.php`** — a starter rules file (if you do not have one).
- **`.github/workflows/knoten-check.yml`** — a GitHub Actions workflow that runs the
  architecture check on every push/PR.

**Existing files are never overwritten** unless you explicitly force it, so a click can
never clobber your own configuration — files that already exist are reported as
"skipped".

### From the command line

The check itself is a single command:

```bash
php artisan knoten:check /absolute/path/to/project
```

- It scans the project, evaluates the rules, and prints a report grouped by rule.
- It **exits non-zero on any violation**, so CI fails the build automatically.
- **No rules file / no rules?** It warns and exits *successfully* — an empty gate does
  not block anyone.
- **`--config=path`** points at a specific rules file.
- **`--json`** emits the violations as JSON for other tooling (still non-zero on
  violations).
- You can pass **multiple paths** to check several roots together.

See [chapter 15](/cli-commands) for the full command reference.

### The generated workflow

The bundled GitHub Actions workflow (`knoten-check.yml`) runs `knoten:check` against
your project on each push and pull request. Because the command exits non-zero on a
violation, a PR that introduces a forbidden dependency turns the check red and can be
required to pass before merge — turning your architecture rules into an enforced
contract rather than a wiki page nobody reads.

## A typical workflow

1. **Adopt a preset** and/or write a few rules ([chapters 11](/architecture-rules)–[12](/rule-presets)).
2. **Check in-app** to see where you stand today; use the overlay to jump to each
   violation and decide: fix the code, or relax the rule.
3. Get to green.
4. **Scaffold the CI gate** and commit `knoten.php` + the workflow.
5. From now on, any change that breaks a boundary fails CI — with a report naming the
   rule, the class, and the file:line.

## Reading a violation

Every violation tells you:

- **which rule** was broken (its name),
- the **source → target** it found (e.g. `PostController → posts (queries)`),
- the **edge kind** and its **confidence**,
- the **file:line** the dependency originates from, and
- the **call sites** (method + line) — so tooling and the in-app overlay can jump you
  to the exact place.

If a violation is on an *inferred* edge you disagree with, tighten the rule with a
`confidence => 'high'` filter or a narrower `edges` list
([chapter 11](/architecture-rules)).

Next: [Database Schema →](/database-schema)
