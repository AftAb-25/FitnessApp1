import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function pullMassiveData() {
    console.log("Preparing to absorb 200+ global entities...");

    // 1. Workouts (wger)
    console.log("Downloading 100 core exercises from Wger...");
    const wgerUrl = 'https://wger.de/api/v2/exerciseinfo/?language=2&limit=100';
    try {
        const response = await fetch(wgerUrl);
        const data = await response.json();

        let insertedEx = 0;
        for (const ex of data.results) {
            const desc = ex.description.replace(/(<([^>]+)>)/gi, "").trim();
            const difficulty = ['Beginner', 'Intermediate', 'Expert'][Math.floor(Math.random() * 3)];
            const xp = Math.floor(Math.random() * 90) + 10;

            await prisma.exerciseMaster.create({
                data: {
                    name: ex.name,
                    category: ex.category?.name?.toLowerCase() || 'gym',
                    description: desc.substring(0, 500),
                    difficulty_level: difficulty,
                    xp_reward: xp
                }
            });
            insertedEx++;
        }
        console.log(`Successfully mapped ${insertedEx} Wger exercises to native Prisma!`);
    } catch (err) {
        console.error("Wger bridge failed:", err);
    }

    // 2. Nutrition (Open Food Facts)
    console.log("Downloading top 100 food elements from OpenFoodFacts...");
    const foodUrl = 'https://world.openfoodfacts.org/cgi/search.pl?sort_by=unique_scans_n&action=process&json=1&page_size=100';
    try {
        const response = await fetch(foodUrl);
        const data = await response.json();

        let insertedFoods = 0;
        for (const p of data.products) {
            if (!p.product_name) continue;

            const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
            const randomMeal = meals[Math.floor(Math.random() * meals.length)];

            await prisma.foodMaster.create({
                data: {
                    name: p.product_name,
                    brand: p.brands ? p.brands.substring(0, 100) : 'Generic',
                    meal_type: randomMeal,
                    calories: parseFloat(p.nutriments?.['energy-kcal_100g']) || Math.floor(Math.random() * 400) + 50,
                    protein: parseFloat(p.nutriments?.proteins_100g) || Math.floor(Math.random() * 30),
                    carbs: parseFloat(p.nutriments?.carbohydrates_100g) || Math.floor(Math.random() * 50),
                    fat: parseFloat(p.nutriments?.fat_100g) || Math.floor(Math.random() * 20),
                    health_score: Math.floor(Math.random() * 50) + 50
                }
            });
            insertedFoods++;
        }
        console.log(`Successfully mapped ${insertedFoods} OFF items to native Prisma!`);
    } catch (err) {
        console.error("OFF bridge failed:", err);
    }

    console.log("Database expansion complete.");
}

pullMassiveData().catch(console.error).finally(async () => {
    await prisma.$disconnect();
});
