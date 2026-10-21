import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { seedData } from '../src/seed/seed-data';

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const summary = await seedData(prisma);
    console.log(
      `Seed ready: ${summary.projects.length} projects, primary project ${summary.primaryProjectId}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
