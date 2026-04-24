import { Request, Response } from 'express';

import { prisma } from '../db';

export const getWorkouts = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const workouts = await prisma.workout.findMany({
            where: { user_id: userId },
            include: { exercises: { include: { sets: true } } },
            orderBy: { date: 'desc' }
        });
        res.json(workouts);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createWorkout = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    try {
        const { date, mode, exercises } = req.body;
        const w = await prisma.workout.create({
            data: {
                user_id: userId,
                date: new Date(date),
                mode,
                exercises: {
                    create: (exercises || []).map((e: any) => ({
                        exercise_id: String(e.exerciseId),
                        name: e.name,
                        sets: {
                            create: (e.sets || []).map((s: any) => ({
                                reps: s.reps,
                                weight: s.weight,
                                completed: s.completed || false
                            }))
                        }
                    }))
                }
            },
            include: { exercises: { include: { sets: true } } }
        });
        res.json(w);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addWorkoutSet = async (req: Request, res: Response) => {
    try {
        // Disabled pending WorkoutExercise endpoint upgrade
        res.json({ message: "Endpoint under construction" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
