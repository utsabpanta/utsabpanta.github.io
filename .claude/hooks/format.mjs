// PostToolUse hook for Edit and Write.
// Formats TypeScript the moment it lands, so formatting never shows up in review.

import { readInput, audit, sh, rel } from './lib.mjs';

const input = readInput();
const file = rel(input.tool_input?.file_path);

if (/\.(ts|tsx)$/.test(file)) {
  try {
    sh(`npx prettier --log-level warn --write "${file}"`);
    audit(input, 'formatted', file);
  } catch (e) {
    audit(input, 'format-failed', (e.stderr || '').trim().split('\n').pop());
  }
}
