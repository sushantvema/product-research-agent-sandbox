#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const CONTENT_ROOT = path.resolve(process.cwd(), process.env.QUARTZ_CONTENT_ROOT || 'content');

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return {};
  const block = text.slice(4, end).split('\n');
  const result = {};
  let current = null;
  for (const line of block) {
    if (!line.trim()) continue;
    if (/^\s*-\s+/.test(line) && current) {
      const item = line.replace(/^\s*-\s+/, '').trim().replace(/^['"]|['"]$/g, '');
      if (!Array.isArray(result[current])) result[current] = [];
      result[current].push(item);
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    current = match[1];
    let value = match[2].trim();
    if (value === '') {
      result[current] = [];
      continue;
    }
    value = value.replace(/^['"]|['"]$/g, '');
    result[current] = value;
  }
  return result;
}

if (!fs.existsSync(CONTENT_ROOT)) {
  console.error(`Quartz content root not found: ${CONTENT_ROOT}`);
  process.exit(1);
}

const files = walk(CONTENT_ROOT);
const noteData = files.map((file) => {
  const rel = path.relative(CONTENT_ROOT, file);
  const basename = rel.replace(/\.md$/, '');
  const text = fs.readFileSync(file, 'utf8');
  const fm = parseFrontmatter(text);
  const title = typeof fm.title === 'string' ? fm.title : basename;
  const aliases = Array.isArray(fm.aliases) ? fm.aliases : [];
  return {
    file,
    rel,
    basenameSlug: slugify(basename),
    title,
    titleSlug: slugify(title),
    aliases,
    aliasSlugs: aliases.map(slugify),
  };
});

const byTitleSlug = new Map();
const byBaseSlug = new Map();
const problems = [];

for (const note of noteData) {
  if (!byTitleSlug.has(note.titleSlug)) byTitleSlug.set(note.titleSlug, []);
  byTitleSlug.get(note.titleSlug).push(note.rel);

  if (!byBaseSlug.has(note.basenameSlug)) byBaseSlug.set(note.basenameSlug, []);
  byBaseSlug.get(note.basenameSlug).push(note.rel);
}

for (const [slug, filesWithSlug] of byTitleSlug.entries()) {
  if (slug && filesWithSlug.length > 1) {
    problems.push(`duplicate title slug '${slug}': ${filesWithSlug.join(', ')}`);
  }
}

for (const note of noteData) {
  for (const aliasSlug of note.aliasSlugs) {
    if (!aliasSlug) continue;
    if (aliasSlug === note.basenameSlug) {
      problems.push(`alias collides with file slug in ${note.rel}: '${aliasSlug}'`);
    }
    const titleMatches = byTitleSlug.get(aliasSlug) || [];
    for (const other of titleMatches) {
      if (other !== note.rel) {
        problems.push(`alias in ${note.rel} shadows title slug '${aliasSlug}' used by ${other}`);
      }
    }
    const baseMatches = byBaseSlug.get(aliasSlug) || [];
    for (const other of baseMatches) {
      if (other !== note.rel) {
        problems.push(`alias in ${note.rel} shadows file slug '${aliasSlug}' used by ${other}`);
      }
    }
  }
}

if (problems.length) {
  console.error('Quartz note collision check failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Quartz note collision check passed for ${noteData.length} notes.`);
