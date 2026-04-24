import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testApi() {
    try {
        const query = "bench";
        const searchStr = String(query).toLowerCase();

        console.log("Fetching exercises...");
        const exList = await prisma.exerciseMaster.findMany();
        console.log("Total exercises:", exList.length);

        let filtered = exList;
        filtered = exList.filter((e: any) =>
            e.name.toLowerCase().includes(searchStr) ||
            (e.category && e.category.toLowerCase().includes(searchStr))
        );

        const results = filtered.map((e: any) => ({
            id: String(e.id),
            name: e.name,
            description: `${e.difficulty_level} • ${e.xp_reward}XP Reward\n${e.description || ''}`,
            category: e.category,
        }));

        console.log("Results:\n", JSON.stringify(results, null, 2));

    } catch (err) {
        console.error("CRITICAL ERROR:", err);
    } finally {
        await prisma.$disconnect();
    }
}
testApi();
