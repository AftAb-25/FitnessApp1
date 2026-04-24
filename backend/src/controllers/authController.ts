import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import { prisma } from '../db';
const SECRET = process.env.JWT_SECRET || 'super_secret_key_123';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return res.status(400).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, goal: 'weight_loss', activity_level: 'moderate' }
        });

        const token = jwt.sign({ id: user.id }, SECRET);
        res.json({ token, user: { ...user, password: '' } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const matches = await bcrypt.compare(password, user.password);
        if (!matches) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, SECRET);
        res.json({ token, user: { ...user, password: '' } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) return res.status(401).json({ error: 'Invalid Google Token' });

        const { email, name } = payload;

        let user = await prisma.user.findUnique({ where: { email: email as string } });
        if (!user) {
            // New user via Google Auth
            const crypto = require('crypto');
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await prisma.user.create({
                data: { name: name || 'Google User', email: email as string, password: randomPassword, goal: 'weight_loss', activity_level: 'moderate' }
            });
        }

        const appToken = jwt.sign({ id: user.id }, SECRET);
        res.json({ token: appToken, user: { ...user, password: '' } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
