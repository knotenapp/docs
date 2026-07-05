---
title: Method Flow
description: Drilling into a class to read each method as plain-language, branch-aware steps.
section: Using the App
order: 8
slug: method-flow
---

# 8. Method Flow

Traces (chapter 7) show how classes connect *to each other*. **Method flow** goes one
level deeper: it opens a single class on the canvas and shows **what each of its
methods actually does**, step by step, in plain language.

## Opening a class's methods

Select a class node that has methods, then click **Explore methods** in the details
panel. The canvas switches to a focused view of that one class, with its **methods as
nodes** you can drill into. Pick a method to expand its internal flow.

This is computed on demand — method flows are heavy to work out and irrelevant until
you actually open a class, so Knoten parses them per request rather than baking them
into the whole-project graph. That keeps the main scan fast.

## Which methods are shown

Every regular method is explorable, at **any visibility** — public, protected, *and*
private. A boundary violation or a key piece of logic can easily live in a private
helper, so hiding it would defeat the purpose. The constructor (`__construct`) and
single-action `__invoke` are included too (dependency injection and invokable
controllers matter). Other magic methods (`__get`, `__toString`, …) are framework
plumbing and are skipped.

## Reading a flow

Each method's body is turned into an **ordered, branch-aware list of plain-language
steps** — "what the code does", not the code itself. Recognised Laravel patterns read
as sentences:

- `$this->authorize('update', $post)` → **"Check permission to update a Post"**
- `Post::query()->where(...)->get()` → **"Look up Post records"**
- `Invoice::create([...])` → **"Create an Invoice"**
- `SendInvoice::dispatch(...)` → **"Dispatch the SendInvoice job"**
- `event(new PostPublished(...))` → **"Fire the PostPublished event"**
- `$request->validate([...])` → **"Validate the incoming data"**
- `return redirect(...)` → **"Redirect to another page"**
- `return $this->hasMany(Comment::class)` → **"Has many Comment"**
- `throw new PaymentFailedException()` → **"Stop with an error: PaymentFailedException"**

Control flow is preserved and indented, so the shape of the logic is visible:

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

Anything the narrator does not recognise falls back to a **condensed code snippet**
(prefixed "Run: …") so a step is never lost — you always see *something* for every
line. Very long methods are capped (with an "…and more" marker) so a runaway method
does not produce a thousand steps.

## Why this is useful

- **Onboarding:** understand what a controller action or service method does without
  reading the code, in language a non-author (or a non-developer) can follow.
- **Reviewing a violation:** when an architecture check flags a class, method flow
  takes you to the exact method — and the exact step — where the forbidden dependency
  happens (see [chapter 13](13-checking-and-ci.md)). The floating check overlay can
  jump you straight into the offending method's flow.
- **Auditing authorization:** see at a glance whether a method actually calls
  `authorize()` and against what.

## Jumping to the real code

Every step carries the source line it came from, so from method flow you are always
one **Open** away from the real code at the exact line in your editor (see
[chapter 6](06-details-panel.md#reveal--open)).

Next: [Contexts & Notes →](09-contexts-and-notes.md)
