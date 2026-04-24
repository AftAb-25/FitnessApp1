import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Production backend deployed on Render
export const API_URL = 'https://fitnessapp1.onrender.com/api';

export type Goal = 'weight_loss' | 'muscle_gain' | 'maintain';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'very_active';
export type FitnessMode = 'Gym' | 'Home' | 'Yoga' | 'Running/Cycling';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

export interface HabitDay {
  date: string;
  sleep: boolean;
  meditate: boolean;
  stretch: boolean;
  recoveryScore: number; // 0-100
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  age?: string;
  weight?: string;
  height?: string;
  gender?: string;
  goal?: Goal;
  activityLevel?: ActivityLevel;
  avatar?: string;
  isOnboarded?: boolean;

  // Goals Settings
  stepGoal?: number;
  calorieGoal?: number;
  workoutFrequencyGoal?: number;

  // Gamification
  points?: number;
  level?: number;
  streak?: number;
  achievements?: string[];
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  mode: FitnessMode;
  exercises: WorkoutExercise[];
  caloriesBurned?: number;
  isFinished?: boolean;
  duration?: number; // in seconds
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: MealType;
}

export interface NutritionDay {
  date: string;
  waterGlasses: number;
  foods: FoodLog[];
}

interface AppState {
  user: UserProfile | null;
  authToken: string | null;
  workouts: WorkoutSession[];
  nutritionDays: NutritionDay[];
  habitDays: HabitDay[];
  aiCoachMessage: string | null;

  // User Actions
  authAction: (action: 'login' | 'register', data: any) => Promise<string | undefined>;
  setUser: (user: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  clearUser: () => void;

  // Gamification Actions
  addPoints: (points: number) => void;
  unlockAchievement: (badgeId: string) => void;
  incrementStreak: () => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (noti: Omit<AppNotification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // Workout Actions
  addWorkoutSession: (session: WorkoutSession) => void;
  finishSession: (sessionId: string) => number;
  syncWorkoutSession: (session: WorkoutSession) => Promise<void>;
  addExerciseToSession: (sessionId: string, exercise: WorkoutExercise) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  deleteSession: (sessionId: string) => void;

  // Nutrition Actions
  addFood: (date: string, food: FoodLog) => void;
  updateWater: (date: string, delta: number) => void;

  // AI & Habits
  toggleHabit: (date: string, key: keyof Omit<HabitDay, 'date' | 'recoveryScore'>) => void;
  generateAICoachMessage: () => void;

  // Backend sync
  syncWithBackend: () => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      authToken: null,
      workouts: [],
      nutritionDays: [],
      notifications: [],
      habitDays: [],
      aiCoachMessage: null,

      authAction: async (action, data) => {
        try {
          const res = await fetch(`${API_URL}/auth/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const json = await res.json();
          if (json.token) {
            const returnedUser = json.user as UserProfile;
            // If the backend doesn't track isOnboarded, assume existing accounts are already onboarded
            if (!returnedUser.isOnboarded) {
              returnedUser.isOnboarded = action === 'login' ? true : false; // new registers go through onboarding once
            }
            set({ authToken: json.token, user: returnedUser });
            await get().syncWithBackend();
            return undefined; // success
          }
          // Server returned a structured error (e.g. 'Email already in use')
          return json.error || 'Something went wrong. Please try again.';
        } catch (e: any) {
          console.warn('Auth failed', e);
          return 'Could not connect to server. Check your network.';
        }
      },

      setUser: async (data) => {
        set((state) => ({ user: { ...state.user, ...data } as UserProfile }));
        try {
          await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${get().authToken}` },
            body: JSON.stringify(data)
          });
        } catch (e) { console.warn('Backend sync failed', e); }
      },
      completeOnboarding: () =>
        set((state) => ({
          user: state.user ? { ...state.user, isOnboarded: true, points: state.user.points || 0, level: state.user.level || 1, streak: state.user.streak || 0, achievements: state.user.achievements || [] } : null,
        })),
      clearUser: () => set({ user: null, authToken: null, workouts: [], nutritionDays: [], habitDays: [], aiCoachMessage: null }),

