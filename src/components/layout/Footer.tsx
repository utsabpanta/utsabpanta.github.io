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
    <footer className="border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-display italic text-lg text-slate-800 dark:text-slate-200">
              Utsab Pant
            </p>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mt-1">
              Engineering Leader &amp; Architect
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              &copy; {currentYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" />
              </a>
            ))}
            <button
              onClick={scrollToTop}
              className="p-2 ml-2 pl-4 border-l border-slate-200 dark:border-slate-800 rounded-none text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
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
