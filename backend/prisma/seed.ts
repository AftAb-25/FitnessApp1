import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding Database with Premium Curated Data...');

    // Wipe previous scraped API data or old data entirely
    await prisma.exerciseMaster.deleteMany();
    await prisma.foodMaster.deleteMany();

    // 100 Manually Curated Exercises
    const exercises = [
        // Gym - Chest
        { name: 'Barbell Bench Press', category: 'gym', description: 'Standard flat bench press for chest mass', difficulty_level: 'Intermediate', xp_reward: 60 },
        { name: 'Incline Dumbbell Press', category: 'gym', description: 'Upper chest isolation movement', difficulty_level: 'Intermediate', xp_reward: 55 },
        { name: 'Decline Bench Press', category: 'gym', description: 'Lower chest compound builder', difficulty_level: 'Expert', xp_reward: 70 },
        { name: 'Cable Crossovers', category: 'gym', description: 'Chest fly movement for definition', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'Pec Deck Machine', category: 'gym', description: 'Machine fly for chest isolation', difficulty_level: 'Beginner', xp_reward: 35 },
        { name: 'Dumbbell Pullover', category: 'gym', description: 'Expanding chest and lat stretch', difficulty_level: 'Expert', xp_reward: 50 },
        { name: 'Machine Chest Press', category: 'gym', description: 'Safe guided chest pressing', difficulty_level: 'Beginner', xp_reward: 30 },
        { name: 'Smith Machine Bench', category: 'gym', description: 'Stabilized bench pressing', difficulty_level: 'Intermediate', xp_reward: 50 },

        // Gym - Back
        { name: 'Deadlift', category: 'gym', description: 'Heavy maximal posterior chain pull', difficulty_level: 'Expert', xp_reward: 120 },
        { name: 'Lat Pulldown', category: 'gym', description: 'Cable back width builder', difficulty_level: 'Beginner', xp_reward: 40 },
        { name: 'Barbell Row', category: 'gym', description: 'Compound back thickness exercise', difficulty_level: 'Expert', xp_reward: 90 },
        { name: 'Seated Cable Row', category: 'gym', description: 'Horizontal back pulling matrix', difficulty_level: 'Intermediate', xp_reward: 55 },
        { name: 'Single Arm Dumbbell Row', category: 'gym', description: 'Unilateral lat isolation', difficulty_level: 'Intermediate', xp_reward: 60 },
        { name: 'T-Bar Row', category: 'gym', description: 'Heavy back thickness movement', difficulty_level: 'Expert', xp_reward: 85 },
        { name: 'Pull Ups', category: 'gym', description: 'Bodyweight vertical pulling', difficulty_level: 'Intermediate', xp_reward: 80 },
        { name: 'Chin Ups', category: 'gym', description: 'Bicep focused vertical pull', difficulty_level: 'Intermediate', xp_reward: 75 },
        { name: 'Straight Arm Pulldown', category: 'gym', description: 'Lat isolation without biceps', difficulty_level: 'Intermediate', xp_reward: 40 },
        { name: 'Good Mornings', category: 'gym', description: 'Lower back bridging and stretching', difficulty_level: 'Expert', xp_reward: 65 },

        // Gym - Legs
        { name: 'Barbell Squat', category: 'gym', description: 'King of all leg exercises', difficulty_level: 'Expert', xp_reward: 150 },
        { name: 'Leg Press', category: 'gym', description: 'Heavy machine leg pressing', difficulty_level: 'Beginner', xp_reward: 60 },
        { name: 'Leg Extension', category: 'gym', description: 'Quad isolation machine', difficulty_level: 'Beginner', xp_reward: 35 },
        { name: 'Lying Leg Curl', category: 'gym', description: 'Hamstring isolation machine', difficulty_level: 'Beginner', xp_reward: 35 },
        { name: 'Walking Lunges', category: 'gym', description: 'Dynamic single leg quad burnout', difficulty_level: 'Intermediate', xp_reward: 70 },
        { name: 'Bulgarian Split Squats', category: 'gym', description: 'Intense unilateral leg training', difficulty_level: 'Expert', xp_reward: 95 },
        { name: 'Calf Raises', category: 'gym', description: 'Standing or seated calf building', difficulty_level: 'Beginner', xp_reward: 20 },
        { name: 'Romanian Deadlift', category: 'gym', description: 'Straight leg hamstring stretch', difficulty_level: 'Expert', xp_reward: 90 },
        { name: 'Hack Squat', category: 'gym', description: 'Machine guided deep squat', difficulty_level: 'Intermediate', xp_reward: 75 },
        { name: 'Front Squat', category: 'gym', description: 'Quad dominant barbell squat', difficulty_level: 'Expert', xp_reward: 110 },
        { name: 'Goblet Squat', category: 'gym', description: 'Dumbbell core and leg squat', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'Hip Thrusts', category: 'gym', description: 'Glute isolation bridge', difficulty_level: 'Intermediate', xp_reward: 80 },

        // Gym - Shoulders
        { name: 'Overhead Press', category: 'gym', description: 'Standing barbell shoulder press', difficulty_level: 'Expert', xp_reward: 100 },
        { name: 'Dumbbell Lateral Raise', category: 'gym', description: 'Side delt width builder', difficulty_level: 'Beginner', xp_reward: 30 },
        { name: 'Front Raise', category: 'gym', description: 'Anterior delt isolation', difficulty_level: 'Beginner', xp_reward: 25 },
        { name: 'Reverse Pec Deck', category: 'gym', description: 'Rear delt isolation fly', difficulty_level: 'Intermediate', xp_reward: 40 },
        { name: 'Face Pulls', category: 'gym', description: 'Rear delt and rotator cuff pull', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'Upright Row', category: 'gym', description: 'Trap and shoulder pull', difficulty_level: 'Intermediate', xp_reward: 60 },
        { name: 'Shrugs', category: 'gym', description: 'Heavy trap isolation', difficulty_level: 'Beginner', xp_reward: 40 },
        { name: 'Arnold Press', category: 'gym', description: 'Rotational dumbbell press', difficulty_level: 'Intermediate', xp_reward: 55 },

        // Gym - Arms
        { name: 'Barbell Curl', category: 'gym', description: 'Heavy bicep compound curl', difficulty_level: 'Intermediate', xp_reward: 50 },
        { name: 'Dumbbell Hammer Curl', category: 'gym', description: 'Brachialis and forearm builder', difficulty_level: 'Beginner', xp_reward: 35 },
        { name: 'Preacher Curl', category: 'gym', description: 'Strict machine bicep curl', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'Tricep Rope Pushdown', category: 'gym', description: 'Cable tricep isolation', difficulty_level: 'Beginner', xp_reward: 30 },
        { name: 'Skullcrushers', category: 'gym', description: 'Lying tricep extension', difficulty_level: 'Expert', xp_reward: 65 },
        { name: 'Overhead Tricep Extension', category: 'gym', description: 'Long head tricep stretch', difficulty_level: 'Intermediate', xp_reward: 40 },
        { name: 'Close Grip Bench', category: 'gym', description: 'Heavy tricep specific press', difficulty_level: 'Intermediate', xp_reward: 70 },
        { name: 'Concentration Curls', category: 'gym', description: 'Strict single arm bicep peak', difficulty_level: 'Beginner', xp_reward: 30 },

        // Home / Bodyweight
        { name: 'Pushups', category: 'home', description: 'Standard chest bodyweight press', difficulty_level: 'Beginner', xp_reward: 25 },
        { name: 'Diamond Pushups', category: 'home', description: 'Tricep focused pushup', difficulty_level: 'Intermediate', xp_reward: 40 },
        { name: 'Wide Grip Pushups', category: 'home', description: 'Chest stretching pushup', difficulty_level: 'Intermediate', xp_reward: 35 },
        { name: 'Pike Pushups', category: 'home', description: 'Shoulder focused bodyweight press', difficulty_level: 'Expert', xp_reward: 65 },
        { name: 'Burpees', category: 'home', description: 'Full body cardio blaster', difficulty_level: 'Expert', xp_reward: 80 },
        { name: 'Jumping Jacks', category: 'home', description: 'Warmup cardio hops', difficulty_level: 'Beginner', xp_reward: 15 },
        { name: 'Mountain Climbers', category: 'home', description: 'Fast paced core driving', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'Plank', category: 'home', description: 'Static core holds', difficulty_level: 'Intermediate', xp_reward: 30 },
        { name: 'Side Plank', category: 'home', description: 'Oblique static hold', difficulty_level: 'Intermediate', xp_reward: 35 },
        { name: 'Crunches', category: 'home', description: 'Standard upper ab crunch', difficulty_level: 'Beginner', xp_reward: 20 },
        { name: 'Leg Raises', category: 'home', description: 'Lower ab isolation raises', difficulty_level: 'Intermediate', xp_reward: 40 },
        { name: 'Russian Twists', category: 'home', description: 'Rotational oblique twists', difficulty_level: 'Intermediate', xp_reward: 35 },
        { name: 'Bicycle Crunches', category: 'home', description: 'Dynamic alternating core twists', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'V-Ups', category: 'home', description: 'Explosive full core fold', difficulty_level: 'Expert', xp_reward: 60 },
        { name: 'Flutter Kicks', category: 'home', description: 'Lower ab endurance kicks', difficulty_level: 'Beginner', xp_reward: 25 },
        { name: 'Glute Bridges', category: 'home', description: 'Bodyweight hip thrusts', difficulty_level: 'Beginner', xp_reward: 20 },
        { name: 'Jump Squats', category: 'home', description: 'Explosive bodyweight squats', difficulty_level: 'Intermediate', xp_reward: 55 },
        { name: 'Reverse Lunges', category: 'home', description: 'Static step back leg isolation', difficulty_level: 'Beginner', xp_reward: 30 },
        { name: 'Wall Sit', category: 'home', description: 'Static quad endurance hold', difficulty_level: 'Intermediate', xp_reward: 45 },
        { name: 'Shadow Boxing', category: 'home', description: 'Cardio punching drills', difficulty_level: 'Beginner', xp_reward: 50 },

        // Yoga / Mobility
        { name: 'Downward Dog', category: 'yoga', description: 'Hamstring and back stretch posture', difficulty_level: 'Beginner', xp_reward: 15 },
        { name: 'Upward Dog', category: 'yoga', description: 'Chest and hip flexor bridge', difficulty_level: 'Beginner', xp_reward: 15 },
        { name: 'Childs Pose', category: 'yoga', description: 'Recovery back stretching', difficulty_level: 'Beginner', xp_reward: 10 },
        { name: 'Cobra Pose', category: 'yoga', description: 'Spinal mobility arch', difficulty_level: 'Beginner', xp_reward: 15 },
        { name: 'Tree Pose', category: 'yoga', description: 'Single leg balance meditation', difficulty_level: 'Intermediate', xp_reward: 25 },
        { name: 'Warrior I', category: 'yoga', description: 'Lunge and torso elongation', difficulty_level: 'Intermediate', xp_reward: 25 },
        { name: 'Warrior II', category: 'yoga', description: 'Open hip lunge posture', difficulty_level: 'Intermediate', xp_reward: 25 },
        { name: 'Warrior III', category: 'yoga', description: 'Flying single leg balance', difficulty_level: 'Expert', xp_reward: 45 },
        { name: 'Pigeon Pose', category: 'yoga', description: 'Deep glute and hip stretch', difficulty_level: 'Intermediate', xp_reward: 30 },
        { name: 'Cat Cow Pose', category: 'yoga', description: 'Spinal wave mobility', difficulty_level: 'Beginner', xp_reward: 15 },
        { name: 'Crow Pose', category: 'yoga', description: 'Arm balancing gymnastics hold', difficulty_level: 'Expert', xp_reward: 75 },
        { name: 'Lotus Pose', category: 'yoga', description: 'Seated hip articulation', difficulty_level: 'Intermediate', xp_reward: 30 },
        { name: 'Triangle Pose', category: 'yoga', description: 'Side bend hamstring stretch', difficulty_level: 'Intermediate', xp_reward: 25 },
        { name: 'Half Moon Pose', category: 'yoga', description: 'Balancing side core stretch', difficulty_level: 'Expert', xp_reward: 50 },
        { name: 'Bridge Pose', category: 'yoga', description: 'Inverted backbend mobility', difficulty_level: 'Intermediate', xp_reward: 40 },

        // Running / Cycling
        { name: '5k Run', category: 'running', description: 'Standard distance pacing', difficulty_level: 'Intermediate', xp_reward: 200 },
        { name: '10k Run', category: 'running', description: 'Long distance endurance', difficulty_level: 'Expert', xp_reward: 450 },
        { name: 'Light Jog', category: 'running', description: 'Zone 2 recovery running', difficulty_level: 'Beginner', xp_reward: 60 },
        { name: 'Hill Sprints', category: 'running', description: 'Max max effort elevation dashing', difficulty_level: 'Expert', xp_reward: 120 },
        { name: 'Treadmill Incline', category: 'running', description: 'Steep LISS cardio', difficulty_level: 'Beginner', xp_reward: 70 },
        { name: 'Track Repeats', category: 'running', description: '400m speed intervals', difficulty_level: 'Expert', xp_reward: 180 },
        { name: 'Stationary Spin Class', category: 'cycling', description: 'High intensity instructor biking', difficulty_level: 'Intermediate', xp_reward: 150 },
        { name: 'Mountain Biking', category: 'cycling', description: 'Outdoor uneven terrain cycling', difficulty_level: 'Expert', xp_reward: 250 },
        { name: 'Road Cycling', category: 'cycling', description: 'Paved distance endurance', difficulty_level: 'Intermediate', xp_reward: 200 },
        { name: 'Recumbent Bike', category: 'cycling', description: 'Low impact seated pedaling', difficulty_level: 'Beginner', xp_reward: 50 },
    ];

    // Insert Exercises
    console.log(`Injecting ${exercises.length} completely Curated Exercises...`);
    for (const ex of exercises) {
        await prisma.exerciseMaster.create({ data: ex });
    }

    // 100 Manually Curated Nutrition Items
    const foods = [
        // BREAKFAST
        { name: 'Oatmeal with Berries', brand: 'Generic', meal_type: 'breakfast', calories: 350, protein: 10, carbs: 60, fat: 5, health_score: 95 },
        { name: 'Scrambled Eggs (3 whole)', brand: 'Generic', meal_type: 'breakfast', calories: 240, protein: 18, carbs: 2, fat: 15, health_score: 85 },
        { name: 'Avocado Toast on Sourdough', brand: 'Generic', meal_type: 'breakfast', calories: 310, protein: 7, carbs: 35, fat: 16, health_score: 90 },
        { name: 'Greek Yogurt with Honey', brand: 'Generic', meal_type: 'breakfast', calories: 200, protein: 15, carbs: 25, fat: 4, health_score: 95 },
        { name: 'Protein Pancakes', brand: 'Generic', meal_type: 'breakfast', calories: 400, protein: 30, carbs: 45, fat: 8, health_score: 85 },
        { name: 'Bacon & Egg Sandwich', brand: 'Generic', meal_type: 'breakfast', calories: 550, protein: 25, carbs: 40, fat: 35, health_score: 50 },
        { name: 'Fruit Smoothie Bowl', brand: 'Generic', meal_type: 'breakfast', calories: 420, protein: 12, carbs: 80, fat: 9, health_score: 90 },
        { name: 'Cereal with Whole Milk', brand: 'Kelloggs', meal_type: 'breakfast', calories: 380, protein: 10, carbs: 65, fat: 8, health_score: 60 },
        { name: 'Black Coffee', brand: 'Generic', meal_type: 'breakfast', calories: 5, protein: 0, carbs: 1, fat: 0, health_score: 100 },
        { name: 'Whey Protein Shake', brand: 'Optimum Nutrition', meal_type: 'breakfast', calories: 120, protein: 24, carbs: 3, fat: 1, health_score: 95 },
        { name: 'Breakfast Burrito', brand: 'Generic', meal_type: 'breakfast', calories: 600, protein: 28, carbs: 55, fat: 30, health_score: 65 },
        { name: 'French Toast with Syrup', brand: 'Generic', meal_type: 'breakfast', calories: 500, protein: 12, carbs: 85, fat: 15, health_score: 45 },
        { name: 'Egg White Omelette', brand: 'Generic', meal_type: 'breakfast', calories: 150, protein: 25, carbs: 5, fat: 2, health_score: 98 },
        { name: 'Hash Browns', brand: 'Generic', meal_type: 'breakfast', calories: 220, protein: 2, carbs: 30, fat: 12, health_score: 40 },
        { name: 'Bagel with Cream Cheese', brand: 'Generic', meal_type: 'breakfast', calories: 350, protein: 10, carbs: 50, fat: 12, health_score: 55 },
        { name: 'Croissant', brand: 'Generic', meal_type: 'breakfast', calories: 300, protein: 5, carbs: 35, fat: 18, health_score: 30 },
        { name: 'Blueberry Muffin', brand: 'Generic', meal_type: 'breakfast', calories: 450, protein: 6, carbs: 65, fat: 20, health_score: 25 },
        { name: 'Overnight Oats', brand: 'Generic', meal_type: 'breakfast', calories: 280, protein: 15, carbs: 40, fat: 8, health_score: 96 },
        { name: 'Sausage Links (2 pieces)', brand: 'Generic', meal_type: 'breakfast', calories: 180, protein: 9, carbs: 1, fat: 16, health_score: 40 },
        { name: 'Acai Bowl', brand: 'Generic', meal_type: 'breakfast', calories: 400, protein: 5, carbs: 80, fat: 10, health_score: 85 },

        // LUNCH
        { name: 'Grilled Chicken Breast', brand: 'Generic', meal_type: 'lunch', calories: 165, protein: 31, carbs: 0, fat: 3, health_score: 100 },
        { name: 'Brown Rice', brand: 'Generic', meal_type: 'lunch', calories: 215, protein: 5, carbs: 45, fat: 1, health_score: 95 },
        { name: 'Steamed Broccoli', brand: 'Generic', meal_type: 'lunch', calories: 55, protein: 4, carbs: 11, fat: 0, health_score: 100 },
        { name: 'Turkey & Cheese Wrap', brand: 'Generic', meal_type: 'lunch', calories: 450, protein: 30, carbs: 45, fat: 18, health_score: 80 },
        { name: 'Tuna Salad', brand: 'Generic', meal_type: 'lunch', calories: 380, protein: 35, carbs: 10, fat: 22, health_score: 75 },
        { name: 'Spaghetti Bolognese', brand: 'Generic', meal_type: 'lunch', calories: 600, protein: 30, carbs: 70, fat: 20, health_score: 65 },
        { name: 'Caesar Salad with Chicken', brand: 'Generic', meal_type: 'lunch', calories: 550, protein: 40, carbs: 20, fat: 35, health_score: 60 },
        { name: 'Quinoa and Black Beans', brand: 'Generic', meal_type: 'lunch', calories: 350, protein: 15, carbs: 60, fat: 5, health_score: 98 },
        { name: 'Beef Burger (No Fries)', brand: 'Generic', meal_type: 'lunch', calories: 550, protein: 35, carbs: 40, fat: 30, health_score: 50 },
        { name: 'Sweet Potato Fries', brand: 'Generic', meal_type: 'lunch', calories: 250, protein: 2, carbs: 40, fat: 10, health_score: 70 },
        { name: 'Lentil Soup', brand: 'Generic', meal_type: 'lunch', calories: 320, protein: 18, carbs: 50, fat: 6, health_score: 95 },
        { name: 'Pad Thai', brand: 'Generic', meal_type: 'lunch', calories: 750, protein: 25, carbs: 90, fat: 30, health_score: 45 },
        { name: 'Grilled Cheese Sandwich', brand: 'Generic', meal_type: 'lunch', calories: 400, protein: 15, carbs: 45, fat: 20, health_score: 40 },
        { name: 'Tomato Basil Soup', brand: 'Generic', meal_type: 'lunch', calories: 200, protein: 4, carbs: 25, fat: 10, health_score: 85 },
        { name: 'Sushi Roll (Spicy Tuna)', brand: 'Generic', meal_type: 'lunch', calories: 350, protein: 20, carbs: 50, fat: 8, health_score: 80 },
        { name: 'Sushi Roll (California)', brand: 'Generic', meal_type: 'lunch', calories: 300, protein: 10, carbs: 45, fat: 10, health_score: 80 },
        { name: 'Burrito Bowl', brand: 'Chipotle', meal_type: 'lunch', calories: 850, protein: 45, carbs: 90, fat: 35, health_score: 60 },
        { name: 'Falafel Wrap', brand: 'Generic', meal_type: 'lunch', calories: 500, protein: 15, carbs: 65, fat: 22, health_score: 75 },
        { name: 'Margherita Pizza (2 Slices)', brand: 'Generic', meal_type: 'lunch', calories: 450, protein: 18, carbs: 60, fat: 16, health_score: 50 },
        { name: 'Rice and Beans', brand: 'Generic', meal_type: 'lunch', calories: 400, protein: 15, carbs: 75, fat: 4, health_score: 95 },

        // SNACK
        { name: 'Apple', brand: 'Generic', meal_type: 'snack', calories: 95, protein: 0, carbs: 25, fat: 0, health_score: 100 },
        { name: 'Banana', brand: 'Generic', meal_type: 'snack', calories: 105, protein: 1, carbs: 27, fat: 0, health_score: 100 },
        { name: 'Peanut Butter (2 tbsp)', brand: 'Generic', meal_type: 'snack', calories: 190, protein: 7, carbs: 6, fat: 16, health_score: 85 },
        { name: 'Almonds (1 oz)', brand: 'Generic', meal_type: 'snack', calories: 160, protein: 6, carbs: 6, fat: 14, health_score: 98 },
        { name: 'Protein Bar', brand: 'Quest', meal_type: 'snack', calories: 190, protein: 21, carbs: 22, fat: 7, health_score: 85 },
        { name: 'Rice Cakes (2 pieces)', brand: 'Generic', meal_type: 'snack', calories: 70, protein: 2, carbs: 14, fat: 0, health_score: 90 },
        { name: 'String Cheese', brand: 'Generic', meal_type: 'snack', calories: 80, protein: 7, carbs: 1, fat: 6, health_score: 85 },
        { name: 'Beef Jerky (1 oz)', brand: 'Generic', meal_type: 'snack', calories: 115, protein: 15, carbs: 3, fat: 5, health_score: 80 },
        { name: 'Trail Mix (1/2 cup)', brand: 'Generic', meal_type: 'snack', calories: 350, protein: 10, carbs: 35, fat: 22, health_score: 70 },
        { name: 'Hummus (2 tbsp)', brand: 'Generic', meal_type: 'snack', calories: 70, protein: 2, carbs: 4, fat: 5, health_score: 95 },
        { name: 'Carrot Sticks', brand: 'Generic', meal_type: 'snack', calories: 45, protein: 1, carbs: 10, fat: 0, health_score: 100 },
        { name: 'Celery Sticks', brand: 'Generic', meal_type: 'snack', calories: 15, protein: 0, carbs: 3, fat: 0, health_score: 100 },
        { name: 'Dark Chocolate (1 square)', brand: 'Generic', meal_type: 'snack', calories: 60, protein: 1, carbs: 5, fat: 5, health_score: 85 },
        { name: 'Potato Chips', brand: 'Lays', meal_type: 'snack', calories: 160, protein: 2, carbs: 15, fat: 10, health_score: 20 },
        { name: 'Pretzels', brand: 'Generic', meal_type: 'snack', calories: 110, protein: 3, carbs: 23, fat: 1, health_score: 40 },
        { name: 'Popcorn (Air Popped)', brand: 'Generic', meal_type: 'snack', calories: 90, protein: 3, carbs: 18, fat: 1, health_score: 90 },
        { name: 'Edamame (1 cup)', brand: 'Generic', meal_type: 'snack', calories: 190, protein: 17, carbs: 15, fat: 8, health_score: 100 },
        { name: 'Cottage Cheese (1 cup)', brand: 'Generic', meal_type: 'snack', calories: 220, protein: 28, carbs: 10, fat: 8, health_score: 95 },
        { name: 'Grapes (1 cup)', brand: 'Generic', meal_type: 'snack', calories: 104, protein: 1, carbs: 27, fat: 0, health_score: 100 },
        { name: 'Protein Cookie', brand: 'Lenny & Larry', meal_type: 'snack', calories: 400, protein: 16, carbs: 55, fat: 12, health_score: 55 },

        // DINNER
        { name: 'Grilled Salmon', brand: 'Generic', meal_type: 'dinner', calories: 280, protein: 30, carbs: 0, fat: 15, health_score: 100 },
        { name: 'Steak (Sirloin 6oz)', brand: 'Generic', meal_type: 'dinner', calories: 400, protein: 45, carbs: 0, fat: 22, health_score: 85 },
        { name: 'Roasted Asparagus', brand: 'Generic', meal_type: 'dinner', calories: 40, protein: 3, carbs: 8, fat: 2, health_score: 100 },
        { name: 'Mashed Potatoes', brand: 'Generic', meal_type: 'dinner', calories: 250, protein: 4, carbs: 40, fat: 10, health_score: 75 },
        { name: 'Grilled Tilapia', brand: 'Generic', meal_type: 'dinner', calories: 150, protein: 30, carbs: 0, fat: 3, health_score: 98 },
        { name: 'Chicken Curry', brand: 'Generic', meal_type: 'dinner', calories: 550, protein: 35, carbs: 45, fat: 25, health_score: 80 },
        { name: 'Naan Bread', brand: 'Generic', meal_type: 'dinner', calories: 260, protein: 8, carbs: 45, fat: 5, health_score: 50 },
        { name: 'Beef Tacos (3 shells)', brand: 'Generic', meal_type: 'dinner', calories: 650, protein: 35, carbs: 45, fat: 30, health_score: 60 },
        { name: 'Tofu Vegetables Stir Fry', brand: 'Generic', meal_type: 'dinner', calories: 350, protein: 20, carbs: 40, fat: 12, health_score: 95 },
        { name: 'Pork Chops', brand: 'Generic', meal_type: 'dinner', calories: 350, protein: 35, carbs: 0, fat: 20, health_score: 75 },
        { name: 'Baked Ziti', brand: 'Generic', meal_type: 'dinner', calories: 550, protein: 25, carbs: 65, fat: 22, health_score: 55 },
        { name: 'Shrimp Scampi', brand: 'Generic', meal_type: 'dinner', calories: 450, protein: 30, carbs: 40, fat: 18, health_score: 80 },
        { name: 'Cauliflower Pizza', brand: 'Generic', meal_type: 'dinner', calories: 350, protein: 20, carbs: 35, fat: 15, health_score: 85 },
        { name: 'Roasted Chicken Thighs', brand: 'Generic', meal_type: 'dinner', calories: 450, protein: 30, carbs: 5, fat: 32, health_score: 80 },
        { name: 'Pesto Pasta', brand: 'Generic', meal_type: 'dinner', calories: 550, protein: 15, carbs: 65, fat: 25, health_score: 65 },
        { name: 'Bbq Ribs', brand: 'Generic', meal_type: 'dinner', calories: 750, protein: 45, carbs: 20, fat: 55, health_score: 40 },
        { name: 'Macaroni and Cheese', brand: 'Generic', meal_type: 'dinner', calories: 450, protein: 15, carbs: 55, fat: 20, health_score: 30 },
        { name: 'Green Beans Almondine', brand: 'Generic', meal_type: 'dinner', calories: 120, protein: 4, carbs: 10, fat: 8, health_score: 95 },
        { name: 'Chicken Parmesan', brand: 'Generic', meal_type: 'dinner', calories: 600, protein: 50, carbs: 40, fat: 25, health_score: 60 },
        { name: 'Black Bean Burger', brand: 'Generic', meal_type: 'dinner', calories: 350, protein: 20, carbs: 45, fat: 10, health_score: 90 },

        // DESSERTS / EXTRAS
        { name: 'Vanilla Ice Cream', brand: 'Generic', meal_type: 'snack', calories: 270, protein: 5, carbs: 32, fat: 14, health_score: 20 },
        { name: 'Chocolate Chip Cookie', brand: 'Generic', meal_type: 'snack', calories: 150, protein: 2, carbs: 20, fat: 8, health_score: 15 },
        { name: 'Brownie', brand: 'Generic', meal_type: 'snack', calories: 250, protein: 3, carbs: 35, fat: 12, health_score: 20 },
        { name: 'Cheesecake Slice', brand: 'Generic', meal_type: 'snack', calories: 500, protein: 8, carbs: 40, fat: 35, health_score: 10 },
    ];

    console.log(`Injecting ${foods.length} completely Curated Foods...`);
    for (const f of foods) {
        await prisma.foodMaster.create({ data: f });
    }

    console.log('Seeding Complete! Everything is completely hand-curated.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
