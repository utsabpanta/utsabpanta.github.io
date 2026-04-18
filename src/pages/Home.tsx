import SEO from '../components/SEO';
import Intro from '../components/home/Intro';
import Skills from '../components/home/Skills';
import LatestPosts from '../components/home/LatestPosts';
import Contact from '../components/home/Contact';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Utsab Pant',
  url: 'https://utsabpant.com',
  jobTitle: 'Engineering Manager',
  description:
    'Engineering Manager with 12+ years of experience building scalable systems and leading high-performing teams.',
  knowsAbout: [
    'AWS',
    'Serverless',
    'React',
    'TypeScript',
    'Software Architecture',
    'Engineering Leadership',
  ],
  sameAs: [
    'https://www.linkedin.com/in/utsab-pant-00415b71',
    'https://github.com/utsabpanta',
  ],
};

export default function Home() {
  return (
    <div className="space-y-6 pb-8">
      <SEO path="/" schema={personSchema} />
      <Intro />
      <Skills />
      <LatestPosts />
      <Contact />
    </div>
  );
}
