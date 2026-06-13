#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const PUBLIC_ROOT = path.resolve(process.cwd(), process.env.QUARTZ_PUBLIC_ROOT || path.join('quartz', 'public'));

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function extractRedirectTarget(html) {
  const match = html.match(/<meta[^>]+http-equiv="refresh"[^>]+content="0;\s*url=([^">]+)"/i);
  return match ? match[1] : null;
}

function normalizeTarget(target) {
  return String(target)
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/\?.*$/, '')
    .replace(/#.*$/, '');
}

if (!fs.existsSync(PUBLIC_ROOT)) {
  console.error(`Quartz public root not found: ${PUBLIC_ROOT}`);
  process.exit(1);
}

const files = walk(PUBLIC_ROOT);
const problems = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const target = extractRedirectTarget(html);
  if (!target) continue;

  const normalizedTarget = normalizeTarget(target);
  const slug = path.basename(file, '.html');
  if (normalizedTarget === slug) {
    problems.push(`self-redirect in ${path.relative(PUBLIC_ROOT, file)} -> ${target}`);
  }
}

if (problems.length) {
  console.error('Quartz redirect check failed:');
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Quartz redirect check passed for ${files.length} rendered HTML files.`);
