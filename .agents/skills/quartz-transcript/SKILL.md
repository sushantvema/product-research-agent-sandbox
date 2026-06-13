---
name: quartz-transcript
description: Append verbatim user input blocks to Quartz notes using a deterministic script, with one daily heading per date and timestamped entries underneath.
---

# Quartz Transcript

Use this skill when the user is providing detailed source text that should be preserved verbatim in a Quartz note instead of being summarized or rewritten.

## Goal

Capture raw user language without polishing it, summarizing it, or rephrasing it.

## Rules

- Do not edit the transcript note directly.
- Always append through the bundled script.
- Preserve the user's words verbatim inside a fenced `text` block.
- Add at most one `## YYYY-MM-DD` heading per day.
- Under that heading, add a new `### HH:MM:SS.mmm UTC` entry for each capture.

## Workflow

1. Determine the current UTC date and time.
2. Put the user's raw text on stdin or into a temporary text file if that is easier.
3. Pass the text to the append script.
4. Let the script create the date heading if needed.
5. Verify the note still renders cleanly in Quartz.

## Transcript Note

- Default file: `content/captured-input-log.md`
- Override with `QUARTZ_TRANSCRIPT_PATH` if your repo uses a different note.
- This file is append-only.

## Script

Use:

```bash
node .agents/skills/quartz-transcript/scripts/append-user-transcript.mjs < input.txt
```

Or:

```bash
node .agents/skills/quartz-transcript/scripts/append-user-transcript.mjs path/to/input.txt
```

Or:

```bash
node .agents/skills/quartz-transcript/scripts/append-user-transcript.mjs --file path/to/input.txt
```

Pipe text directly from another command, or write long/raw input to a temporary text file first and pass the file path to the script.

## Validation

If the transcript format changes, confirm:

- the day heading appears once
- each append creates one new timestamp block
- Quartz still builds successfully
