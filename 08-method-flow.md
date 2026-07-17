---
title: Method Flow
description: Drilling into a class to read each method as plain-language, branch-aware steps — with a side-effects summary and navigable calls.
section: Using the App
order: 8
slug: method-flow
---

# 8. Method Flow

Traces (chapter 7) show how classes connect *to each other*. **Method flow** goes one
level deeper: it opens a single class on the canvas and shows **what each of its
methods actually does**, step by step, in plain language — and lets you follow a call
from one method straight into the next.

## Opening a class's methods

Select a class node that has methods, then click **Explore methods** in the details
panel. The canvas switches to a focused view of that one class, with its **methods as
nodes** you can drill into. Pick a method to expand its internal flow.

This is computed on demand — method flows are heavy to work out and irrelevant until
you actually open a class, so Knoten parses them per request rather than baking them
into the whole-project graph. That keeps the main scan fast.

## The effects summary

Before you expand anything, each method node carries a row of small **effect chips** —
an at-a-glance answer to *"what does this method do to the world?"* Each chip has a
count (or the model name) and a tooltip:

- 🛡 **guards** — authorization and validation (`authorize`, `validate`, `abort`)
- ✏️ **writes** — records created or changed (`create`, `updateOrCreate`, `save`,
  `update`, `delete`, …), named by model where it's known
- 🗄 **reads** — database queries (`get`, `first`, `find`, `paginate`, …), named by model
- ⚡ **dispatches** — queued jobs (`Job::dispatch`, `Bus::chain`/`batch`)
- 📣 **events** — events fired (`event(...)`)
- ✉️ **sends** — notifications and mail (`$user->notify(...)`, `Notification::send`,
  `Mail::to(...)`)

So a controller action might read **🛡 1 · ✏️ Post · ⚡ 1** — one guard, writes a Post,
dispatches one job — without you opening a single step. The tally covers the whole
method body, including steps nested inside branches, loops, and transactions.

## Which methods are shown

Every regular method is explorable, at **any visibility** — public, protected, *and*
private. A boundary violation or a key piece of logic can easily live in a private
helper, so hiding it would defeat the purpose. The constructor (`__construct`) and
single-action `__invoke` are included too (dependency injection and invokable
controllers matter). Other magic methods (`__get`, `__toString`, …) are framework
plumbing and are skipped.

## Reading a flow

Each method's body is turned into an **ordered, branch-aware list of plain-language
steps** — "what the code does", not the code itself. Prose is set in normal type and
only the code tokens (`$variables`, `Class::methods`, `"strings"`) are highlighted in
monospace, so a step reads as a sentence, not a wall of code. Recognised Laravel
patterns read as sentences:

- `$this->authorize('update', Post::class)` → **"Check permission to update a Post"**
- `Post::query()->where(...)->get()` → **"Look up Post records"**
- `Invoice::create([...])` → **"Create an Invoice"**
- `SendInvoice::dispatch(...)` → **"Dispatch the SendInvoice job"**
- `event(new PostPublished(...))` → **"Fire the PostPublished event"**
- `$request->validate([...])` → **"Validate the incoming data"**
- `return view('posts.show', [...])` → **"Render the posts.show view"**
- `return Post::all()` → **"Return the Post records"**
- `return $this->hasMany(Comment::class)` → **"Has many Comment"**
- `throw new PaymentFailedException()` → **"Stop with an error: PaymentFailedException"**

Conditions and plain values read as language too, rather than raw code:

- `if (! is_null($range))` → **"If $range is set:"**
- `if ($status === 'active')` → **"If $status is "active":"**
- `$start = $range[0]` → **"$start = $range[0]"** (a plain assignment, stated as one)
- `$post = Post::create(...)` → **"Create a Post (as $post)"** (an action assignment)

Control flow is preserved and **indented under a nesting rail**, so the shape of the
logic is visible — an `if` body and its `Otherwise` body read as contained blocks:

- `if / elseif / else` → **"If …:" / "Otherwise if …:" / "Otherwise:"**
- `foreach` → **"For $item in …:"**
- `while` → **"Repeat while …:"**
- `try / catch` → **"Try:" / "If that fails (SomeException):"**
- `switch` → **"Depending on …:" / "When …:"**

Closures passed to common wrappers are **unfolded as nested blocks** rather than shown
as one opaque step, so you can read inside them:

- `DB::transaction(fn () => …)` → **"In a database transaction:"** + the steps within
- `Cache::remember(…, fn () => …)` → **"Cache the result of:"**
- `$collection->each(fn () => …)` / `->map(…)` → **"For each item:"**
- `tap(…)`, `when(…)`, `unless(…)`, `rescue(…)`, `retry(…)` all get readable headings.

Anything the narrator can't put into words falls back to a **condensed code snippet**
(prefixed "Run: …") so a step is never lost — you always see *something* for every
line. This is a last resort for an un-interpretable statement; conditions and values
never fall back to it. Very long methods are capped (with an "…and more" marker) so a
runaway method does not produce a thousand steps.

## Navigating from a step

A step that names something is no longer a dead end — it's a way in. Where a step's
call resolves to a place Knoten knows, the step gains two affordances on the right:

- **Go to (the locate icon)** — when the call targets a class that already exists in
  the graph (a model, a job, an action, …), jump straight to that node on the canvas.
  *"Look up Post records"* takes you to the **Post** model; *"Dispatch the SendInvoice
  job"* takes you to **SendInvoice**.
- **Expand (the chevron)** — when the call targets a method, unfold **that method's own
  flow inline** underneath, indented one level deeper. Keep expanding and the flat list
  becomes a real **call tree**: you read a request the way it actually executes, from
  the controller down through the services, actions, and jobs it calls.

Same-class calls (`$this->helper()`) expand instantly — the class's methods are already
loaded. A call into another class fetches that class's flow once and caches it, so
re-expanding is free. Expansion is bounded by a depth cap and a cycle guard, so a deep
or mutually-recursive call chain always stays finite. A call whose receiver type can't
be known statically (a plain variable), or one into framework/vendor code, simply gets
no affordance — Knoten never guesses.

## Why this is useful

- **Onboarding:** understand what a controller action or service method does without
  reading the code, in language a non-author (or a non-developer) can follow.
- **Tracing execution:** expand your way down the call tree to follow a request from a
  route handler all the way to the database — the "read one method" view becomes a
  "trace the whole path" view.
- **Reviewing a violation:** when an architecture check flags a class, method flow
  takes you to the exact method — and the exact step — where the forbidden dependency
  happens (see [chapter 13](/checking-and-ci)). The floating check overlay can
  jump you straight into the offending method's flow.
- **Auditing authorization:** the guard chip (and the guard steps) show at a glance
  whether a method actually calls `authorize()`/`validate()` and against what.

## Jumping to the real code

Every step carries the source line it came from, so from method flow you are always
one **Open** away from the real code at the exact line in your editor (see
[chapter 6](/details-panel#reveal--open)). A step you expanded into another class
opens *that* class's file, at its own line.

Next: [Contexts & Notes →](/contexts-and-notes)
