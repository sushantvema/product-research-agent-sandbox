# Platform Skill Intake

## Scope

Curate skills from the live workspace into repo-worthy platform assets without leaking sensitive exploratory, strategic, or non-public operating context.

## Use When

- Reviewing skills discovered under `.agents/skills`, `.cursor/skills`, `.claude/skills`, `.codex/skills`, or `.opencode/skills`
- Deciding whether a workspace skill is safe to promote into this repo
- Running the host-side skill curation workflow before future GitHub publication

## Workflow

1. Run `./bin/sandbox skills index` to inspect metadata only.
2. Run `./bin/sandbox skills audit` to apply the repo's conservative personal-research and PII leakage checks.
3. Run `./bin/sandbox skills export --all` or export specific selectors for host-side review.
4. Review exported content under `exports/skills/<timestamp>/` before any promotion.
5. Promote only skills that are clearly platform-level and free of sensitive exploratory details.

## Promotion Rules

Promotable skills are limited to:

- sandbox or container workflow
- agent workflow and orchestration
- generic skill authoring patterns
- tool ergonomics
- environment setup or maintenance

Do not promote skills that contain:

- company-building ideas, commercial strategy, or future planning details
- real customer identifiers, competitive analysis, or private operating notes
- workspace-specific plans, experiments, or private measurement results tied to ongoing exploration
- references that would reveal non-public systems or restricted context

## Review Checklist

- Confirm the skill stays useful outside the current workspace.
- Remove workspace-specific examples unless they are fully generic.
- Remove or rewrite any references to current exploratory work.
- Keep the promoted version narrowly scoped and reusable.
- If unsure, leave the skill in `exports/skills/...` and do not promote it.

## Commands

```bash
./bin/sandbox skills index
./bin/sandbox skills audit
./bin/sandbox skills export --all
./bin/sandbox skills export agents:skill-name claude:other-skill
```
