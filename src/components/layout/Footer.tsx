import { FaGithub, FaLinkedin, FaEnvelope, FaRss } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { href: 'https://github.com/utsabpanta', icon: FaGithub, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/utsab-pant-00415b71', icon: FaLinkedin, label: 'LinkedIn' },
    { href: 'mailto:utsabpant@utsabpant.com', icon: FaEnvelope, label: 'Email' },
    { href: '/rss.xml', icon: FaRss, label: 'RSS Feed' },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} Utsab Pant
          </p>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
