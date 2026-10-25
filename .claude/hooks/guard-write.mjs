// PreToolUse hook for Edit and Write.
// 1. Refuses to write anything that looks like a credential.
// 2. Requires a human to approve edits to posts that are already in git.
//    New posts go through. Published ones do not get silently rewritten.

import { readInput, deny, ask, pass, sh, rel } from './lib.mjs';

const SECRET_PATTERNS = [
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/sk-ant-[A-Za-z0-9_-]{20,}/, 'Anthropic API key'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
];

const input = readInput();
const file = rel(input.tool_input?.file_path);
const text = [input.tool_input?.content, input.tool_input?.new_string].filter(Boolean).join('\n');

for (const [re, label] of SECRET_PATTERNS) {
  if (re.test(text)) {
    deny(input, `Refusing to write a ${label} into ${file}. Secrets belong in the environment, not the repo.`);
  }
}

if (file.startsWith('src/content/blog/') && file.endsWith('.md')) {
  let tracked = false;
  try {
    sh(`git ls-files --error-unmatch -- "${file}"`);
    tracked = true;
  } catch {
    tracked = false;
  }
  if (tracked) {
    ask(input, `${file} is a published post. Editing it needs a human to approve this specific change.`);
  }
}

pass(input);
