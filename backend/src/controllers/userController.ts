import { Request, Response } from 'express';

import { prisma } from '../db';

export const getProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const { name, age, weight, height, goal, activity_level, streak, level, points } = req.body;
        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, age, weight, height, goal, activity_level, streak, level, points }
        });
        res.json(user);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
