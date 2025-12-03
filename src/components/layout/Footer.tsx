import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

const socialLinks = [
  { href: 'https://linkedin.com/in/chaceclaborn', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://github.com/chaceclaborn', icon: Github, label: 'GitHub' },
  { href: 'mailto:chaceclaborn@gmail.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
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
                <Icon className="h-6 w-6" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
