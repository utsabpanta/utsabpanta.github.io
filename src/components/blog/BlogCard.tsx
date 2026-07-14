import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaArrowRight } from 'react-icons/fa';
import type { BlogPostMeta } from '../../types/blog';

interface BlogCardProps {
  post: BlogPostMeta;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block py-8 hover:bg-slate-900/[0.035] dark:hover:bg-white/[0.04] sm:px-5 sm:-mx-5 sm:rounded-lg transition-colors duration-200"
    >
      <article>
        <div className="flex items-center gap-3 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide mb-3">
          <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{post.readTime} min read</span>
        </div>

        <h2 className="font-display text-2xl md:text-[1.75rem] font-medium text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors mb-3">
          {post.title}
        </h2>

        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide"
              >
                #{tag}
              </span>
            ))}
          </div>
          <FaArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </article>
    </Link>
  );
}
