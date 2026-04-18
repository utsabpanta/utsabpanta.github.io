import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import {
  FaReact, FaNodeJs, FaAws, FaGitAlt, FaDocker, FaPhp, FaAngular, FaJava, FaDatabase,
} from 'react-icons/fa';
import {
  SiTypescript, SiJavascript, SiKubernetes, SiDotnet, SiExpress,
  SiPostgresql, SiGo, SiCircleci, SiApachekafka, SiGithubactions,
} from 'react-icons/si';
import { IconType } from 'react-icons';
import { useTheme } from '../../context/ThemeContext';

interface Skill {
  name: string;
  Icon: IconType;
  color: string;
  darkColor?: string;
}

interface SkillGroup {
  label: string;
  skills: Skill[];
}

const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
      { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Go', Icon: SiGo, color: '#00ADD8' },
      { name: 'Java', Icon: FaJava, color: '#E76F00' },
      { name: 'C#', Icon: SiDotnet, color: '#512BD4' },
      { name: 'PHP', Icon: FaPhp, color: '#777BB4' },
    ],
  },
  {
    label: 'Frontend',
    skills: [
      { name: 'React', Icon: FaReact, color: '#61DAFB' },
      { name: 'Angular', Icon: FaAngular, color: '#DD0031' },
    ],
  },
  {
    label: 'Backend & Data',
    skills: [
      { name: 'Node.js', Icon: FaNodeJs, color: '#339933' },
      { name: 'Express', Icon: SiExpress, color: '#000000', darkColor: '#FFFFFF' },
      { name: 'PostgreSQL', Icon: SiPostgresql, color: '#336791' },
      { name: 'DynamoDB', Icon: FaDatabase, color: '#4053D6' },
      { name: 'Kafka', Icon: SiApachekafka, color: '#231F20', darkColor: '#FFFFFF' },
    ],
  },
  {
    label: 'Cloud & DevOps',
    skills: [
      { name: 'AWS', Icon: FaAws, color: '#FF9900' },
      { name: 'Docker', Icon: FaDocker, color: '#2496ED' },
      { name: 'Kubernetes', Icon: SiKubernetes, color: '#326CE5' },
      { name: 'Git', Icon: FaGitAlt, color: '#F05032' },
      { name: 'CircleCI', Icon: SiCircleci, color: '#343434', darkColor: '#FFFFFF' },
      { name: 'GitHub Actions', Icon: SiGithubactions, color: '#2088FF' },
    ],
  },
];

export default function Skills() {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { ref, inView } = useInView({
    threshold: isMobile ? 0.1 : 0.3,
    triggerOnce: true,
  });

  const getIconColor = (skill: Skill) =>
    theme === 'dark' && skill.darkColor ? skill.darkColor : skill.color;

  const isVisible = isClient && (inView || isMobile);
  let globalIndex = 0;

  return (
    <section id="skills" ref={ref}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-slate-900/30 p-8 md:p-12 border border-slate-100 dark:border-slate-700/50">
        {/* Section Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
            What I Work With
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Technical Skills
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Technologies and tools I work with to build robust, scalable solutions.
          </p>
        </motion.div>

        {/* Grouped Skills */}
        <div className="space-y-8">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <motion.h3
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.5 }}
              >
                {group.label}
              </motion.h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {group.skills.map((skill) => {
                  const index = globalIndex++;
                  return (
                    <motion.div
                      key={skill.name}
                      className="group bg-slate-50 dark:bg-slate-700/50 p-4 md:p-5 rounded-2xl shadow-md flex flex-col items-center justify-center cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isVisible ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 14,
                        delay: isMobile ? 0 : index * 0.04,
                      }}
                      whileHover={{
                        y: -8,
                        scale: 1.05,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        transition: { type: 'spring', stiffness: 300, damping: 20 },
                      }}
                    >
                      <div
                        className="p-3 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${getIconColor(skill)}15` }}
                      >
                        <skill.Icon
                          className="w-8 h-8 md:w-10 md:h-10 transition-all duration-300"
                          style={{ color: getIconColor(skill) }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
                        {skill.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
