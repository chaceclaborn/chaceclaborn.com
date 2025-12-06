'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Home, Briefcase, FileText, Users, Heart, Shield, LucideIcon, Menu } from 'lucide-react';
import { AuthButton } from '@/components/auth/AuthButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/lib/auth-context';
import { getNavItems } from '@/config/navigation';

// Icon mapping for nav items
const navIcons: Record<string, LucideIcon> = {
  home: Home,
  portfolio: Briefcase,
  resume: FileText,
  family: Users,
  girlfriend: Heart,
  admin: Shield,
};

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { tier } = useAuth();

  const navItems = getNavItems(tier.name, tier.level);

  // Normalize pathname for comparison (handle trailing slashes)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  // Check if current path matches nav item
  const isActive = (href: string) => {
    const normalizedHref = href === '/' ? '/' : href.replace(/\/$/, '');
    return normalizedPath === normalizedHref;
  };

  // Get current page for the dropdown button
  const currentPage = navItems.find(item => isActive(item.href));
  const currentLabel = currentPage?.label || 'Navigate';
  const CurrentIcon = currentPage ? navIcons[currentPage.id] : Home;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedOutsideDesktop = desktopMenuRef.current && !desktopMenuRef.current.contains(target);
      const clickedOutsideMobile = mobileMenuRef.current && !mobileMenuRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Sleek header background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/20" />

      <div className="relative container flex h-16 max-w-7xl items-center justify-between mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="group">
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            chaceclaborn.com
          </motion.span>
        </Link>

        {/* Center - Navigation Command Palette Style */}
        <div ref={desktopMenuRef} className="hidden sm:block absolute left-1/2 -translate-x-1/2">
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center gap-3 px-5 py-2.5 text-sm font-medium rounded-2xl border transition-all duration-300 ${
              menuOpen
                ? 'bg-card border-primary/50 shadow-xl shadow-primary/10'
                : 'bg-card/50 border-border/50 hover:bg-card hover:border-border hover:shadow-lg'
            }`}
          >
            <CurrentIcon className="h-4 w-4 text-primary" />
            <span className="text-foreground">{currentLabel}</span>
            <div className="h-4 w-px bg-border/60" />
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                menuOpen ? 'rotate-180 text-primary' : ''
              }`}
            />
          </motion.button>

          {/* Dropdown Menu - Wide command palette style */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 overflow-hidden bg-card border border-border/60 rounded-2xl shadow-2xl"
              >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Navigate to
                  </p>
                </div>

                {/* Nav Items */}
                <div className="p-2">
                  {navItems.map((item, index) => {
                    const active = isActive(item.href);
                    const Icon = navIcons[item.id] || Home;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              active
                                ? 'bg-primary-foreground/20'
                                : 'bg-muted group-hover:bg-background'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          {active && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1"
                            >
                              <span className="text-xs opacity-70">Current</span>
                              <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                            </motion.div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <div ref={mobileMenuRef} className="sm:hidden">
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                menuOpen
                  ? 'bg-card border-primary/50'
                  : 'bg-card/50 border-border/50'
              }`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </motion.button>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute top-full right-4 mt-2 w-56 overflow-hidden bg-card border border-border/60 rounded-2xl shadow-2xl"
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Navigate to
                    </p>
                  </div>

                  {/* Nav Items */}
                  <div className="p-2">
                    {navItems.map((item, index) => {
                      const active = isActive(item.href);
                      const Icon = navIcons[item.id] || Home;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                        >
                          <Link
                            href={item.href}
                            className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg transition-colors ${
                                active
                                  ? 'bg-primary-foreground/20'
                                  : 'bg-muted group-hover:bg-background'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                              </motion.div>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
