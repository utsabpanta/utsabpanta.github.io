import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { format } from 'date-fns';
import { FaArrowLeft } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { getPostBySlug, getRelatedPosts } from '../../utils/blogLoader';
import ReadingProgressBar from './ReadingProgressBar';
import RelatedPosts from './RelatedPosts';

const proseStyles = [
  'prose prose-lg prose-slate dark:prose-invert max-w-none',
  'prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white',
  'prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline',
  'prose-code:text-blue-700 dark:prose-code:text-blue-300',
  'prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30',
  'prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800',
  'prose-pre:border prose-pre:border-slate-700',
].join(' ');

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;
  const relatedPosts = post ? getRelatedPosts(post.slug, post.tags) : [];
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    initialInView: true,
  });

  if (!post) {
    return (
      <div className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Post Not Found</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReadingProgressBar />
      <article ref={ref} className="py-20">
        <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <Link
          to="/blog"
          className={`inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <FaArrowLeft className="w-3 h-3" />
          Back to all posts
        </Link>

        {/* Header */}
        <header
          className={`mb-12 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Content */}
        <div
          className={`transition-all duration-700 delay-100 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className={proseStyles}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />

        {/* Footer */}
        <div
          className={`mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 transition-all duration-700 delay-200 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </div>
        </div>
      </article>
    </>
  );
}
