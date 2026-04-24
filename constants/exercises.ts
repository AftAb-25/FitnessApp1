export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio' | 'yoga';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
    id: string;
    name: string;
    category: ExerciseCategory;
    instructions: string;
    difficulty: Difficulty;
    videoLink?: string; // e.g. youtube url or mock image
}

export const EXERCISE_LIBRARY: Exercise[] = [
    {
        id: 'e1',
        name: 'Bench Press',
        category: 'chest',
        instructions: 'Lie on bench, lower bar to mid-chest, press back up.',
        difficulty: 'intermediate',
    },
    {
        id: 'e2',
        name: 'Squat',
        category: 'legs',
        instructions: 'Stand with feet shoulder-width apart, lower hips back and down, then return to standing.',
        difficulty: 'advanced',
    },
    {
        id: 'e3',
        name: 'Pushup',
        category: 'chest',
        instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up.',
        difficulty: 'beginner',
    },
    {
        id: 'e4',
        name: 'Pull-up',
        category: 'back',
        instructions: 'Hang from bar with palms facing away, pull body up until chin is over bar, lower down.',
        difficulty: 'advanced',
    },
    {
        id: 'e5',
        name: 'Plank',
        category: 'core',
        instructions: 'Hold a forearm plank position, keeping body in a straight line.',
        difficulty: 'beginner',
    },
    {
        id: 'e6',
        name: 'Running',
        category: 'cardio',
        instructions: 'Run at a steady pace.',
        difficulty: 'beginner',
    },
    {
        id: 'e7',
        name: 'Downward Dog',
        category: 'yoga',
        instructions: 'Start on hands and knees, lift hips up and back, press heels toward floor.',
        difficulty: 'beginner',
    },
];
