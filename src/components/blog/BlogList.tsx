import { useInView } from 'react-intersection-observer';
import { getAllPosts } from '../../utils/blogLoader';
import BlogCard from './BlogCard';

export default function BlogList() {
  const posts = getAllPosts();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div
          className={`mb-12 transition-all duration-700 ${
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

        {/* Posts */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post.slug}
                className={`transition-all duration-700 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-12 text-center transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-xl text-slate-700 dark:text-slate-300 mb-2">No posts yet</p>
            <p className="text-slate-500 dark:text-slate-400">
              Check back soon for articles on software engineering and leadership.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
