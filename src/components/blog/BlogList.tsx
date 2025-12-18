import { useState, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getAllPosts } from '../../utils/blogLoader';
import BlogCard from './BlogCard';

const POSTS_PER_PAGE = 10;

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
    <div ref={ref} className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Thoughts on engineering, leadership, and building great software.
          </p>
        </div>

        {/* Search */}
        <div
          className={`mb-8 transition-all duration-700 delay-100 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by title, content, or tags..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Found {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>

        {/* Posts */}
        {paginatedPosts.length > 0 ? (
          <>
            <div className="space-y-6">
              {paginatedPosts.map((post, index) => (
                <div
                  key={post.slug}
                  className={`transition-all duration-700 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${(index + 2) * 100}ms` }}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className={`flex items-center justify-center gap-2 mt-12 transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {searchTerm ? (
              <>
                <p className="text-xl text-slate-700 dark:text-slate-300 mb-2">No posts found</p>
                <p className="text-slate-500 dark:text-slate-400">
                  Try a different search term or{' '}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    clear the search
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="text-xl text-slate-700 dark:text-slate-300 mb-2">No posts yet</p>
                <p className="text-slate-500 dark:text-slate-400">
                  Check back soon for articles on software engineering and leadership.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
