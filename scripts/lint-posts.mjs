#!/usr/bin/env node
// Lints blog posts against this site's editorial rules.
// Usage: node scripts/lint-posts.mjs [file ...]   (defaults to every post)
// Exit 0 when clean, 1 with one line per problem on stdout.

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const POSTS_DIR = 'src/content/blog';
const REQUIRED = ['title', 'excerpt', 'date', 'tags', 'published'];
const BANNED_WORDS = [
  'landscape', 'leverage', 'delve', 'robust', 'crucial', 'tapestry', 'realm',
  'foster', 'harness', 'paradigm', 'synergy', 'holistic', 'game-changer',
  'unlock', 'empower', 'seamless', 'transformative',
];

const files = process.argv.length > 2
  ? process.argv.slice(2)
  : readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => join(POSTS_DIR, f));

const problems = [];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const name = basename(file);
  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fm) {
    problems.push(`${name}: missing frontmatter block`);
    continue;
  }
  const [, head, body] = fm;
  const fields = Object.fromEntries(
    head.split('\n').map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]),
  );

  for (const key of REQUIRED) if (!(key in fields)) problems.push(`${name}: frontmatter missing "${key}"`);
  if (fields.date && !/^"?\d{4}-\d{2}-\d{2}"?$/.test(fields.date)) problems.push(`${name}: date must be YYYY-MM-DD`);
  if (fields.tags && !/^\[.*\]$/.test(fields.tags)) problems.push(`${name}: tags must be a JSON array`);

  body.split('\n').forEach((line, i) => {
    const n = i + 1;
    if (line.includes('—')) problems.push(`${name}:${n}: em dash; use " - " instead`);
    for (const w of BANNED_WORDS) {
      if (new RegExp(`\\b${w}\\b`, 'i').test(line)) problems.push(`${name}:${n}: banned word "${w}"`);
    }
  });

  const words = body.trim().split(/\s+/).length;
  if (words < 300 && fields.published !== 'false') problems.push(`${name}: only ${words} words; publish needs 300+`);
}

if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log(`lint-posts: ${files.length} post(s) clean`);
