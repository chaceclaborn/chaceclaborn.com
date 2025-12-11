'use client';

import Link from 'next/link';
import { Github, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const socialLinks = [
  { href: 'https://linkedin.com/in/chaceclaborn', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://github.com/chaceclaborn', icon: Github, label: 'GitHub' },
  { href: 'mailto:chaceclaborn@gmail.com', icon: Mail, label: 'Email' },
];

interface FooterProps {
  onChatToggle?: () => void;
  isChatOpen?: boolean;
}

export function Footer({ onChatToggle, isChatOpen }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <footer className={`${isHomePage ? 'fixed bottom-0 left-0 right-0' : 'mt-auto'} z-[100] bg-background/95 backdrop-blur-xl border-t border-border/30`}>
      <div className="container max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {currentYear} Chace Claborn
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={label}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            ))}
            {/* Chat toggle button integrated into footer */}
            <button
              onClick={onChatToggle}
              className={`text-muted-foreground hover:text-primary transition-colors ${isChatOpen ? 'text-primary' : ''}`}
              aria-label="Toggle chat assistant"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
