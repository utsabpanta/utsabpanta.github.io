import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { format } from 'date-fns';
import { FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getAllPosts } from '../../utils/blogLoader';
import SpotlightCard from '../ui/SpotlightCard';

const accentColors = [
  'border-blue-500',
  'border-cyan-500',
  'border-indigo-500',
];

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function LatestPosts() {
  const posts = getAllPosts().slice(0, 3);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  if (posts.length === 0) return null;

  return (
    <section id="latest-posts" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-slate-900/30 p-8 md:p-12 border border-slate-100 dark:border-slate-700/50">
        {/* Section Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springTransition }}
        >
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
            From the Blog
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Latest Posts
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Thoughts on engineering leadership, architecture, and building great teams.
          </p>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...springTransition, delay: index * 0.1 + 0.1 }}
            >
              <SpotlightCard className={`rounded-2xl border-t-4 ${accentColors[index % accentColors.length]}`}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                      <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
                      <span>·</span>
                      <span>{post.readTime} min read</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <FaArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springTransition, delay: 0.4 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium fancy-link"
          >
            View all posts
            <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
