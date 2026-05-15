import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { seedDemoData } from '../src/demo/demo.seed';

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const summary = await seedDemoData(prisma);
    console.log(
      `Demo seed ready: ${summary.projects.length} projects, primary project ${summary.primaryProjectId}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();
