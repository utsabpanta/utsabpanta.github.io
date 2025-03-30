import React from 'react';
import { useInView } from 'react-intersection-observer';
import { FaAward, FaLightbulb, FaRocket, FaUsers } from 'react-icons/fa';

const About: React.FC = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const highlights = [
    { icon: FaAward, text: '12+ years of experience in Software Engineering and Leadership' },
    { icon: FaLightbulb, text: 'Certified Scrum Product Owner' },
    { icon: FaRocket, text: 'AWS Certified Solutions Architect' },
    { icon: FaUsers, text: 'Experienced Team Leader with a proven track record' },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className={`transition-opacity duration-1000 ${inView ? 'opacity-100' : 'opacity-0'}`}
    >
      <h2 className="text-5xl font-bold mb-12 bg-gradient-to-r from-blue-800 to-blue-600 text-transparent bg-clip-text">
        About Me
      </h2>

      <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
        <p className="text-xl text-gray-700 mb-6 leading-relaxed">
          Hi, I am Utsab Pant, a Software Engineer by trade, known for turning dreams into reality
          and leading with purpose. I'm a seasoned technology leader with over 12 years of
          experience in software development, excelling in leadership and individual contributions.
        </p>
        <p className="text-xl text-gray-700 mb-6 leading-relaxed">
          My passion lies in using my expertise to drive impactful projects and lead teams to
          success. I have a proven track record of optimizing processes, enhancing efficiency, and
          reducing costs. My commitment to lifelong learning keeps me updated with the latest
          industry trends, tech stacks, and frameworks.
        </p>
        <p className="text-xl text-gray-700 mb-6 leading-relaxed">
          As an Experienced Lead Software Engineer, Certified Scrum Product Owner, and AWS Certified
          Solutions Architect, I've successfully led and delivered projects across diverse
          industries, including education, finance, industrial automation, and manufacturing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {highlights.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
          >
            <item.icon className="text-4xl text-blue-600" />
            <span className="text-lg font-medium text-gray-800">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-lg shadow-xl">
        <h3 className="text-2xl font-semibold mb-4">My Approach</h3>
        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Drive impactful projects with innovative, cost-effective solutions</li>
          <li>
            Lead teams to success through effective collaboration, mentorship and strategic guidance
          </li>
          <li>Optimize processes for enhanced efficiency</li>
          <li>
            Stay ahead of the curve by continuously learning and integrating the latest industry
            trends, tech stacks, and frameworks
          </li>
          <li>Adapt to dynamic environments with agility, turning challenges into opportunities</li>
        </ul>
      </div>
    </section>
  );
};

export default About;
