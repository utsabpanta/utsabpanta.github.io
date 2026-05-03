---
title: "Making Your Website Agent-Ready"
excerpt: "More of your visitors are agents now, not humans. Here's what it actually takes to make a personal site or blog readable by them, with real code from my own setup."
date: "2026-05-02"
tags: ["web-development", "ai", "seo", "agentic-engineering", "developer-tools"]
published: true
---

A while back I curled my own site to see what an AI crawler would actually get back. The answer was disappointing: a JavaScript shell. The post body, the title, the publication date, none of it was in the HTML. All of it loaded client-side after the bundle ran. The site looked great in a browser. To anything that didn't execute JavaScript, my blog was a blank page.

That's the gap this post is about. More of your visitors are agents now - ChatGPT fetching a page mid-conversation, Claude pulling a URL a user dropped into chat, Perplexity grabbing context for an answer, somebody's home-grown research agent crawling your archive. The mix shifted faster than most personal sites kept up with, and the changes you'd make for a human visitor and the changes you'd make for an agent visitor only partially overlap.

For a personal site or blog, this matters more than people realize. When somebody asks an assistant "what does Utsab think about agentic engineering?" the answer it gives back is shaped by what my site looks like to it, not what it looks like in a browser. If my pages are a blob of JavaScript that takes 200 milliseconds to render, the agent gets nothing. Content buried under wrapper divs and lazy-loaded images turns into noise. Without a machine-friendly index of my posts, the agent is left guessing.

After seeing that, I went through my own site and made the changes I'd been putting off. SSR, plain markdown endpoints, an `llms.txt`, structured data, and a few smaller things. This post walks through what I did, why each piece matters, and the actual code, so you can do the same thing on your own site without trial and error.

I'll point out which parts are settled standards and which are still in flux, because some of this is genuinely new and the conventions are still moving.

## What "Agent-Ready" Actually Means

Before getting into the code, it helps to be clear about what we're optimizing for, because it's not the same as SEO.

Search engines historically wanted to know what your page is about so they can rank it for queries. The output is a link. The user clicks through. Your page renders in a browser.

Agents want something different. They want the actual content, in a form they can drop straight into a context window, and they want it fast. They don't care about your hero animation. They don't want to render JavaScript. They aren't going to scroll. They're going to fetch a URL, parse it, and either summarize it or use it as grounding for an answer they're about to give to somebody.

Same URL, two completely different experiences:

```
Browser:                          Agent:
GET /blog/some-post               GET /blog/some-post
    ↓                                 ↓
Loads HTML shell + JS bundle      Reads HTML response
    ↓                                 ↓
Executes JS, fetches data         Done. Either the content
    ↓                             was there or it wasn't.
Renders chrome, animations
    ↓
Renders post body
    ↓
Human scrolls and reads
```

So "agent-ready" comes down to a small number of things:

1. The actual content is in the HTML when an agent fetches the page (no JS execution required)
2. There's a clean, low-noise version of every long piece of content available at a predictable URL
3. There's a single index that tells an agent what's on the site and where to find it
4. The site is explicit, in machine-readable form, about whether agents are welcome and for what

That's the whole job. Each of the sections below maps to one of these.

## Step 1: Make Sure The HTML Actually Has Your Content

This is the foundational one and the easiest to get wrong if your site is a single-page app.

I built my site with React and Vite, which by default ships an empty `<div id="root"></div>` and a JavaScript bundle that fills it in on the client. Browsers handle this fine. Most agents don't. They fetch the URL, see an empty page, and move on.

The fix is to render your pages to static HTML at build time. Vite supports this out of the box with an SSR build. Here's roughly what my build script looks like:

```json
{
  "scripts": {
    "build": "tsc && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/generate-rss.js && node scripts/generate-sitemap.js && node scripts/prerender.js && node scripts/generate-agent-files.js"
  }
}
```

The flow is:

```
vite build              → client bundle in dist/
vite build --ssr        → server bundle in dist-ssr/
prerender.js            → runs server bundle for each route, writes static HTML
generate-agent-files.js → writes markdown endpoints + llms.txt
```

The prerender step iterates through every route on the site, calls the SSR entry to produce HTML, and writes it to disk. For my blog, that means each `/blog/{slug}` URL gets a real HTML file with the post body baked in. An agent fetching that URL gets the actual content immediately. No JavaScript needed.

