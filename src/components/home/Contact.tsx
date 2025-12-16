import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaEnvelope, FaGithub, FaLinkedin, FaArrowRight, FaCopy, FaCheck } from 'react-icons/fa';
import { IconType } from 'react-icons';

const EMAIL = 'utsabpant@utsabpant.com';

const socialLinks: Array<{
  icon: IconType;
  label: string;
  description: string;
  href: string;
  gradient: string;
}> = [
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    description: "Let's connect",
    href: 'https://www.linkedin.com/in/utsab-pant-00415b71',
    gradient: 'from-blue-600 to-blue-500',
  },
  {
    icon: FaGithub,
    label: 'GitHub',
    description: 'Explore my work',
    href: 'https://github.com/utsabpanta',
    gradient: 'from-slate-700 to-slate-600',
  },
];

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const copyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" ref={ref} className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div
          className={`text-center mb-10 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Let's Connect
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Whether it's collaborating on open source, discussing technology, or exchanging ideas - I'm always open to a good conversation.
          </p>
        </div>

        <div
          className={`grid md:grid-cols-3 gap-6 transition-all duration-700 delay-100 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Social Links */}
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700/50 hover:border-transparent hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 group-hover:bg-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
                  <link.icon className="w-7 h-7 text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-white mb-2 transition-colors duration-300">
                  {link.label}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 group-hover:text-white/90 transition-colors duration-300 flex items-center gap-2">
                  {link.description}
                  <FaArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </p>
              </div>
            </a>
          ))}

          {/* Email Card */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700/50">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-5">
              <FaEnvelope className="w-7 h-7 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Email</h3>
            <div className="flex items-center gap-2">
              <a href={`mailto:${EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm break-all">
                {EMAIL}
              </a>
              <button
                onClick={copyEmail}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                title="Copy email"
              >
                {copied ? <FaCheck className="w-4 h-4 text-green-500" /> : <FaCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
