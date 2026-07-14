import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fafaf9] dark:bg-slate-950 transition-colors duration-300 overflow-x-clip">
      {/* Ambient background glow */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[40rem] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-[35rem] rounded-full bg-gradient-to-br from-blue-400/15 via-indigo-300/10 to-transparent dark:from-blue-500/[0.06] dark:via-indigo-500/[0.03] blur-3xl" />
      </div>

      <Header isHomePage={isHomePage} />
      <main className="relative flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
