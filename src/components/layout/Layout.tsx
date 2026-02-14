import { Outlet, useLocation } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Header isHomePage={isHomePage} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Fixed side social links - desktop only (Brittany Chiang pattern) */}
      <div className="fixed bottom-0 left-10 hidden xl:flex flex-col items-center gap-5 z-40">
        <a
          href="https://github.com/utsabpanta"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="GitHub"
        >
          <FaGithub className="w-5 h-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/utsab-pant-00415b71"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="LinkedIn"
        >
          <FaLinkedin className="w-5 h-5" />
        </a>
        <a
          href="mailto:utsabpant@utsabpant.com"
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="Email"
        >
          <FaEnvelope className="w-5 h-5" />
        </a>
        <div className="w-px h-24 bg-slate-300 dark:bg-slate-600" />
      </div>

      {/* Fixed side email - desktop only */}
      <div className="fixed bottom-0 right-10 hidden xl:flex flex-col items-center gap-5 z-40">
        <a
          href="mailto:utsabpant@utsabpant.com"
          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-xs tracking-widest font-mono"
          style={{ writingMode: 'vertical-rl' }}
        >
          utsabpant@utsabpant.com
        </a>
        <div className="w-px h-24 bg-slate-300 dark:bg-slate-600" />
      </div>
    </div>
  );
}
