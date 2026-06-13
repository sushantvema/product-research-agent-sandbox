---
name: version-control
description: Manage local-first git workflows for exploratory work, using clean branches, meaningful commits, and semantic-versioning-style checkpoints without pushing to a remote unless the user asks.
---

# Version Control

Use this skill for git work in an exploratory workspace, especially when the user wants local versioning, branch discipline, checkpoints, or commit cleanup.

## Goal

Keep iterative work organized without flooding the history with noisy commits.

## Rules

- Keep the repository local unless the user explicitly asks to push.
- Do not create or configure a remote without permission.
- Prefer one active exploration branch for messy iteration.
- Keep `main` stable and readable.
- Fold work back into `main` through a small number of meaningful commits.
- On an active branch, prefer more frequent local commits at each coherent checkpoint instead of batching many unrelated changes together.
- If the user explicitly says it is okay to commit, do so proactively at coherent checkpoints without waiting for a separate commit request.
- Rebase or squash in the branch when the user asks to consolidate progress.

## Workflow

1. Initialize a local git repository if one does not exist.
2. Create `main` as the durable baseline.
3. Do iterative work on a feature or exploration branch.
4. Commit only coherent checkpoints.
5. When the user wants consolidation, clean history before merging back to `main`.

## Semantic Versioning Analogy

Use a lightweight release model for work state:

- `MAJOR`: a significant conceptual shift or new direction
- `MINOR`: a substantial addition to the graph, workflow, or implementation
- `PATCH`: a small refinement or fix

Do not literalize the version number unless the user wants it. Use the idea to judge commit granularity.

## Commit Guidance

- Prefer commits that correspond to a user-meaningful checkpoint.
- For notes or docs, a checkpoint is usually one concept cluster finishing cleanly: one new note, a related group of edits, or a validated documentation update.
- Avoid committing every tiny edit while exploring.
- Keep commits readable enough that a future rebase can collapse them cleanly.
- Do not commit secrets, credentials, or remote configuration.

## Merge Guidance

- If the branch has many exploratory commits, squash or rebase before merging.
- Merge back to `main` only when the branch tells a coherent story.
- Leave the branch untouched if the user wants to continue exploring.

## Validation

Before finishing git work, check:

- `git status`
- the current branch name
- whether the repo is local only
- whether the history matches the desired granularity
