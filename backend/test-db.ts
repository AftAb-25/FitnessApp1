import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const f = await prisma.foodMaster.findMany();
    console.log("FOODS:", f.length);
    const e = await prisma.exerciseMaster.findMany();
    console.log("EXERCISES:", e.length);
}
main().finally(() => prisma.$disconnect());
