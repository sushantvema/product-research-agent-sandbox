#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const TRANSCRIPT_PATH = path.resolve(process.cwd(), process.env.QUARTZ_TRANSCRIPT_PATH || path.join('content', 'captured-input-log.md'));

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

function readInput() {
  const arg = process.argv[2];
  if (arg && arg !== '-') {
    if (arg === '--file' && process.argv[3]) {
      return fs.readFileSync(process.argv[3], 'utf8');
    }
    if (arg === '--file') {
      console.error('Missing file path after --file.');
      process.exit(1);
    }
    return fs.readFileSync(arg, 'utf8');
  }
  return readStdin();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function utcDateParts(date = new Date()) {
  return {
    date: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    time: `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${String(date.getUTCMilliseconds()).padStart(3, '0')} UTC`,
  };
}

function ensureFile() {
  if (fs.existsSync(TRANSCRIPT_PATH)) return;
  fs.mkdirSync(path.dirname(TRANSCRIPT_PATH), { recursive: true });
  fs.writeFileSync(
    TRANSCRIPT_PATH,
    [
      '---',
      'title: User Transcript',
      'description: Verbatim capture of raw user input.',
      'aliases:',
      '  - user transcript',
      'tags:',
      '  - transcript',
      '---',
      '',
      '# User Transcript',
      '',
    ].join('\n'),
    'utf8',
  );
}

function insertEntry(text) {
  ensureFile();
  const now = utcDateParts();
  const raw = fs.readFileSync(TRANSCRIPT_PATH, 'utf8');
  const lines = raw.split(/\r?\n/);
  const dateHeading = `## ${now.date}`;
  const entry = ['', '', `### ${now.time}`, '', '```text', text.replace(/\s+$/u, ''), '```', ''].join('\n');

  const dateIndex = lines.findIndex((line) => line.trim() === dateHeading);
  if (dateIndex === -1) {
    const appendBlock = ['', `## ${now.date}`, entry].join('\n');
    fs.writeFileSync(TRANSCRIPT_PATH, raw.replace(/\s*$/u, '') + appendBlock + '\n', 'utf8');
    return;
  }

  let insertAt = lines.length;
  for (let i = dateIndex + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }

  const next = lines.slice(0, insertAt).join('\n').replace(/\s*$/u, '');
  const tail = lines.slice(insertAt).join('\n');
  fs.writeFileSync(TRANSCRIPT_PATH, `${next}${entry}${tail ? `\n${tail.replace(/^\n+/, '')}` : '\n'}`, 'utf8');
}

const text = readInput();
if (!text.trim()) {
  console.error('No transcript text provided on stdin.');
  process.exit(1);
}

insertEntry(text);
console.log(`Appended transcript entry to ${TRANSCRIPT_PATH}`);
