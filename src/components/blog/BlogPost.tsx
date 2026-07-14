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
  'prose-headings:font-display prose-headings:font-medium',
  'prose-headings:text-slate-900 dark:prose-headings:text-white',
  'prose-headings:tracking-tight',
  'prose-a:text-blue-700 dark:prose-a:text-blue-300 prose-a:no-underline',
  'prose-a:fancy-link',
  'prose-p:leading-[1.8] prose-p:mb-7',
  'prose-code:text-slate-800 dark:prose-code:text-slate-200',
  'prose-code:bg-slate-100 dark:prose-code:bg-slate-800/80',
  'prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
  'prose-code:font-normal',
  'prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:bg-slate-900 dark:prose-pre:bg-slate-900',
  'prose-pre:border prose-pre:border-slate-700/60 dark:prose-pre:border-slate-800',
  'prose-pre:rounded-xl',
  'prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-3xl',
  'prose-h3:mt-8 prose-h3:mb-3',
  'prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600',
  'prose-blockquote:font-display prose-blockquote:text-xl prose-blockquote:not-italic prose-blockquote:font-normal',
  'prose-img:rounded-xl',
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
      <div className="pt-32 pb-20">
        <div className="max-w-[42rem] mx-auto px-6 text-center">
          <h1 className="font-display text-4xl font-medium text-slate-900 dark:text-white mb-4">
            Post not found
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  const canonicalImage = post.coverImage
    ? (/^https?:\/\//i.test(post.coverImage)
        ? post.coverImage
        : `https://utsabpant.com${post.coverImage.startsWith('/') ? '' : '/'}${post.coverImage}`)
    : undefined;

  const blogPostingSchema: Record<string, unknown> = {
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
  if (canonicalImage) blogPostingSchema.image = canonicalImage;

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.coverImage}
        article={{
          publishedTime: post.date,
          tags: post.tags,
          author: 'Utsab Pant',
        }}
        schema={blogPostingSchema}
      />
      <ReadingProgressBar />
      <article className="pt-32 pb-20">
        <div className="max-w-[42rem] mx-auto px-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-10 fancy-link"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            All posts
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide mb-5">
            <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{post.readTime} min read</span>
          </div>

          <h1 className="font-display text-4xl md:text-[3.25rem] font-medium text-slate-900 dark:text-white mb-6" style={{ letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide"
              >
                #{tag}
              </span>
            ))}
          </div>

          <hr className="hairline mt-10" />
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
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-white/10"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Back to all posts
          </Link>
        </motion.div>
        </div>
      </article>
    </>
  );
}
