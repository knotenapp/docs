---
title: Command Line
description: The knoten:scan, knoten:check, and knoten:preset Artisan commands.
section: Going Deeper
order: 15
slug: cli-commands
---

# 15. Command Line

Everything Knoten does in the UI has a command-line counterpart, so you can script it,
run it in CI, or work without a browser. There are three Artisan commands. Run them from
Knoten's own directory (`php artisan …`).

---

## `knoten:scan`

Scan one or more Laravel projects/packages and build their architecture graph.

```bash
php artisan knoten:scan <path> [<path> ...] [--output=graph.json]
```

| Argument / option | Meaning |
|-------------------|---------|
| `path` (one or more) | Absolute path(s) to the project(s)/package(s) to analyse. Multiple paths are combined into one graph, just like opening multiple roots in the UI ([chapter 3](/opening-projects#opening-multiple-roots-at-once)). |
| `--output=FILE` | Write the full graph JSON to `FILE`. |

Without `--output` it prints a summary table — model count, relationship-edge count,
unresolved references, and parse warnings — a quick health read of a project.

```bash
# Summarise a project.
php artisan knoten:scan /home/me/sites/shop

# Analyse an app plus an in-house package together, dump the graph.
php artisan knoten:scan /home/me/sites/shop /home/me/packages/billing --output=shop.json
```

The `--output` JSON is the exact same contract as the in-app **Export as JSON**
([chapter 10](/exporting)) and the graph the UI renders.

---

## `knoten:check`

The architecture gate: scan a project, evaluate its declared
[rules](/architecture-rules), and **exit non-zero on any violation** so CI can
block a merge. This is the command your CI workflow runs
([chapter 13](/checking-and-ci)).

```bash
php artisan knoten:check <path> [<path> ...] [--config=knoten.php] [--json]
```

| Argument / option | Meaning |
|-------------------|---------|
| `path` (one or more) | Project(s) to check. The first path's `knoten.php` / `.knoten.php` is used unless `--config` is given. |
| `--config=FILE` | Use a specific rules file instead of auto-discovery. |
| `--json` | Emit violations as JSON instead of the human-readable table. |

Behaviour:

- **No rules file, or an empty rules file** → warns and exits **0** (an empty gate
  blocks no one).
- **Violations found** → prints them grouped by rule (each with the offending
  `source → target` and the file:line), then exits **non-zero**.
- **Clean** → "Architecture OK — no violations found", exits **0**.

```bash
# Check a project against its own knoten.php.
php artisan knoten:check /home/me/sites/shop

# Use an explicit rules file and emit JSON (for another tool to consume).
php artisan knoten:check /home/me/sites/shop --config=/home/me/sites/shop/.knoten.php --json
```

---

## `knoten:preset`

List the bundled [rule presets](/rule-presets), or add/remove one in a project's
`knoten.php`. This is the CLI twin of the in-app **Rule presets** dialog.

```bash
php artisan knoten:preset <action> [<name>] [--path=DIR]
```

| Argument / option | Meaning |
|-------------------|---------|
| `action` | `list` (default), `add`, or `remove`. |
| `name` | The preset name (required for `add` / `remove`). |
| `--path=DIR` | The project root whose `knoten.php` to edit. Defaults to the current working directory. |

```bash
# See every available preset with its rule count and description.
php artisan knoten:preset list

# Enable a preset (creates knoten.php if the project has none).
php artisan knoten:preset add laravel-layers --path=/home/me/sites/shop

# Disable a preset.
php artisan knoten:preset remove laravel-layers --path=/home/me/sites/shop
```

`add` validates the name up front (an unknown preset is rejected before any write),
and edits the file as a precise string transform that leaves your formatting and
comments intact ([chapter 12](/rule-presets#how-editing-your-file-is-kept-safe)).

---

## Putting it in CI yourself

If you are not using the scaffolded GitHub Actions workflow, the essence of a CI gate
is just one line — run the check and let its exit code fail the job:

```bash
php artisan knoten:check "$GITHUB_WORKSPACE"
```

Any non-zero exit fails the build. See [chapter 13](/checking-and-ci) for the
full CI story.

Next: [Desktop App →](/desktop-app)
