import SEO from '../components/SEO';
import Intro from '../components/home/Intro';
import Skills from '../components/home/Skills';
import LatestPosts from '../components/home/LatestPosts';
import Contact from '../components/home/Contact';

export default function Home() {
  return (
    <div className="space-y-6 pb-8">
      <SEO path="/" />
      <Intro />
      <Skills />
      <LatestPosts />
      <Contact />
    </div>
  );
}
