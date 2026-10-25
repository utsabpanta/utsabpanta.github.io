---
paths:
  - "src/content/blog/**"
---

# Writing rules for posts

These load whenever a post is read or edited. The enforceable parts are also checked by `scripts/lint-posts.mjs`, which the Stop hook runs on any post changed in the session.

- No em dashes. Use " - " for an aside.
- Banned words: landscape, leverage, delve, robust, crucial, tapestry, realm, foster, harness, paradigm, synergy, holistic, game-changer, unlock, empower, seamless, transformative.
- Frontmatter: `title`, `excerpt`, `date` as YYYY-MM-DD in quotes, `tags` as a JSON array, `published`.
- First person, practical before theoretical, short sentences mixed with medium ones.
- Nothing invented. No anecdotes the author did not live. If a story is needed and none exists, write without one.
- Statistics and product claims carry a source link in a References section at the end.
- Posts already committed to git are not edited by agents without a human approving the specific change. The write guard enforces this.
