import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const DIST_DIR = path.join(__dirname, '../dist');

const SITE_URL = 'https://utsabpant.com';
const SITE_TITLE = 'Utsab Pant';
const SITE_DESCRIPTION =
  'Engineering Manager with 12+ years of experience. Writing about software architecture, engineering leadership, and AI-assisted development.';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data = {};
  match[1].split('\n').forEach((line) => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) return;
    let value = m[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith('[')) {
      try { value = JSON.parse(value.replace(/'/g, '"')); } catch { value = []; }
    } else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    data[m[1]] = value;
  });
  return { data, body: match[2] };
}

function loadPosts() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data, body } = parseFrontmatter(raw);
      if (data.published === false) return null;
      return {
        slug: file.replace('.md', ''),
        title: data.title || 'Untitled',
        excerpt: data.excerpt || '',
        date: data.date || new Date().toISOString().split('T')[0],
        tags: Array.isArray(data.tags) ? data.tags : [],
        raw,
        body,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function writeMarkdownEndpoints(posts) {
  const blogDir = path.join(DIST_DIR, 'blog');
  fs.mkdirSync(blogDir, { recursive: true });
  for (const post of posts) {
    fs.writeFileSync(path.join(blogDir, `${post.slug}.md`), post.raw);
  }
  console.log(`Wrote ${posts.length} markdown endpoints under /blog/*.md`);
}

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
  console.log(`Wrote llms.txt with ${posts.length} posts`);
}

const posts = loadPosts();
writeMarkdownEndpoints(posts);
writeLlmsTxt(posts);
