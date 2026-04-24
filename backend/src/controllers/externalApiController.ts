import { Request, Response } from 'express';
import { prisma } from '../db';

export const searchNutrition = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const searchStr = query ? String(query).toLowerCase() : '';

        const foods = await prisma.foodMaster.findMany();

        // Exact text matches against names or the meal type categories natively
        const filtered = foods.filter((f: any) =>
            f.name.toLowerCase().includes(searchStr) ||
            (f.meal_type && f.meal_type.toLowerCase().includes(searchStr))
        ).slice(0, 20);

        // Format exactly how the frontend consumed the old API payload visually
        const results = filtered.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            brand: p.brand || "Curated Database",
            calories: p.calories,
            protein: p.protein,
            carbs: p.carbs,
            fat: p.fat,
            image: "https://cdn-icons-png.flaticon.com/512/706/706950.png"
        }));

        res.json({ results });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch curated nutrition data' });
    }
};

export const searchExercises = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;

        const exList = await prisma.exerciseMaster.findMany();
        let filtered = exList;

        if (query) {
            const searchStr = String(query).toLowerCase();
            filtered = exList.filter((e: any) =>
                e.name.toLowerCase().includes(searchStr) ||
                (e.category && e.category.toLowerCase().includes(searchStr))
            );
        }

        // Format to what the UI interface expects exactly
        const results = filtered.map((e: any) => ({
            id: String(e.id),
            name: e.name,
            description: `${e.difficulty_level} • ${e.xp_reward}XP Reward\n${e.description || ''}`,
            category: e.category,
        }));

        res.json({ results });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch curated exercise data' });
    }
};
