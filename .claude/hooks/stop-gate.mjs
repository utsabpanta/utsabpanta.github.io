// Stop hook.
// Before the agent declares itself done, any post it touched this session has to pass
// the editorial linter. If not, the turn continues with the linter output as feedback.

import { readInput, audit, sh } from './lib.mjs';

const input = readInput();

// Already continuing because of this hook. Do not loop.
if (input.stop_hook_active) process.exit(0);

let changed = [];
try {
  changed = sh('git status --porcelain -- src/content/blog')
    .split('\n')
    .filter(Boolean)
    .map((l) => l.slice(3).trim())
    .filter((f) => f.endsWith('.md'));
} catch {
  process.exit(0);
}

if (!changed.length) process.exit(0);

try {
  sh(`node scripts/lint-posts.mjs ${changed.map((f) => `"${f}"`).join(' ')}`);
  audit(input, 'pass', `lint-posts clean: ${changed.join(', ')}`);
} catch (e) {
  const out = (e.stdout || '').trim();
  audit(input, 'block', out);
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: `Posts changed this session fail the editorial lint. Fix every line below, then stop again.\n\n${out}`,
    })
  );
}
