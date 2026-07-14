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
      { name: 'JavaScript', Icon: SiJavascript, color: '#A89412', darkColor: '#E8D44D' },
      { name: 'Go', Icon: SiGo, color: '#00ADD8' },
      { name: 'Java', Icon: FaJava, color: '#E76F00' },
      { name: 'C#', Icon: SiDotnet, color: '#512BD4', darkColor: '#8B6FE8' },
      { name: 'PHP', Icon: FaPhp, color: '#777BB4' },
    ],
  },
  {
    label: 'Frontend',
    skills: [
      { name: 'React', Icon: FaReact, color: '#149ECA', darkColor: '#58C4DC' },
      { name: 'Angular', Icon: FaAngular, color: '#DD0031' },
    ],
  },
  {
    label: 'Backend & Data',
    skills: [
      { name: 'Node.js', Icon: FaNodeJs, color: '#339933' },
      { name: 'Express', Icon: SiExpress, color: '#475569', darkColor: '#CBD5E1' },
      { name: 'PostgreSQL', Icon: SiPostgresql, color: '#336791' },
      { name: 'DynamoDB', Icon: FaDatabase, color: '#4053D6' },
      { name: 'Kafka', Icon: SiApachekafka, color: '#37322E', darkColor: '#CBD5E1' },
    ],
  },
  {
    label: 'Cloud & DevOps',
    skills: [
      { name: 'AWS', Icon: FaAws, color: '#EC7211' },
      { name: 'Docker', Icon: FaDocker, color: '#2496ED' },
      { name: 'Kubernetes', Icon: SiKubernetes, color: '#326CE5' },
      { name: 'Git', Icon: FaGitAlt, color: '#F05032' },
      { name: 'CircleCI', Icon: SiCircleci, color: '#475569', darkColor: '#CBD5E1' },
      { name: 'GitHub Actions', Icon: SiGithubactions, color: '#2088FF' },
    ],
  },
];

const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
};

export default function Skills() {
  const { theme } = useTheme();

  const getIconColor = (skill: Skill) =>
    theme === 'dark' && skill.darkColor ? skill.darkColor : skill.color;

  return (
    <section id="skills">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <hr className="hairline mb-12" />
          <h2 className="font-display text-3xl font-medium text-slate-900 dark:text-white mb-8">
            Skills
          </h2>
        </motion.div>

        <div className="space-y-10">
          {skillGroups.map((group, groupIndex) => (
            <motion.div
              key={group.label}
              className="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: groupIndex * 0.08 + 0.1 }}
            >
              <h3 className="font-mono text-[0.6875rem] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] mb-3 sm:mb-0 sm:pt-2">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-full"
                  >
                    <skill.Icon
                      className="w-4 h-4 opacity-80"
                      style={{ color: getIconColor(skill) }}
                    />
                    {skill.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
