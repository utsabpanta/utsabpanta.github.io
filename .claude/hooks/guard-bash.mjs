// PreToolUse hook for Bash.
// Permission rules match command prefixes. They cannot see that `sed -i` writes a file
// or that `cat .env` reads a secret. This hook covers the gap, then gates commits
// on the same checks CI runs.

import { readInput, deny, pass, sh } from './lib.mjs';

const input = readInput();
const cmd = input.tool_input?.command || '';

// The policy itself. An agent that can rewrite these files can remove every rule below,
// so any shell command that names them is refused unless it is plainly read-only.
const POLICY = /\.claude\/(settings\.json|hooks)/;
const READ_ONLY = /^\s*(cat|head|tail|less|ls|wc|grep|diff|git\s+(diff|status|log|show|add|commit))\b/;
if (POLICY.test(cmd) && !READ_ONLY.test(cmd)) {
  deny(input, 'That command touches the policy files (.claude/settings.json or .claude/hooks). Agents do not edit their own guardrails. A person changes these in an editor.');
}

// Paths nothing in a session should write by hand. Build output, lockfile, CI config.
const PROTECTED = /(^|[\s/"'])(dist|dist-ssr)\/|package-lock\.json|\.github\/workflows/;
const WRITES = /(>{1,2}|\bsed\s+-i|\btee\b|\bcp\b|\bmv\b|\brm\b|\btruncate\b|\bchmod\b)/;
if (PROTECTED.test(cmd) && WRITES.test(cmd)) {
  deny(input, 'That command writes to a protected path (dist, lockfile, or CI config). Change the source and run the build instead.');
}

// Secrets: no reading or sourcing env files through the shell either.
if (/(\bcat\b|\bless\b|\bhead\b|\btail\b|\bsource\b|^\.\s|\bgrep\b|\bprintenv\b).*\.env\b/.test(cmd)) {
  deny(input, 'Reading .env files is off limits in agent sessions. Ask for the variable name you need.');
}

// Deploys happen from CI on main. Never from a laptop, never from an agent.
if (/\bnpm\s+run\s+deploy\b|\bgh-pages\b/.test(cmd)) {
  deny(input, 'Deploys run from the GitHub Actions workflow on push to main. There is no manual deploy path.');
}

// Commit gate: run what CI runs before the commit exists.
if (/\bgit\s+(-C\s+\S+\s+)?commit\b/.test(cmd)) {
  const failures = [];
  for (const check of ['npm run -s lint', 'npx tsc --noEmit']) {
    try {
      sh(check);
    } catch (e) {
      const out = ((e.stdout || '') + (e.stderr || '')).trim().split('\n').slice(-12).join('\n');
      failures.push(`$ ${check}\n${out}`);
    }
  }
  if (failures.length) {
    deny(input, `Commit blocked. Fix these first:\n\n${failures.join('\n\n')}`);
  }
  pass(input, 'commit gate passed');
}

pass(input);
