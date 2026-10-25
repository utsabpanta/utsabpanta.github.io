# utsabpanta.github.io

Personal site and blog. Vite, React, TypeScript, Tailwind. Posts are markdown in `src/content/blog`, discovered at build time by `src/utils/blogLoader.ts`. Deploys run from GitHub Actions on push to main.

## Commands

- `npm start` dev server
- `npm run lint`, `npx tsc --noEmit` what the commit gate runs
- `npm run build` full build including prerender, RSS, sitemap, agent files
- `node scripts/lint-posts.mjs [file]` editorial lint

## Policy

Enforcement lives in `.claude/settings.json` and `.claude/hooks`, not in this file. In short: no secrets in the tree, no hand edits to build output or the lockfile or CI config, no manual deploys, commits gated on lint and typecheck, published posts edited only with human approval, and posts linted before the agent stops. Decisions are logged to `.claude/audit.jsonl`.

Voice rules for posts are in `.claude/rules/blog-voice.md` and load when a post is touched.
