import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCopy, FaCheck } from 'react-icons/fa';

const EMAIL = 'utsabpant@utsabpant.com';

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <hr className="hairline mb-12" />
          <h2 className="font-display text-3xl font-medium text-slate-900 dark:text-white mb-8">
            Get in touch
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
            The best way to reach me is email. I&rsquo;m always glad to talk architecture,
            engineering leadership, or open source.
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-8">
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-none"
            >
              <FaEnvelope className="w-4 h-4" />
              Say hello
            </a>
            <button
              onClick={copyEmail}
              className="group inline-flex items-center gap-2 font-mono text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Copy email address"
            >
              {EMAIL}
              {copied ? (
                <FaCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <FaCopy className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
