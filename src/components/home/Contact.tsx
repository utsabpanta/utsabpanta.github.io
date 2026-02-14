import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
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

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const copyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-slate-900/30 p-8 md:p-12 border border-slate-100 dark:border-slate-700/50">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={springTransition}
        >
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
            Get in Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Let's Connect
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Whether it's collaborating on open source, discussing technology, or exchanging ideas - I'm always open to a good conversation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Social Links */}
          {socialLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700/50 hover:border-transparent hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...springTransition, delay: index * 0.1 + 0.1 }}
              whileHover={{ y: -4 }}
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
            </motion.a>
          ))}

          {/* Email Card */}
          <motion.a
            href={`mailto:${EMAIL}`}
            className="group relative overflow-hidden bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700/50 hover:border-transparent hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...springTransition, delay: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 group-hover:bg-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
                <FaEnvelope className="w-7 h-7 text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-white mb-2 transition-colors duration-300">
                Email
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400 group-hover:text-white/90 font-medium text-sm break-all transition-colors duration-300">
                  {EMAIL}
                </span>
                <button
                  onClick={copyEmail}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 group-hover:hover:bg-white/20 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 group-hover:text-white/70 group-hover:hover:text-white transition-colors flex-shrink-0"
                  title="Copy email"
                >
                  {copied ? <FaCheck className="w-4 h-4 text-green-500 group-hover:text-white" /> : <FaCopy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.a>
        </div>
        </div>
      </div>
    </section>
  );
}