      syncWithBackend: async () => {
        try {
          const headers = { 'Authorization': `Bearer ${get().authToken}` };
          const userRes = await fetch(`${API_URL}/users/profile`, { headers });
          if (userRes.status === 401) { get().clearUser(); return; }
          const userPayload = await userRes.json();

          const wokRes = await fetch(`${API_URL}/workouts`, { headers });
          const workouts = await wokRes.json();

          const nutRes = await fetch(`${API_URL}/nutrition`, { headers });
          const nutData = await nutRes.json();

          const safeNutritionDays = Array.isArray(nutData) ? nutData.map((d: any) => ({
            date: typeof d.date === 'string' ? d.date.split('T')[0] : d.date,
            waterGlasses: d.water_glasses || 0,
            foods: d.foods || []
          })) : [];

          // Preserve local-only fields (caloriesBurned, isFinished) that the backend doesn't store.
          // Match backend sessions to local sessions by date.
          const localWorkouts = get().workouts;
          const mergedWorkouts = Array.isArray(workouts) ? workouts.map((w: any) => {
            const sessionDate = typeof w.date === 'string' ? w.date.split('T')[0] : w.date;
            const local = localWorkouts.find(l => l.date === sessionDate);
            return {
              ...w,
              date: sessionDate, // Force 'YYYY-MM-DD' format explicitly, not full ISO
              caloriesBurned: local?.caloriesBurned,
              isFinished: local?.isFinished,
              duration: local?.duration,
            };
          }) : localWorkouts;

          set({
            user: userPayload.user || userPayload,
            workouts: mergedWorkouts,
            nutritionDays: safeNutritionDays
          });
        } catch (e) {
          console.warn('Backend offline, falling back to local state', e);
        }
      },

      addNotification: (noti) =>
        set((state) => ({
          notifications: [...state.notifications, { ...noti, id: Date.now().toString() }],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      addPoints: (points) =>
        set((state) => {
          if (!state.user) return state;
          const newPoints = (state.user.points || 0) + points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          return { user: { ...state.user, points: newPoints, level: newLevel } };
        }),

      unlockAchievement: (badgeId) =>
        set((state) => {
          if (!state.user) return state;
          const current = state.user.achievements || [];
          if (current.includes(badgeId)) return state;
          return { user: { ...state.user, achievements: [...current, badgeId] } };
        }),

      incrementStreak: () =>
        set((state) => {
          if (!state.user) return state;
          return { user: { ...state.user, streak: (state.user.streak || 0) + 1 } };
        }),

      addWorkoutSession: (session) => {
        set((state) => ({ workouts: [...state.workouts, session] }));
      },

      // Calculates and saves calories burned for a session, then marks it as finished.
      // Formula: sum of (reps × weight × MET_multiplier) for every COMPLETED set.
      // MET multipliers are calibrated per mode (higher effort = higher coefficient).
      finishSession: (sessionId) => {
        const MET: Record<string, number> = {
          'Gym': 0.08,
          'Home': 0.07,
          'Yoga': 0.04,
          'Running/Cycling': 0.10,
        };

        const session = get().workouts.find((w) => w.id === sessionId);
        if (!session) return 0;

        const coeff = MET[session.mode] || 0.07;
        let totalCals = 0;

        for (const ex of session.exercises) {
          for (const s of ex.sets) {
            if (s.completed) {
              // If weight > 0 use weight × reps × coeff; for bodyweight/yoga use reps × coeff × 5
              const load = s.weight > 0 ? s.weight : 5;
              totalCals += Math.round(s.reps * load * coeff);
            }
          }
        }

        // Minimum floor: 50 kcal so even short sessions register something
        const burned = Math.max(totalCals, 50);

        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === sessionId ? { ...w, caloriesBurned: burned, isFinished: true } : w
          ),
        }));

