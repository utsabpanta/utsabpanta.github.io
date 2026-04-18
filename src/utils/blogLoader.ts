import type { BlogPost, BlogPostMeta } from '../types/blog';

const blogFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, unknown> = {};
  match[1].split('\n').forEach((line) => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) return;

    let value: unknown = m[2].trim();
    if (typeof value === 'string') {
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith('[')) {
        try { value = JSON.parse(value.replace(/'/g, '"')); } catch { value = []; }
      }
      else if (value === 'true') value = true;
      else if (value === 'false') value = false;
    }
    data[m[1]] = value;
  });

  return { data, body: match[2] };
}

function parsePost(filepath: string, raw: string): BlogPost {
  const slug = filepath.split('/').pop()?.replace('.md', '') || '';
  const { data, body } = parseFrontmatter(raw);

  return {
    slug,
    title: (data.title as string) || 'Untitled',
    excerpt: (data.excerpt as string) || '',
    content: body,
    date: (data.date as string) || new Date().toISOString(),
    tags: (data.tags as string[]) || [],
    published: data.published !== false,
    readTime: calculateReadTime(body),
    coverImage: (data.coverImage as string) || undefined,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return Object.entries(blogFiles)
    .map(([filepath, raw]) => {
      const { content, ...meta } = parsePost(filepath, raw as string);
      return meta;
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filepath = Object.keys(blogFiles).find((f) => f.includes(`${slug}.md`));
  if (!filepath) return null;
  return parsePost(filepath, blogFiles[filepath] as string);
}

export function getRelatedPosts(currentSlug: string, tags: string[], limit: number = 3): BlogPostMeta[] {
  const allPosts = getAllPosts();

  return allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => ({
      ...post,
      matchCount: post.tags.filter((tag) => tags.includes(tag)).length,
    }))
    .filter((post) => post.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map(({ matchCount, ...post }) => post);
}
