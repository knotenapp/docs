---
title: Architecture Rules
description: The knoten.php rules file — node selectors, edge and confidence filters.
section: Enforcing Architecture
order: 11
slug: architecture-rules
---

# 11. Architecture Rules

Beyond *seeing* your architecture, Knoten can **enforce** it. You declare boundaries —
forbidden dependencies like "controllers must not query the database directly" — and
Knoten flags anywhere the graph actually breaks them. This chapter covers the rules
file and its syntax; [chapter 12](/rule-presets) covers ready-made rule sets, and
[chapter 13](/checking-and-ci) covers running the checks and gating CI.

## The `knoten.php` file

Rules live in a file at your **project's root** (the project being analysed, *not*
Knoten itself). Knoten looks for **`knoten.php`**, then **`.knoten.php`**. The file
returns a plain PHP array with two keys:

```php
<?php

return [
    // Named preset rule-sets to pull in (chapter 12).
    'presets' => [
        'laravel-layers',
    ],

    // Your own inline rules.
    'rules' => [
        [
            'name' => 'Controllers must not query the database directly',
            'from' => ['kind' => 'controller'],
            'to'   => ['kind' => 'table'],
        ],
    ],
];
```

Both keys are optional. Presets are expanded first, then your inline rules — so your
own rules read after the boundaries you inherited.

You do not have to write this file by hand: the **CI gate** scaffolder and the **rule
presets** UI both create and edit it for you ([chapters 12](/rule-presets) and
[13](/checking-and-ci)). But understanding the syntax lets you tailor it.

## What a rule is

A rule describes a **directed dependency that must not exist**. It has a `from`
selector and a `to` selector; the rule is violated wherever the graph contains an edge
that runs **from** a node matching `from` **to** a node matching `to`.

```php
[
    'name'       => 'Human-readable name (optional)',
    'from'       => [ /* node selector */ ],
    'to'         => [ /* node selector */ ],
    'edges'      => ['queries', 'injects'],   // optional: only these edge kinds
    'confidence' => 'inferred',               // optional: minimum confidence
],
```

- **`name`** — shown in violation reports. If omitted, Knoten generates one like
  *"controller must not depend on table"*.
- **`from`** / **`to`** — **required** node selectors (see below).
- **`edges`** — optional list of [edge kinds](/reference#edge-kinds) to restrict
  the rule to. Omit it to match *any* edge between the two selectors. An unknown edge
  kind is a hard error (so a typo cannot silently disable the rule).
- **`confidence`** — optional. Only flag edges at or above this confidence
  (`high` > `inferred` > `dynamic`). Use `high` to avoid failing on inferred links you
  are not sure about; omit it to catch everything.

## Node selectors

A selector matches nodes by any combination of four criteria. **Every criterion you
specify must match** (logical AND); an absent criterion is ignored. Within a single
criterion, a list means *any of*.

```php
'from' => [
    'kind'      => ['controller', 'action'],   // node kind(s)
    'namespace' => 'App\\Legacy\\*',           // FQCN wildcard pattern(s)
    'group'     => 'Billing',                  // group / module name(s)
    'label'     => '*Controller',              // label wildcard pattern(s)
],
```

| Criterion | Matches on | Example |
|-----------|-----------|---------|
| `kind` | The node's [kind](/reference#node-kinds) | `'controller'`, `['model', 'service']` |
| `namespace` | The fully-qualified class name, with `*` wildcards | `'App\\Legacy\\*'` |
| `group` | The node's group/module | `'Billing'`, `'Vendor'` |
| `label` | The node's label, with `*` wildcards | `'*Controller'`, `'Legacy*'` |

- Each criterion may be a single string or a list of strings (any-of).
- `*` in a `namespace` or `label` pattern stands for any run of characters; matching is
  case-sensitive. A pattern with no `*` must match exactly.
- `kind` values are validated — an unknown kind is a hard error.

## Worked examples

**Keep the domain pure — models must not depend on the layers above them:**

```php
['name' => 'Models must not depend on controllers',
 'from' => ['kind' => 'model'], 'to' => ['kind' => 'controller']],

['name' => 'Models must not depend on services',
 'from' => ['kind' => 'model'], 'to' => ['kind' => 'service']],
```

**Keep raw database access out of controllers:**

```php
['name' => 'Controllers must not query the database directly',
 'from' => ['kind' => 'controller'], 'to' => ['kind' => 'table']],
```

**Quarantine a legacy namespace — nothing new may depend on it:**

```php
['name'      => 'Nothing may depend on legacy code',
 'from'      => ['namespace' => 'App\\*'],
 'to'        => ['namespace' => 'App\\Legacy\\*'],
 'edges'     => ['injects', 'references'],
 'confidence'=> 'high']
```

**Enforce module isolation (multi-package scan) — Billing must not reach into Catalog:**

```php
['name' => 'Billing must not depend on Catalog internals',
 'from' => ['group' => 'Billing'], 'to' => ['group' => 'Catalog']]
```

## How rules are evaluated

Knoten walks every edge in the graph. For each edge whose kind and confidence pass the
rule's `edges`/`confidence` filters, it checks whether the **source** matches `from`
and the **target** matches `to`. Every match is a **violation**, reported with the
exact source and target nodes, the edge, and the source file:line where it originates.

Because rules run against the same graph you see on screen, a violation is something
you can *look at*: select the offending node, run an impact trace, open the method flow
to the exact line.

## Tips

- **Start from a preset** ([chapter 12](/rule-presets)) and add your own rules —
  you rarely need to write everything from scratch.
- Use **`confidence => 'high'`** on rules where inferred links would cause false
  alarms; leave it off when you want to be strict.
- Use **`edges`** to make a rule precise — e.g. forbid a `queries` edge from
  controllers to tables but allow a harmless `references`.
- Keep rule names action-oriented; they become the headings in the check report.

Next: [Rule Presets →](/rule-presets)
