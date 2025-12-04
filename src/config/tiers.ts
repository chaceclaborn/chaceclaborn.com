// User tier configuration

export type UserTier = 'admin' | 'girlfriend' | 'family' | 'authenticated' | 'public';

export interface TierConfig {
  name: UserTier;
  level: number;
  emails: string[];
  redirectPath: string | null;
  permissions: string[];
}

export const USER_TIERS: Record<string, TierConfig> = {
  ADMIN: {
    name: 'admin',
    level: 4,
    emails: ['chaceclaborn@gmail.com'],
    redirectPath: '/admin',
    permissions: ['all']
  },
  GIRLFRIEND: {
    name: 'girlfriend',
    level: 3,
    emails: ['raehaberbert@gmail.com'],
    redirectPath: '/girlfriend',
    permissions: ['girlfriend_tab', 'customization_requests']
  },
  FAMILY: {
    name: 'family',
    level: 2,
    emails: [
      'pbclaborn@bellsouth.net',
      'patrick@whitefab.com',
      'patrickclaborn@gmail.com',
      'reivar@bellsouth.net',
      'reiva.claborn@vulc.com',
      'edwardrich43@gmail.com',
      'sondrarich@bellsouth.net',
      'sondraarichardson@icloud.com'
    ],
    redirectPath: '/family',
    permissions: ['family_tab']
  },
  AUTHENTICATED: {
    name: 'authenticated',
    level: 1,
    emails: [],
    redirectPath: null,
    permissions: ['authenticated_content']
  },
  PUBLIC: {
    name: 'public',
    level: 0,
    emails: [],
    redirectPath: null,
    permissions: ['public_content']
  }
};

export function getUserTier(email: string | null | undefined): TierConfig {
  if (!email) return USER_TIERS.PUBLIC;

  const lowerEmail = email.toLowerCase();

  if (USER_TIERS.ADMIN.emails.includes(lowerEmail)) return USER_TIERS.ADMIN;
  if (USER_TIERS.GIRLFRIEND.emails.includes(lowerEmail)) return USER_TIERS.GIRLFRIEND;
  if (USER_TIERS.FAMILY.emails.includes(lowerEmail)) return USER_TIERS.FAMILY;

  return USER_TIERS.AUTHENTICATED;
}

export function hasPermission(tier: TierConfig, permission: string): boolean {
  if (tier.permissions.includes('all')) return true;
  return tier.permissions.includes(permission);
}

export function canAccessTier(userTier: TierConfig, requiredTier: UserTier): boolean {
  const requiredConfig = Object.values(USER_TIERS).find(t => t.name === requiredTier);
  if (!requiredConfig) return false;
  return userTier.level >= requiredConfig.level;
}