If you're on Next.js, Remix, Astro, or SvelteKit, you mostly get this for free. If you're on a hand-rolled SPA, this is the change that matters most.

A quick way to check whether you're already in good shape: run `curl https://yoursite.com/some-page | grep -i "your content"`. If the content is in the response, you're set. If you only see the bundle script tag, the agent only sees that too.

## Step 2: Serve Plain Markdown At A Predictable URL

This is the part most personal sites are missing, and it's the single biggest improvement you can make for agent consumption.

The idea is simple. For every blog post on your site, also publish the raw markdown at a parallel URL. So `https://utsabpant.com/blog/my-post` is the human version. `https://utsabpant.com/blog/my-post.md` is the same content, no chrome, no nav, no analytics, just the text.

Why bother? Because when an agent grabs your post to summarize it, the markdown version is dramatically cleaner than the rendered HTML. No header, no footer, no related posts, no theme toggle, no syntax highlighting markup. Just the words. The agent's summary is going to be more accurate, and it costs the user fewer tokens to ground on your content.

Here's the script I added to my build, simplified down to the part that matters:

```javascript
import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const DIST_DIR = path.join(__dirname, '../dist');

function loadPosts() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data, body } = parseFrontmatter(raw);
      if (data.published === false) return null;
      return { slug: file.replace('.md', ''), data, raw, body };
    })
    .filter(Boolean);
}

function writeMarkdownEndpoints(posts) {
  const blogDir = path.join(DIST_DIR, 'blog');
  fs.mkdirSync(blogDir, { recursive: true });
  for (const post of posts) {
    fs.writeFileSync(path.join(blogDir, `${post.slug}.md`), post.raw);
  }
}

writeMarkdownEndpoints(loadPosts());
```

That's the whole thing. Read each markdown file from the blog directory, write it to the dist folder under the same slug with a `.md` extension. GitHub Pages, Netlify, Vercel, Cloudflare Pages will all serve that file as plain text at the URL you'd expect.

Two design decisions worth flagging:

**I serve the full raw file including frontmatter.** Some people strip the frontmatter and serve only the body. I keep it because the title, date, and tags are useful structured signals for an agent reading the file in isolation.

**The URL is `/blog/{slug}.md`, not `/blog/{slug}/raw` or anything fancier.** Predictability matters. An agent that finds one post can guess where the others live just from the pattern.

## Step 3: Publish An `llms.txt`

This is the newest piece and the one most likely to change as conventions settle. The basic idea, popularized over the last year and now widely adopted, is to put a file at `/llms.txt` that tells an agent what your site is and where to find the important content.

Think of it as `robots.txt` for content discovery, or a sitemap that's actually readable by a model.

Here's what mine generates:

```javascript
function writeLlmsTxt(posts) {
  const lines = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    'This site is a personal blog covering software engineering, architecture, engineering leadership, and AI-assisted development. Each post is available as markdown at `/blog/{slug}.md`.',
    '',
    '## Blog Posts',
    '',
    ...posts.map(
      (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}.md): ${p.excerpt}`
    ),
    '',
    '## Site Pages',
    '',
    `- [Home](${SITE_URL}/): Personal site and about page`,
    `- [Blog](${SITE_URL}/blog): All blog posts`,
    `- [RSS Feed](${SITE_URL}/rss.xml): Subscribe to new posts`,
    '',
  ];
  fs.writeFileSync(path.join(DIST_DIR, 'llms.txt'), lines.join('\n'));
}
```

The output looks like this:

```markdown
# Utsab Pant

> Engineering Manager writing about software architecture,
> engineering leadership, and AI-assisted development.

This site is a personal blog covering software engineering...
Each post is available as markdown at `/blog/{slug}.md`.

## Blog Posts

