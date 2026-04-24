import { Request, Response } from 'express';

import { prisma } from '../db';

export const getNutrition = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const logs = await prisma.nutritionLog.findMany({
            where: { user_id: userId },
            include: { foods: true },
            orderBy: { date: 'desc' }
        });
        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateWater = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const { date, amount } = req.body;
        const parsedDate = new Date(date);
        let log = await prisma.nutritionLog.findFirst({ where: { user_id: userId, date: parsedDate } });

        if (!log) {
            log = await prisma.nutritionLog.create({
                data: { user_id: userId, date: parsedDate, water_glasses: amount }
            });
        } else {
            log = await prisma.nutritionLog.update({
                where: { id: log.id },
                data: { water_glasses: amount }
            });
        }
        res.json(log);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addFood = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const { date, meal, name, calories, protein, carbs, fat } = req.body;
        const parsedDate = new Date(date);
        let log = await prisma.nutritionLog.findFirst({ where: { user_id: userId, date: parsedDate } });

        if (!log) {
            log = await prisma.nutritionLog.create({
                data: { user_id: userId, date: parsedDate, water_glasses: 0 }
            });
        }

        const food = await prisma.food.create({
            data: { log_id: log.id, meal, name, calories, protein, carbs, fat }
        });
        res.json(food);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
