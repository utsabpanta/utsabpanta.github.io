import { useState, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getAllPosts } from '../../utils/blogLoader';
import BlogCard from './BlogCard';
import SEO from '../SEO';

const POSTS_PER_PAGE = 10;

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Utsab Pant — Blog',
  url: 'https://utsabpant.com/blog',
  author: {
    '@type': 'Person',
    name: 'Utsab Pant',
    url: 'https://utsabpant.com',
  },
};

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function BlogList() {
  const allPosts = getAllPosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return allPosts;
    const term = searchTerm.toLowerCase();
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [allPosts, searchTerm]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={ref} className="pt-32 pb-20">
      <SEO
        title="Blog"
        description="Thoughts on engineering leadership, software architecture, and building great teams."
        path="/blog"
        schema={blogSchema}
      />
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={springTransition}
        >
          <p className="eyebrow mb-4">The blog</p>
          <h1 className="font-display text-5xl md:text-6xl font-medium text-slate-900 dark:text-white mb-5">
            Writing
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Thoughts on engineering, leadership, and building great software.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by title, content, or tags…"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[0.9375rem] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all"
            />
          </div>
          {searchTerm && (
            <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} found
            </p>
          )}
        </motion.div>

        {/* Posts */}
        {paginatedPosts.length > 0 ? (
          <>
            <div className="border-t border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedPosts.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    ...springTransition,
                    delay: Math.min(index, 5) * 0.06 + 0.15,
                  }}
                >
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-2 mt-12"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <FaChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-full font-mono text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <FaChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            className="text-center py-20 border-t border-slate-200 dark:border-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={springTransition}
          >
            {searchTerm ? (
              <>
                <p className="font-display text-2xl text-slate-800 dark:text-slate-200 mb-3">
                  No posts found
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Try a different search term or{' '}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-700 dark:text-blue-300 fancy-link"
                  >
                    clear the search
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-2xl text-slate-800 dark:text-slate-200 mb-3">
                  No posts yet
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Check back soon for articles on software engineering and leadership.
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