        return burned;
      },

      syncWorkoutSession: async (session) => {
        try {
          // POST fully baked session payload directly to dynamic adapter layer
          await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${get().authToken}` },
            body: JSON.stringify(session)
          });
          // Refresh global state so local randomized string ID's swap with DB-assigned Int IDs gracefully
          await get().syncWithBackend();
        } catch (e) {
          console.warn('Backend complete session sync failed', e);
        }
      },

      addExerciseToSession: (sessionId, exercise) =>
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === sessionId ? { ...w, exercises: [...w.exercises, exercise] } : w
          ),
        })),

      updateSet: (sessionId, exerciseId, setId, updates) =>
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === sessionId
              ? {
                ...w,
                exercises: w.exercises.map((e) =>
                  e.id === exerciseId
                    ? {
                      ...e,
                      sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
                    }
                    : e
                ),
              }
              : w
          ),
        })),

      deleteSession: (sessionId) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== sessionId),
        })),

      addFood: async (date, food) => {
        set((state) => {
          const day = state.nutritionDays.find((d) => d.date === date);
          if (day) {
            return {
              nutritionDays: state.nutritionDays.map((d) =>
                d.date === date ? { ...d, foods: [...d.foods, food] } : d
              ),
            };
          }
          return { nutritionDays: [...state.nutritionDays, { date, waterGlasses: 0, foods: [food] }] };
        });

        try {
          await fetch(`${API_URL}/nutrition/foods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${get().authToken}` },
            body: JSON.stringify({ date, ...food })
          });
        } catch (e) { console.warn('Backend food sync failed', e); }
      },

      updateWater: async (date, delta) => {
        let newAmount = 0;
        set((state) => {
          const day = state.nutritionDays.find((d) => d.date === date);
          if (day) {
            newAmount = Math.max(0, day.waterGlasses + delta);
            return {
              nutritionDays: state.nutritionDays.map((d) =>
                d.date === date ? { ...d, waterGlasses: newAmount } : d
              ),
            };
          }
          newAmount = Math.max(0, delta);
          return { nutritionDays: [...state.nutritionDays, { date, waterGlasses: newAmount, foods: [] }] };
        });

        try {
          await fetch(`${API_URL}/nutrition/water`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${get().authToken}` },
            body: JSON.stringify({ date, amount: newAmount })
          });
        } catch (e) { console.warn('Backend water sync failed', e); }
      },

      toggleHabit: (date, key) =>
        set((state) => {
          const day = state.habitDays.find((h) => h.date === date) || { date, sleep: false, meditate: false, stretch: false, recoveryScore: 100 };
          const updatedDay = { ...day, [key]: !day[key] };

          let score = 50;
          if (updatedDay.sleep) score += 20;
          if (updatedDay.meditate) score += 15;
          if (updatedDay.stretch) score += 15;
          updatedDay.recoveryScore = score;

          const exists = state.habitDays.find((h) => h.date === date);
          if (exists) {
            return {
              habitDays: state.habitDays.map((h) => (h.date === date ? updatedDay : h)),
            };
          }
          return {
            habitDays: [...state.habitDays, updatedDay],
          };
        }),

      generateAICoachMessage: () =>
        set((state) => {
          const streak = state.user?.streak || 0;
          if (streak >= 3) {
            return { aiCoachMessage: "🔥 You're on fire with a 3+ day streak! If you feel fatigued, try a 10-minute stretch or yoga session." };
          }
          if (state.workouts.length > 5) {
            return { aiCoachMessage: "🧠 Adaptive Suggestion: Your volume is high this week. A deload week might maximize your growth." };
          }
          if (state.habitDays.length > 0 && state.habitDays[state.habitDays.length - 1].recoveryScore < 60) {
            return { aiCoachMessage: "💤 Your recovery score is a bit low. Focus on sleep today before hitting the gym hard." };
          }
          return { aiCoachMessage: "🤖 Coach AI: Let's crush today! Stick to your macro targets and try to beat your personal bests." };
        })
    }),
    {
      name: 'fitapp-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
