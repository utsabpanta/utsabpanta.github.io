// Shared helpers for Claude Code hooks in this repo.
// Every hook reads one JSON object on stdin, decides, and appends a line to the audit log.

import { readFileSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

export const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const AUDIT = join(ROOT, '.claude', 'audit.jsonl');

export function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

export function audit(input, decision, reason, extra = {}) {
  const line = {
    ts: new Date().toISOString(),
    event: input.hook_event_name,
    tool: input.tool_name,
    session: (input.session_id || '').slice(0, 8),
    decision,
    reason,
    ...extra,
  };
  try {
    appendFileSync(AUDIT, JSON.stringify(line) + '\n');
  } catch {
    // The audit log is best effort. Never fail a hook because of it.
  }
}

// PreToolUse: hard stop. The tool call never runs, regardless of permission mode.
export function deny(input, reason) {
  audit(input, 'deny', reason);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

// PreToolUse: escalate to a human. In headless runs with no one to ask, this is a deny.
export function ask(input, reason) {
  audit(input, 'ask', reason);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

// Fall through to the normal permission rules. Exit 0 with no output is not an approval.
export function pass(input, note) {
  if (note) audit(input, 'pass', note);
  process.exit(0);
}

export function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export function rel(p) {
  if (!p) return '';
  return p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p;
}
