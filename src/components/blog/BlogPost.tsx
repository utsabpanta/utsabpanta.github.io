import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { format } from 'date-fns';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getPostBySlug, getRelatedPosts } from '../../utils/blogLoader';
import ReadingProgressBar from './ReadingProgressBar';
import RelatedPosts from './RelatedPosts';
import SEO from '../SEO';

const proseStyles = [
  'prose prose-lg prose-slate dark:prose-invert max-w-none',
  'prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white',
  'prose-headings:tracking-tight',
  'prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline',
  'prose-a:fancy-link',
  'prose-p:leading-[1.8] prose-p:mb-7',
  'prose-code:text-blue-700 dark:prose-code:text-blue-300',
  'prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30',
  'prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800',
  'prose-pre:border prose-pre:border-slate-700',
  'prose-h2:mt-12 prose-h2:mb-4',
  'prose-h3:mt-8 prose-h3:mb-3',
  'prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400',
  'prose-blockquote:not-italic prose-blockquote:font-normal',
].join(' ');

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;
  const relatedPosts = post ? getRelatedPosts(post.slug, post.tags) : [];

  if (!post) {
    return (
      <div className="py-20">
        <div className="max-w-[42rem] mx-auto px-6 text-center">
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

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Utsab Pant',
      url: 'https://utsabpant.com',
    },
    publisher: {
      '@type': 'Person',
      name: 'Utsab Pant',
      url: 'https://utsabpant.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://utsabpant.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        article={{
          publishedTime: post.date,
          tags: post.tags,
          author: 'Utsab Pant',
        }}
        schema={blogPostingSchema}
      />
      <ReadingProgressBar />
      <article className="py-20">
        <div className="max-w-[42rem] mx-auto px-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 fancy-link"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back to all posts
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
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
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.2 }}
        >
          <div className={proseStyles}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />

        {/* Footer */}
        <motion.div
          className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </motion.div>
        </div>
      </article>
    </>
  );
}
