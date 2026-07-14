import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { BlogPostMeta } from '../../types/blog';

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
      <p className="eyebrow mb-6">Keep reading</p>
      <div className="space-y-1">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group block py-4 px-4 -mx-4 rounded-xl hover:bg-white/60 dark:hover:bg-slate-900/40 transition-colors duration-200"
          >
            <h3 className="font-display text-xl font-medium text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
              <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>{post.readTime} min read</span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
