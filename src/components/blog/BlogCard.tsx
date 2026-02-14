import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaArrowRight } from 'react-icons/fa';
import type { BlogPostMeta } from '../../types/blog';
import SpotlightCard from '../ui/SpotlightCard';

interface BlogCardProps {
  post: BlogPostMeta;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <SpotlightCard className="rounded-2xl">
      <Link to={`/blog/${post.slug}`}>
        <article className="group bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 border-t-4 border-blue-500 transition-all duration-300" style={{ transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease' }}>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3">
            {post.title}
          </h2>

          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <FaArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </article>
      </Link>
    </SpotlightCard>
  );
}
