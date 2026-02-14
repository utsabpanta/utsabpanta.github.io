import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://utsabpant.com';
const SITE_NAME = 'Utsab Pant';
const DEFAULT_DESCRIPTION =
  'Engineering Manager with 12+ years of experience building scalable systems and leading high-performing teams.';
const DEFAULT_TITLE = 'Utsab Pant | Engineering Leader';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime: string;
    tags: string[];
    author?: string;
  };
  schema?: Record<string, unknown>;
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  type = 'website',
  article,
  schema,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Article-specific OG tags */}
      {article && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {article && (
        <meta property="article:author" content={article.author || SITE_NAME} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
