---
title: Reference
description: Every node kind and edge kind, the exported JSON shape, and a glossary.
section: Reference
order: 19
slug: reference
---

# 19. Reference

The complete catalogues Knoten works with — every node kind, every edge kind — plus the
exported JSON shape and a glossary. Use this to interpret the graph, write precise
[rules](/architecture-rules), or work with exported data.

## <a id="node-kinds"></a>Node kinds

Knoten recognises **34 node kinds**. The `kind` value (left column) is what you use in a
rule selector's `kind` field.

| `kind` | Label | What it is |
|--------|-------|-----------|
| `model` | Model | An Eloquent model — a PHP class mapped to a database table. |
| `table` | Database table | A table reconstructed by replaying your migrations (or read live). |
| `controller` | Controller | Handles HTTP requests routed to it; reaches the database through models. |
| `service` | Service | An application-layer class, usually injected into controllers. |
| `route` | Route | A URL endpoint mapped to a controller action. |
| `package` | Package | A third-party Composer package your code depends on. |
| `config` | Config key | A config or env key read from code (`config('x')`, `env('X')`); reverse-trace it for a setting's blast radius. |
| `request` | Form request | Validates incoming data before a controller runs. |
| `resource` | API resource | Shapes a model into the JSON a controller returns. |
| `job` | Job | A queued background job, dispatched from controllers or services. |
| `page` | Frontend page | An Inertia page a controller renders. |
| `policy` | Policy | An authorization policy that guards a model. |
| `middleware` | Middleware | Guards routes before they reach a controller. |
| `action` | Action | A single-purpose action class, invoked by controllers or jobs. |
| `component` | Livewire component | Handles requests and renders a Blade view (includes Volt single-file components). |
| `view` | Blade view | A Blade view rendered by a controller or Livewire component, composing other views and components. |
| `provider` | Service provider | Registers a module or package: its routes, views, and bindings. |
| `command` | Console command | An Artisan console command. |
| `event` | Event | Broadcast when something happens, handled by its listeners. |
| `listener` | Listener | Handles an event, often reaching the database through models. |
| `observer` | Observer | Reacts to a model's lifecycle events (created, updated, deleted…). |
| `channel` | Broadcast channel | Its callback authorizes realtime access, usually against a model. |
| `notification` | Notification | Sent to users over mail, database, broadcast, etc. |
| `mailable` | Mailable | An email message, usually rendered from a Blade/Markdown view. |
| `exception` | Exception | A custom exception thrown by the application. |
| `rule` | Validation rule | A custom validation rule applied to request data. |
| `cast` | Eloquent cast | Converts a model attribute to and from the database. |
| `scope` | Query scope | Constrains a model's queries. |
| `blade-component` | Blade component | A class-based Blade component that renders a view. |
| `factory` | Model factory | Builds fake model instances for tests and seeders. |
| `seeder` | Database seeder | Populates tables, often via model factories. |
| `class` | Class | A class with no more specific role — a manager, facade, helper. |
| `interface` | Interface | A contract implemented elsewhere. |
| `trait` | Trait | Mixed into classes to share behaviour. |
| `enum` | Enum | A fixed set of named values. |

## <a id="edge-kinds"></a>Edge kinds

Edges run **source → target**. The `kind` value is what you use in a rule's `edges`
list. In the filter rail's **Links** section these are grouped under friendly labels
(shown in the last column).

### Flow & structure edges

| `kind` | Meaning (source → target) | Links label |
|--------|---------------------------|-------------|
| `routes-to` | A route points to the controller action / component that handles it | Routes |
| `injects` | A class receives another via typed constructor injection | Injects |
| `resolves` | Code pulls a class out of the container (`app(X::class)`, `make`, `resolve`) | Container resolves |
| `binds` | A provider binds an abstract to its concrete implementation | Bindings |
| `queries` | Code reads/writes a table (via a referenced model) | Queries |
| `reads` | Code reads a config/env key | Config reads |
| `maps-to` | A model maps to its backing table | Model ↔ table |
| `depends-on` | A first-party class depends on a Composer package | Package deps |
| `uses-middleware` | A route passes through middleware | Middleware |
| `validates-with` | A controller validates with a form request | Validation |
| `transforms` | Code shapes its response with an API resource | Resources |
| `renders` | A controller/component renders a page or Blade view | Renders |
| `includes` | A Blade view includes another view (`@include`/`@extends`) | View includes |
| `embeds` | A Blade view embeds a Livewire/Blade component (`<livewire:…>`, `<x-…>`) | Embedded components |
| `dispatches` | Code dispatches a job | Dispatches |
| `chains` | A job runs after another in a dispatched chain (`Bus::chain`) | Job chains |
| `runs` | Code runs an action | Runs |
| `sends` | Code sends a notification or mailable | Sends |
| `throws` | Code/request throws an exception | Throws |
| `dispatches-event` | Code fires an event | Dispatches events |
| `handles-event` | An event is handled by a listener | Event listeners |
| `authorizes` | A policy guards a model | Authorizes |
| `checks-policy` | Code / a route checks a policy (for a model) | Policy checks |
| `observes` | An observer watches a model | Observes |
| `broadcasts-on` | A channel authorizes against a model | Broadcasts on |
| `broadcasts` | An event broadcasts on a channel | Broadcasts |
| `foreign-key` | A table references another via a foreign key | Foreign keys |
| `extends` | A class extends another | Extends |
| `implements` | A class implements an interface | Implements |
| `uses-trait` | A class uses a trait | Uses traits |
| `references` | A loose method-body reference between classes | References |
| `instantiates` | Direct instantiation | Instantiates |

