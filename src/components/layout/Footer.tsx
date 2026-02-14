import { FaGithub, FaLinkedin, FaEnvelope, FaRss, FaChevronUp } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: 'https://github.com/utsabpanta', icon: FaGithub, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/utsab-pant-00415b71', icon: FaLinkedin, label: 'LinkedIn' },
    { href: 'mailto:utsabpant@utsabpant.com', icon: FaEnvelope, label: 'Email' },
    { href: '/rss.xml', icon: FaRss, label: 'RSS Feed' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Utsab Pant
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engineering Leader & Architect
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              &copy; {currentYear}
            </p>
          </div>
          <div className="flex items-center gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" />
              </a>
            ))}
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Back to top"
              title="Back to top"
            >
              <FaChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
