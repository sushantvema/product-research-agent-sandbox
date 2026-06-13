# Workspace Agents

## Scope

Work inside the live sandbox workspace only.

Treat the workspace as the place for product research, notes, experiments, and project-specific code or content.

Do not modify the sandbox template itself unless the user explicitly asks to change sandbox infrastructure.

## Defaults

- Prefer stateless, restart-friendly workflows.
- Prefer markdown and file-based artifacts over opaque state.
- Keep project content organized for future sessions with minimal context carryover.
- Assume Quartz is available in the workspace for local note publishing and browsing.

## Boundaries

- Sandbox infrastructure lives outside the workspace template layer.
- Workspace content should not depend on hidden host-machine state.
- If a tool or environment change is needed, surface it as a sandbox request instead of patching around it locally.
