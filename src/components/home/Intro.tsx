import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaAws, FaUsers, FaClipboardCheck, FaCode, FaSitemap, FaLightbulb, FaRocket, FaCloud, FaHandsHelping, FaCogs } from 'react-icons/fa';
import profileImage from '../../assets/profile.jpg';

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function Intro() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

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

  const credentials = [
    {
      icon: FaAws,
      title: 'AWS Solutions Architect',
      subtitle: 'Certified',
      color: 'text-[#FF9900]',
      bg: 'bg-[#FF9900]/10',
    },
    {
      icon: FaClipboardCheck,
      title: 'Scrum Product Owner',
      subtitle: 'CSPO Certified',
      color: 'text-[#009FDA]',
      bg: 'bg-[#009FDA]/10',
    },
    {
      icon: FaUsers,
      title: 'Raise The Bar Leader',
      subtitle: 'Coaching Certified',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <section ref={ref} className="pt-24 lg:pt-28" id="about">
      <div className="max-w-5xl mx-auto px-6">
        {/* Main intro card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-slate-900/30 p-8 md:p-12 border border-slate-100 dark:border-slate-700/50">
          {/* Top section with photo and intro */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center lg:items-start">
            {/* Profile Image */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ ...springTransition, duration: 0.7 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur opacity-25" />
                <img
                  src={profileImage}
                  alt="Utsab Pant"
                  className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-2xl object-cover shadow-lg"
                />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Title */}
              <motion.p
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...springTransition, delay: 0.1 }}
              >
                Engineering Leader & Architect
              </motion.p>

              {/* Name — animated gradient */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 gradient-text-animated"
                style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...springTransition, delay: 0.15 }}
              >
                Utsab Pant
              </motion.h1>

              {/* Bio */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...springTransition, delay: 0.2 }}
              >
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  A seasoned technology leader with 12+ years of experience turning vision into reality.
                  I've delivered projects across edtech, financial services, industrial automation, and
                  manufacturing — optimizing processes, enhancing efficiency, and reducing costs along the way.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Currently leading the content authoring platform at College Board, building tools that
                  empower educators and shape opportunities for millions of students. I believe in building
                  not just software, but teams that thrive.
                </p>
              </motion.div>

              {/* Strength pills */}
              <motion.div
                className="flex flex-wrap justify-center lg:justify-start gap-2 mt-6"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...springTransition, delay: 0.3 }}
              >
                {strengths.map((strength) => (
                  <span
                    key={strength.label}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full hover:bg-blue-50 dark:hover:bg-slate-600/50 transition-colors"
                  >
                    <strength.icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {strength.label}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Quote Section — subtle border-l blockquote */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...springTransition, delay: 0.4 }}
          >
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-2">
              <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
                "Great engineering is as much about people as it is about code."
              </p>
            </blockquote>
          </motion.div>
        </div>

        {/* Credentials row */}
        <motion.div
          className="grid sm:grid-cols-3 gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springTransition, delay: 0.5 }}
        >
          {credentials.map((cred) => (
            <div
              key={cred.title}
              className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl ${cred.bg}`}>
                <cred.icon className={`w-6 h-6 ${cred.color}`} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {cred.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cred.subtitle}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...springTransition, delay: 0.6 }}
        >
          <a
            href="#contact"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            Get in touch
          </a>
          <Link
            to="/blog"
            className="px-8 py-3.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:-translate-y-0.5 transition-all"
          >
            Read my blog
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
