import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getAllPosts } from '../../utils/blogLoader';

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function LatestPosts() {
  const posts = getAllPosts().slice(0, 5);

  if (posts.length === 0) return null;

  return (
    <section id="writing">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <hr className="hairline mb-12" />
          <div className="flex items-baseline justify-between gap-6 mb-8">
            <h2 className="font-display text-3xl font-medium text-slate-900 dark:text-white">
              Writing
            </h2>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 fancy-link flex-shrink-0"
            >
              All posts
              <FaArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: index * 0.06 + 0.1 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6 py-5 hover:bg-slate-900/[0.035] dark:hover:bg-white/[0.04] sm:px-4 sm:-mx-4 sm:rounded-lg transition-colors duration-200"
              >
                <time className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide sm:w-28 flex-shrink-0">
                  {format(new Date(post.date), 'MMM d, yyyy')}
                </time>
                <h3 className="font-display text-xl font-medium text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex-1">
                  {post.title}
                </h3>
                <FaArrowRight className="hidden sm:block w-3.5 h-3.5 flex-shrink-0 self-center text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
