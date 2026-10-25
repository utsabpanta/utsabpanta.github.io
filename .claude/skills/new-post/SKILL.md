---
name: new-post
description: Scaffold a new blog post with valid frontmatter and this site's conventions. Use when the author asks to start, draft, or create a post.
argument-hint: <slug> "<title>"
allowed-tools: Read, Write, Bash(node scripts/lint-posts.mjs *), Bash(date *)
---

Create `src/content/blog/$ARGUMENTS[0].md` with this frontmatter and nothing else below it until the author provides direction:

```
---
title: "<title>"
excerpt: ""
date: "<today, YYYY-MM-DD>"
tags: []
published: false
---
```

Rules:

- Get today's date from `date +%Y-%m-%d`. Never guess it.
- `published` starts false. Only the author flips it.
- The slug is the filename. Lowercase, hyphens, no dates in it.
- After writing, run `node scripts/lint-posts.mjs src/content/blog/<slug>.md` and show the result.
- Then read `.claude/rules/blog-voice.md` and tell the author the three rules most likely to bite on this topic.
