export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  tags: string[];
  published: boolean;
}

export type BlogPostMeta = Omit<BlogPost, 'content'>;
