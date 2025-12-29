import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '../src/content/blog');
const OUTPUT_DIR = path.join(__dirname, '../public');

const SITE_URL = 'https://utsabpant.com';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {} };

  const data = {};
  match[1].split('\n').forEach((line) => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) return;

    let value = m[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    data[m[1]] = value;
  });

  return { data };
}

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
  ];

  // Blog posts
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  const blogPosts = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data } = parseFrontmatter(raw);
      const slug = file.replace('.md', '');

      if (data.published === false) return null;

      return {
        url: `/blog/${slug}`,
        lastmod: data.date || today,
        priority: '0.8',
        changefreq: 'monthly',
      };
    })
    .filter(Boolean);

  const allUrls = [...staticPages, ...blogPosts];

  const urlEntries = allUrls
    .map(
      (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully!');
}

generateSitemap();