### Eloquent relationship edges

The eleven relationship kinds collapse into one **Relationships** toggle in the filter
rail, but each is a distinct edge kind you can target in a rule. Their values match the
Eloquent method names:

`hasOne`, `hasMany`, `belongsTo`, `belongsToMany`, `morphTo`, `morphOne`, `morphMany`,
`morphToMany`, `morphedByMany`, `hasOneThrough`, `hasManyThrough`.

## Confidence values

Used on nodes, edges, and as a rule filter (`confidence`), ranked
`high` > `inferred` > `dynamic`:

| Value | Meaning | Visual |
|-------|---------|--------|
| `high` | Proven from static facts | Solid edge |
| `inferred` | Resolved by convention / best effort | Dashed edge, amber dot |
| `dynamic` | Unresolved; surfaced for transparency | Listed as an unresolved reference |

See [chapter 1](/introduction#confidence) and [chapter 18](/how-it-works).

## Exported JSON shape

The graph exported via **Export as JSON** ([chapter 10](/exporting)) or
`knoten:scan --output` ([chapter 15](/cli-commands)) has this shape:

```jsonc
{
  "projectPath": "/abs/path",
  "scannedAt": "2026-01-01T12:00:00+00:00",
  "laravelVersion": "13.7.0",
  "profile": {
    "name": "vendor/app", "appName": "My App", "description": "...",
    "phpVersion": "^8.3", "laravelVersion": "13.7.0", "database": "SQLite",
    "technologies": ["Inertia", "React", "Tailwind CSS", "Pest"]
  },
  "nodes": [
    {
      "id": "controller:App\\Http\\Controllers\\PostController",
      "kind": "controller",
      "label": "PostController",
      "fqcn": "App\\Http\\Controllers\\PostController",
      "file": "/abs/path/app/Http/Controllers/PostController.php",
      "line": 12,
      "meta": {
        "loc": 84, "methods": ["index", "store"],
        "group": "App", "groupKind": "app",
        "confidence": "high"
      }
    }
    // …
  ],
  "edges": [
    {
      "id": "controller:…|queries|table:posts",
      "source": "controller:…", "target": "table:posts",
      "kind": "queries", "confidence": "inferred",
      "detail": "Post",
      "sites": [ { "method": "index", "line": 20, "public": true } ]
    }
    // …
  ],
  "stats": { "models": 6, "tables": 8, "controllers": 4, "edges": 120, "...": 0 },
  "unresolved": [ { "from": "model:…", "ref": "App\\Models\\X", "reason": "...", "kind": "belongsTo" } ],
  "warnings": ["/abs/path/app/Broken.php: syntax error, …"],
  "schemaSource": "migrations",
  "schemaDrift": null
}
```

Notes:

- Node `meta` varies by kind — a model carries `table`, `connection`, `fillable`,
  `casts`, `scopes`, `relationshipCount`, `traits`; a table carries `columns`,
  `columnCount`, `migrations`, `connection`; a route carries `httpMethods`, `uri`,
  `action`, `api`, `apiVersion`; a resource carries `fields` (its `toArray()` shape);
  a config key carries `source` (`config`/`env`); a package carries `isLaravelPackage`.
  Common meta includes `loc`, `methods`, `group`/`groupKind`, `testedBy`
  (plus `routeTestedBy` on route-covered controllers/components), `scheduled`,
  and (always) `confidence`.
- Edge `sites` gives the exact `method` + `line` (+ visibility) where the relationship
  originates — this is what powers "jump to the offending line" in checks and method flow.
- `schemaDrift` is populated only when reading a live database that disagrees with the
  migrations (see [chapter 14](/database-schema)).

The contract is identical across the UI, the JSON export, and the CLI, so anything you
build against it works everywhere.

## Glossary

- **Node** — one thing in the app (class, table, route, package…).
- **Edge** — a directed relationship between two nodes.
- **Kind** — the type of a node or edge.
- **Confidence** — how sure the analysis is (`high` / `inferred` / `dynamic`).
- **Group** — the cluster a node belongs to (module / app / package / vendor).
- **Trace** — a walk over the graph answering a question (request, impact, etc.).
- **Method flow** — a class's method rendered as plain-language steps, with a
  side-effects summary and calls you can follow into a nested call tree.
- **Context** — a user-drawn boundary around nodes (annotation layer).
- **Note** — a user's sticky note pinned to the canvas (annotation layer).
- **Hotspot** — one of the most-connected nodes.
- **Blast radius / impact** — everything that transitively depends on a node.
- **Drift** — differences between the live database and the migration-replayed schema.
- **Preset** — a named, reusable set of architecture rules bundled with Knoten.
- **Violation** — a place where the graph breaks an architecture rule.
- **Unresolved reference** — a relationship Knoten found but could not tie to a node.

---

That completes the manual. Start over at the [index](/), or jump back to any
chapter.
