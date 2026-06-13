---
name: quartz-notes
description: Work safely with Quartz markdown notes, link graphs, and published slugs without creating redirect loops or note collisions.
---

# Quartz Notes

Use this skill when editing, creating, or reviewing Quartz notes in a repo that publishes content with Quartz.

## Goal

Keep the note graph readable, stable, and free of common Quartz publishing bugs:

- self-redirect pages
- slug collisions between titles, aliases, and file names
- accidental alias loops
- broken or misleading backlinks

## Depth

Prefer notes that are useful on their own, not thin placeholders.

- Expand core notes beyond a brief summary when the user is actively iterating on the concept.
- Favor concrete examples, candidate principles, open questions, and operational implications.
- Keep the writing concise, but do not under-explain the concept.

## Workflow

1. Read the existing note structure first.
2. Prefer short, unique canonical titles.
3. Avoid aliases that duplicate a note's own slug or another note's canonical slug.
4. Update links deliberately instead of mass-linking every note back to every other note.
5. Validate with the bundled scripts before finishing.

## When Creating Notes

- Use one canonical note per concept.
- Pick a title whose slug will stay stable.
- Add aliases only for legitimate legacy names or user-facing synonyms.
- If a note is likely to be linked from a sidebar or hub page, make sure the target page is the real content page, not a redirect stub.
- When the user asks for an idea index, create a hub note that links to concept notes instead of burying the idea in an overview page.

## Common Failure Modes

- A note title or alias produces a slug that overlaps an existing page.
- A note ends up with a redirect page that points back to itself.
- A legacy alias shadows the canonical path of a different note.
- Dense mutual backlinks make the graph feel circular even when the content is fine.
- A page repeats its own title as the first section heading, which makes the root page and TOC noisy.

## Validation

Run these checks from the project root:

```bash
node .agents/skills/quartz-notes/scripts/check-quartz-note-collisions.mjs
npx quartz build
node .agents/skills/quartz-notes/scripts/check-quartz-redirects.mjs
```

If either validator fails, fix the note titles, aliases, or links before shipping the change.

## Local Dev Server

When you need to inspect the live Quartz site while editing notes, start the local server from the `quartz` directory and keep it running in the background:

```bash
cd quartz
npx quartz build --serve
```

This builds the site and serves it with hot refresh for note edits. In background-task workflows, leave it running so the site stays available while the agent continues working.

## Bundled Scripts

- `check-quartz-note-collisions.mjs` reads `content/` by default.
- `check-quartz-redirects.mjs` reads `quartz/public/` by default.
- Override paths with `QUARTZ_CONTENT_ROOT` or `QUARTZ_PUBLIC_ROOT` if your repo uses a different layout.
