export interface NavItem {
  href: string;
  label: string;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/portfolio', label: 'Portfolio', id: 'portfolio' },
  { href: '/resume', label: 'Resume', id: 'resume' },
];

export function getNavItems(): NavItem[] {
  return NAV_ITEMS;
}
