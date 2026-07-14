import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  isHomePage: boolean;
}

export default function Header({ isHomePage }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (isHomePage) {
        const sections = ['about', 'skills', 'writing', 'contact'];

        // Check if we're at the bottom of the page
        const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

        if (isAtBottom) {
          setActiveSection('contact');
          return;
        }

        // Find the section that's currently in view
        let currentSection = '';
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= 100) {
              currentSection = section;
            }
          }
        }
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navLinkClasses = (isActive: boolean) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
    }`;

  const sectionLinks = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'writing', label: 'Writing' },
    { id: 'contact', label: 'Contact' },
  ];

  // Determine if Blog route is active
  const isBlogActive = location.pathname.startsWith('/blog');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#fafaf9]/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo / Name */}
          <Link
            to="/"
            className="font-display text-xl italic font-medium text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Utsab Pant
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {isHomePage ? (
              <>
                {sectionLinks.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`${navLinkClasses(activeSection === section.id)} py-1`}
                  >
                    {section.label}
                    {activeSection === section.id && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) => navLinkClasses(isActive && location.pathname === '/')}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/blog"
                  className={() => `${navLinkClasses(isBlogActive)} py-1`}
                >
                  Writing
                  {isBlogActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </NavLink>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
              </motion.div>
            </button>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-4 md:hidden">
            {isHomePage ? (
              <Link
                to="/blog"
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Writing
              </Link>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/blog"
                  className={`text-sm font-medium transition-colors ${
                    isBlogActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Writing
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