- [Agentic Engineering: A Practical Guide](https://utsabpant.com/blog/agentic-engineering-practical-guide.md): Agentic engineering is how software gets built now...
- [Technical Debt: A Shared Responsibility](https://utsabpant.com/blog/technical-debt-as-leadership.md): Technical debt isn't just a coding problem...
- ...
```

Three things make this useful:

1. **It points to the markdown endpoints, not the HTML pages.** The whole point is to send an agent to the cleanest version.
2. **Each link has a one-line description.** This is the post excerpt. It lets an agent decide whether a post is relevant without fetching it first.
3. **It's regenerated on every build.** The script reads the blog directory and writes the file fresh, so it never goes stale.

A quick honesty check on `llms.txt`: it's a proposed convention, not a settled standard, and adoption is uneven. Some agents look for it. Some don't. But it's a tiny file, it costs nothing to generate, and the tooling is converging on it. I'd rather have it and not need it than the other way around.

## Step 4: Be Explicit In `robots.txt`

`robots.txt` has been around forever, but in the last year it picked up a new role. It's now the place to tell agents whether your content can be used for search, for grounding answers, and for training.

The convention that's gaining traction is `Content-Signal`, which lets you separate those three uses:

```
User-agent: *
Allow: /

Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: https://utsabpant.com/sitemap.xml
```

Three signals, all independent:

- **search** - can your content show up in search results
- **ai-input** - can agents fetch your page to answer a user's question right now
- **ai-train** - can your content be used to train models

For my personal blog I said yes to all three. The whole point of writing publicly is to be read, including by AI systems. If you have a different stance - say, you want to be searchable but not used for training - you'd write `search=yes, ai-input=yes, ai-train=no`.

This is also where you'd block specific bots if you want to. The major AI crawlers all respect `User-agent` blocks today (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc.). If you want fine-grained control, you can add per-bot rules. For most personal sites, the broad `Content-Signal` line is enough.

## Step 5: Add Structured Data

Structured data isn't new. Search engines have used JSON-LD for years to understand entities and relationships. What changed is that agents now use the same data to figure out who wrote a thing and what kind of thing it is.

If you have a personal site, the bare minimum is a `Person` schema in the site's main HTML head. Mine looks like this:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Utsab Pant",
  "url": "https://utsabpant.com",
  "jobTitle": "Engineering Manager",
  "description": "Engineering Manager with 12+ years of experience...",
  "knowsAbout": [
    "AWS", "Serverless", "React", "TypeScript",
    "Software Architecture", "Engineering Leadership"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/utsab-pant-00415b71",
    "https://github.com/utsabpanta"
  ]
}
</script>
```

This tells any system reading the page who you are, what you know about, and where else you exist online. Agents pick this up to disambiguate ("which Utsab Pant?"), to attribute content correctly, and to decide whether you're a credible source on a given topic.

For each blog post, add a `BlogPosting` schema as well. The prerender step on my site emits one for every post, generated from the post's frontmatter:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Technical Debt: A Shared Responsibility",
  "description": "Technical debt isn't just a coding problem...",
  "datePublished": "2026-01-31",
  "author": {
    "@type": "Person",
    "name": "Utsab Pant",
    "url": "https://utsabpant.com"
  },
  "publisher": {
    "@type": "Person",
    "name": "Utsab Pant",
    "url": "https://utsabpant.com"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://utsabpant.com/blog/technical-debt-as-leadership"
  },
  "keywords": "leadership, engineering-management, architecture, technical-debt",
  "wordCount": 1996
}
</script>
```

This is generated server-side during the SSR build, so it's part of the HTML the agent fetches. The cost is a few lines in your prerender script. The benefit is that an agent reading the page knows the title, the publication date, the author, the topic tags, and the word count without having to parse anything.

## Step 6: Don't Skip RSS And Sitemaps

It's tempting to assume that RSS and `sitemap.xml` are obsolete now that we have `llms.txt` and AI crawlers. They aren't. They serve overlapping but distinct purposes.

**`sitemap.xml`** is what traditional search crawlers and many AI bots use to discover all the URLs on your site. Even a site with great `llms.txt` should still have a sitemap, because the sitemap covers things `llms.txt` doesn't, like images, and it's the format crawlers already know how to parse.

**`rss.xml`** matters because RSS is enjoying a quiet second life as the way people subscribe to humans they want to follow, including through AI-powered readers and news agents. If somebody asks their assistant to "tell me when Utsab posts something new," the assistant is going to look for an RSS feed.

Both are trivial to generate. Mine are written by small build scripts that read the same blog directory as everything else. If you don't have them, add them. They're a few hours of work and they pay off forever.

## What I Deliberately Skipped

A few things I considered and chose not to do, because they didn't make sense for a personal blog. Worth mentioning so you can decide whether they make sense for yours.

**An MCP server for the site.** You could expose your blog through an MCP server so agents could query it directly. For a company knowledge base or documentation site, this is a real win. For a personal blog with a dozen posts, it's overkill. The markdown endpoints plus `llms.txt` cover the same ground with less infrastructure.

**Agent-only walled content.** Some sites are starting to publish detailed expert versions of pages just for agents, while keeping the human page lighter. I'd avoid this for personal content. It splits your voice across two surfaces and you end up maintaining two slightly different versions of the same thing. Write one good piece and serve it to everyone.

**Bot rate limiting and access controls.** If you're getting hammered by a specific crawler, this is worth doing. For a low-traffic personal site, the major bots are well-behaved and the long tail is noise. I'd rather not maintain access rules I don't need.

## Verify It Actually Worked

The whole point of this is invisible from a browser, so you have to test it the way an agent would. A few one-liners worth running once you've shipped your changes.

**Check your post HTML actually contains the post:**

```bash
curl -A "Googlebot" https://yoursite.com/blog/some-post | grep -i "<title>"
curl -A "Googlebot" https://yoursite.com/blog/some-post | wc -c
```

If the title is in the response and the byte count looks like a real page (not 2KB of bundle stub), you're good. The User-Agent header matters because some hosts and CDNs serve different responses to bots.

**Check your markdown endpoint:**

```bash
curl https://yoursite.com/blog/some-post.md
```

You should see raw markdown including frontmatter. If you get a 404, your build script isn't writing into the dist folder, or your host isn't serving `.md` as plain text.

**Check `llms.txt` is live and current:**

```bash
curl https://yoursite.com/llms.txt
```

Confirm every published post is listed and the URLs point to the `.md` versions, not the HTML.

**Check your `Content-Signal` line:**

```bash
curl https://yoursite.com/robots.txt
```

If it's still your old `robots.txt` without the signal line, your build didn't deploy or you have caching to invalidate.

**Check JSON-LD parses:**

Paste any of your URLs into Google's Rich Results Test (`search.google.com/test/rich-results`). It'll show you exactly what entities Google extracts. If your structured data has errors, this is where they show up.

These checks take five minutes and they catch the silent failures - the cases where the build "worked" but the output is wrong in a way you'd never notice in a browser.

## A Quick Checklist

If you want a single page to come back to, here's what to verify on your site:

- [ ] `curl https://yoursite.com/some-blog-post` returns the post content in the HTML, not just a JS bundle
- [ ] Each blog post is also available as `.md` at a predictable URL
- [ ] `/llms.txt` exists, lists your posts, and points to the markdown URLs
- [ ] `/robots.txt` includes a `Content-Signal` line that reflects your actual stance
- [ ] Your site's main HTML has a `Person` (or `Organization`) JSON-LD block
- [ ] `/sitemap.xml` and `/rss.xml` exist and are kept fresh on each build

Six things. None of them are hard. Together they shift your site from "human-only" to "agent-ready" without changing anything users see in a browser.

## The Bigger Picture

Nobody knows yet how much agent traffic will dominate, or which of these conventions will end up sticking. `llms.txt` could become a settled standard or fade into a footnote. `Content-Signal` could be the canonical answer or get replaced by something stronger. The major model providers might converge on a different protocol entirely.

But the underlying shape of the problem isn't going away. Models are reading the web. They're going to keep reading the web. The sites that are easy to read will get cited and surfaced. The sites that aren't will not exist as far as those systems are concerned.

For a personal blog, the upside is small but real. Your posts are more likely to be quoted accurately when somebody asks an assistant about your topic. Your name surfaces in answers it otherwise wouldn't. People who follow your work through AI tools, and that's a growing share of the audience, actually find you.

For a company site, the stakes are bigger. The version of your product an agent describes to a potential customer is the version you've made readable. If your docs are a JavaScript app, the agent doesn't have your docs. If your blog is a JavaScript app, the agent doesn't have your blog. You're handing the answer to whichever competitor did the work you didn't.

The strange thing about all of this is how cheap the work is. A weekend of build-script changes, a few hundred bytes of new files, and your site stops being invisible to half the web. Most personal sites haven't done it yet. That's the entire window.
