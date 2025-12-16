import { useInView } from 'react-intersection-observer';
import { FaAws, FaUsers, FaClipboardCheck, FaCode, FaSitemap, FaLightbulb, FaRocket, FaCloud, FaHandsHelping, FaCogs, FaQuoteLeft } from 'react-icons/fa';
import profileImage from '../../assets/profile.jpg';

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

  const approach = [
    'Drive impactful projects with innovative, cost-effective solutions',
    'Lead teams through collaboration, mentorship, and strategic guidance',
    'Optimize processes for efficiency and measurable results',
    'Turn challenges into opportunities with agility and purpose',
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
    <section ref={ref} className="pt-24 pb-6 lg:pt-28 lg:pb-8" id="about">
      <div className="max-w-5xl mx-auto px-6">
        {/* Main intro card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-3xl shadow-xl dark:shadow-slate-900/30 p-8 md:p-12 border border-slate-100 dark:border-slate-700/50">
          {/* Top section with photo and intro */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center lg:items-start">
            {/* Profile Image */}
            <div
              className={`flex-shrink-0 transition-all duration-700 ${
                inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur opacity-25" />
                <img
                  src={profileImage}
                  alt="Utsab Pant"
                  className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-2xl object-cover shadow-lg"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Title */}
              <p
                className={`text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 transition-all duration-600 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Engineering Leader & Architect
              </p>

              {/* Name */}
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-5 transition-all duration-600 delay-75 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Utsab Pant
              </h1>

              {/* Bio */}
              <div
                className={`space-y-4 transition-all duration-600 delay-100 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  A software engineer by trade, known for turning vision into reality and
                  leading with purpose. I'm a seasoned technology leader with 12+ years of experience,
                  excelling in both leadership and hands-on technical contributions.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  I've successfully delivered projects across edtech, financial services,
                  industrial automation, and manufacturing - with a proven track record of
                  optimizing processes, enhancing efficiency, and reducing costs.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  I believe in building not just software, but teams that thrive.
                  My leadership centers on empowering engineers to grow, fostering a culture of ownership,
                  and creating environments where innovation flourishes.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Currently, I'm leading the content authoring platform at College Board,
                  working with a talented team of engineers to build tools that empower educators and
                  shape opportunities for millions of students worldwide.
                </p>
              </div>

              {/* Strength pills */}
              <div
                className={`flex flex-wrap justify-center lg:justify-start gap-2 mt-6 transition-all duration-600 delay-150 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {strengths.map((strength) => (
                  <span
                    key={strength.label}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-full"
                  >
                    <strength.icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {strength.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quote Section */}
          <div
            className={`mt-10 transition-all duration-700 delay-200 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-800/30 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-600/30">
              <FaQuoteLeft className="absolute top-6 left-6 w-8 h-8 text-blue-500/20 dark:text-blue-400/20" />
              <blockquote className="relative z-10 text-center">
                <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  "Great engineering is as much about people as it is about code."
                </p>
              </blockquote>
            </div>
          </div>

          {/* Divider */}
          <div
            className={`my-10 border-t border-slate-200 dark:border-slate-700 transition-all duration-700 delay-300 ${
              inView ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* My Approach Section */}
          <div
            className={`transition-all duration-700 delay-300 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">My Approach</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {approach.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="mt-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credentials row */}
        <div
          className={`grid sm:grid-cols-3 gap-4 mt-6 transition-all duration-700 delay-400 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {credentials.map((cred) => (
            <div
              key={cred.title}
              className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-shadow duration-300"
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
        </div>

        {/* CTA - After credentials */}
        <div
          className={`flex flex-wrap justify-center gap-4 mt-8 transition-all duration-600 delay-500 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <a
            href="#contact"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25"
          >
            Get in touch
          </a>
          <a
            href="#skills"
            className="px-8 py-3.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            View skills
          </a>
        </div>
      </div>
    </section>
  );
}
