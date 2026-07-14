import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const DIST_DIR = path.join(__dirname, '../dist');
const SSR_ENTRY = path.join(__dirname, '../dist-ssr/entry-server.js');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

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

function loadRoutes() {
  const posts = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data } = parseFrontmatter(raw);
      if (data.published === false) return null;
      return {
        slug: file.replace('.md', ''),
        date: data.date || new Date().toISOString().split('T')[0],
      };
    })
    .filter(Boolean);

  // Each route is written both as <dir>/index.html (serves the trailing-slash
  // URL) and as <name>.html (GitHub Pages serves it at the extensionless URL,
  // so the canonical no-slash URL returns 200 instead of a 301).
  return [
    { url: '/', outPaths: [path.join(DIST_DIR, 'index.html')] },
    {
      url: '/blog',
      outPaths: [
        path.join(DIST_DIR, 'blog', 'index.html'),
        path.join(DIST_DIR, 'blog.html'),
      ],
    },
    ...posts.map((p) => ({
      url: `/blog/${p.slug}`,
      outPaths: [
        path.join(DIST_DIR, 'blog', p.slug, 'index.html'),
        path.join(DIST_DIR, 'blog', `${p.slug}.html`),
      ],
    })),
  ];
}

function stripHeadDefaults(template) {
  return template
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta name="description"[^>]*\/?>/g, '')
    .replace(/\s*<meta property="og:title"[^>]*\/?>/g, '')
    .replace(/\s*<meta property="og:description"[^>]*\/?>/g, '')
    .replace(/\s*<meta property="og:url"[^>]*\/?>/g, '')
    .replace(/\s*<meta property="og:type"[^>]*\/?>/g, '')
    .replace(/\s*<meta property="og:site_name"[^>]*\/?>/g, '')
    .replace(/\s*<meta property="og:image"[^>]*\/?>/g, '')
    .replace(/\s*<meta name="twitter:card"[^>]*\/?>/g, '')
    .replace(/\s*<meta name="twitter:title"[^>]*\/?>/g, '')
    .replace(/\s*<meta name="twitter:description"[^>]*\/?>/g, '')
    .replace(/\s*<meta name="twitter:image"[^>]*\/?>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*\/?>/g, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

function injectIntoTemplate(template, { headTags, bodyHtml }) {
  const stripped = stripHeadDefaults(template);
  let html = stripped.replace(/(\s*)<\/head>/, `\n    ${headTags}\n  </head>`);
  html = html.replace(/<div id="root">\s*<\/div>/, `<div id="root">${bodyHtml}</div>`);
  return html;
}

function writePage(outPath, html) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
}

async function prerender() {
  const { render } = await import(pathToFileURL(SSR_ENTRY).href);
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const routes = loadRoutes();

  for (const route of routes) {
    const { html: bodyHtml, helmet } = render(route.url);

    const headTags = [
      helmet.title.toString(),
      helmet.meta.toString(),
      helmet.link.toString(),
      helmet.script.toString(),
    ]
      .filter(Boolean)
      .join('\n    ');

    const fullHtml = injectIntoTemplate(template, { headTags, bodyHtml });
    for (const outPath of route.outPaths) {
      writePage(outPath, fullHtml);
    }
  }

  console.log(`Prerendered ${routes.length} pages.`);
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
