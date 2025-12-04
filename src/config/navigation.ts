import { UserTier } from './tiers';

export interface NavItem {
  href: string;
  label: string;
  id: string;
  requiredTier?: UserTier;
}

export const PUBLIC_NAV: NavItem[] = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/portfolio', label: 'Portfolio', id: 'portfolio' },
  { href: '/resume', label: 'Resume', id: 'resume' },
];

export const PROTECTED_NAV: NavItem[] = [
  { href: '/family', label: 'Family', id: 'family', requiredTier: 'family' },
  { href: '/girlfriend', label: "Raeha's Tab", id: 'girlfriend', requiredTier: 'girlfriend' },
  { href: '/admin', label: 'Admin', id: 'admin', requiredTier: 'admin' },
];

export function getNavItems(userTier: UserTier, tierLevel: number): NavItem[] {
  const items = [...PUBLIC_NAV];

  // Add protected items based on tier level
  for (const item of PROTECTED_NAV) {
    if (item.requiredTier === 'family' && tierLevel >= 2) {
      items.push(item);
    } else if (item.requiredTier === 'girlfriend' && tierLevel >= 3) {
      items.push(item);
    } else if (item.requiredTier === 'admin' && tierLevel >= 4) {
      items.push(item);
    }
  }

  return items;
}
