import { PrismaClient } from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  // Create pool if it doesn't exist
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool({
      host: 'aws-1-us-east-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.biaxoishtoysdjfiqddl',
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });
  }

  const adapter = new PrismaPg(globalForPrisma.pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
