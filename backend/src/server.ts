import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import apiRoutes from './routes';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', structure: 'MVC Enterprise', orm: 'Prisma' });
});

// API Routes
app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Enterprise Backend (Prisma+MVC) running on http://localhost:${port}`);
});
