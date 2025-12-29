import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { BlogPostMeta } from '../../types/blog';

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Related Posts
      </h2>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="group block p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
              <span>·</span>
              <span>{post.readTime} min read</span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
