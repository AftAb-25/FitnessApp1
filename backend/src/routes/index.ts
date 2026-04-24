import { Router } from 'express';
import { googleAuth, login, register } from '../controllers/authController';
import { searchExercises, searchNutrition } from '../controllers/externalApiController';
import { addFood, getNutrition, updateWater } from '../controllers/nutritionController';
import { getProfile, updateProfile } from '../controllers/userController';
import { addWorkoutSet, createWorkout, getWorkouts } from '../controllers/workoutController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleAuth);

// Protected routes (Require JWT)
router.use(requireAuth);

// Third-Party API integrations
router.get('/external/nutrition', searchNutrition);
router.get('/external/workouts', searchExercises);

router.get('/users/profile', getProfile);
router.put('/users/profile', updateProfile);

router.get('/workouts', getWorkouts);
router.post('/workouts', createWorkout);
router.post('/workouts/:id/sets', addWorkoutSet);

router.get('/nutrition', getNutrition);
router.post('/nutrition/water', updateWater);
router.post('/nutrition/foods', addFood);

export default router;
