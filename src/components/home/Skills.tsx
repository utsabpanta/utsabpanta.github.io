import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  FaReact, FaNodeJs, FaAws, FaGitAlt, FaDocker, FaPhp, FaAngular, FaJava,
} from 'react-icons/fa';
import {
  SiTypescript, SiJavascript, SiKubernetes, SiCsharp, SiExpress,
  SiPostgresql, SiAmazondynamodb, SiGo, SiCircleci, SiApachekafka, SiGithubactions,
} from 'react-icons/si';
import { IconType } from 'react-icons';
import { useTheme } from '../../context/ThemeContext';

interface Skill {
  name: string;
  Icon: IconType;
  color: string;
  darkColor?: string;
}

const skills: Skill[] = [
  { name: 'Angular', Icon: FaAngular, color: '#DD0031' },
  { name: 'AWS', Icon: FaAws, color: '#FF9900' },
  { name: 'C#', Icon: SiCsharp, color: '#68217A' },
  { name: 'CircleCI', Icon: SiCircleci, color: '#343434', darkColor: '#FFFFFF' },
  { name: 'Docker', Icon: FaDocker, color: '#2496ED' },
  { name: 'DynamoDB', Icon: SiAmazondynamodb, color: '#4053D6' },
  { name: 'Express', Icon: SiExpress, color: '#000000', darkColor: '#FFFFFF' },
  { name: 'Git', Icon: FaGitAlt, color: '#F05032' },
  { name: 'GitHub Actions', Icon: SiGithubactions, color: '#2088FF' },
  { name: 'Go', Icon: SiGo, color: '#00ADD8' },
  { name: 'Java', Icon: FaJava, color: '#E76F00' },
  { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E' },
  { name: 'Kafka', Icon: SiApachekafka, color: '#231F20', darkColor: '#FFFFFF' },
  { name: 'Kubernetes', Icon: SiKubernetes, color: '#326CE5' },
  { name: 'Node.js', Icon: FaNodeJs, color: '#339933' },
  { name: 'PHP', Icon: FaPhp, color: '#777BB4' },
  { name: 'PostgreSQL', Icon: SiPostgresql, color: '#336791' },
  { name: 'React', Icon: FaReact, color: '#61DAFB' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
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

  return (
    <section id="skills" ref={ref} className="py-12 md:py-16 bg-slate-100/50 dark:bg-slate-800/30">
      <div className="max-w-5xl mx-auto px-6">
        {/* Section Title */}
        <div
          className={`text-center mb-10 transition-all duration-700 ${
            isClient && (inView || isMobile) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Technical Skills
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Technologies and tools I work with to build robust, scalable solutions.
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {skills.map((skill, index) => (
            <div
              key={skill.name}
              className={`group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg dark:shadow-slate-900/50 flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
                isClient && (inView || isMobile)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: isClient && !isMobile ? `${index * 50}ms` : '0ms',
              }}
            >
              <div
                className="p-4 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${getIconColor(skill)}15` }}
              >
                <skill.Icon
                  className="w-12 h-12 md:w-16 md:h-16 transition-all duration-300"
                  style={{ color: getIconColor(skill) }}
                />
              </div>
              <span className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 text-center">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
