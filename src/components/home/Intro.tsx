import { motion } from 'framer-motion';
import {
  FaGithub, FaLinkedin, FaEnvelope, FaUsers, FaCode, FaSitemap, FaLightbulb,
  FaRocket, FaCloud, FaHandsHelping, FaCogs,
} from 'react-icons/fa';
import profileImage from '../../assets/profile.jpg';

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

const strengths = [
  { icon: FaSitemap, label: 'System Architecture' },
  { icon: FaUsers, label: 'Team Leadership' },
  { icon: FaCode, label: 'Hands-on Development' },
  { icon: FaCloud, label: 'Cloud Architecture' },
  { icon: FaLightbulb, label: 'Strategic Thinking' },
  { icon: FaRocket, label: 'Delivery Excellence' },
  { icon: FaHandsHelping, label: 'Mentorship' },
  { icon: FaCogs, label: 'Process Optimization' },
];

const links = [
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com/utsabpanta' },
  { icon: FaLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/utsab-pant-00415b71' },
  { icon: FaEnvelope, label: 'Email', href: 'mailto:utsabpant@utsabpant.com' },
];

export default function Intro() {
  return (
    <section className="pt-24 lg:pt-44" id="about">
      <div className="max-w-3xl mx-auto px-6">
        {/* Masthead */}
        <motion.div
          className="flex items-center gap-5 sm:gap-7 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <img
            src={profileImage}
            alt="Utsab Pant"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-1 ring-slate-900/10 dark:ring-white/15 shadow-lg shadow-slate-900/10 dark:shadow-black/40 flex-shrink-0"
          />
          <div>
            <h1
              className="font-display text-4xl sm:text-5xl font-medium text-slate-900 dark:text-white"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Utsab Pant
            </h1>
            <p className="font-display italic text-lg sm:text-xl text-slate-500 dark:text-slate-400 mt-1.5">
              Engineering leader &amp; architect
            </p>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          className="space-y-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <p>
            A seasoned technology leader with 12+ years of experience turning vision into reality.
            I&rsquo;ve delivered projects across edtech, financial services, industrial automation,
            and manufacturing — optimizing processes, enhancing efficiency, and reducing costs
            along the way.
          </p>
          <p>
            Currently leading the content authoring platform at College Board, building tools that
            empower educators and shape opportunities for millions of students. I believe in
            building not just software, but teams that thrive.
          </p>
        </motion.div>

        {/* Strengths */}
        <motion.div
          className="flex flex-wrap gap-2 mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.2 }}
        >
          {strengths.map((strength) => (
            <span
              key={strength.label}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full"
            >
              <strength.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              {strength.label}
            </span>
          ))}
        </motion.div>

        {/* Credentials + links */}
        <motion.div
          className="flex flex-wrap items-baseline justify-between gap-4 mt-10 pt-6 border-t border-slate-200/70 dark:border-slate-800/70"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.3 }}
        >
          <p className="font-mono text-xs text-slate-500 dark:text-slate-400 tracking-wide">
            <span className="whitespace-nowrap">AWS Certified Solutions Architect</span>
            {' · '}
            <span className="whitespace-nowrap">Certified Scrum Product Owner</span>
          </p>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors fancy-link"
              >
                <link.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
