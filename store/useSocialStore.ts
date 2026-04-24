import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface PublicUser {
    id: string;
    name: string;
    avatar: string;
    streak: number;
    level: number;
    totalWorkouts: number;
    isOnline: boolean;
    points: number;
}

export type ActivityType = 'workout_completed' | 'streak_milestone' | 'new_pr' | 'challenge_won';

export interface FeedActivity {
    id: string;
    userId: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
    likes: number;
    hasLiked: boolean;
    comments: number;
}

export interface Challenge {
    id: string;
    senderId: string;
    receiverId: string;
    title: string;
    status: 'pending' | 'accepted' | 'completed' | 'rejected';
    progressMode: 'count' | 'boolean';
    targetCount?: number;
    currentCount?: number;
}

interface SocialState {
    friends: PublicUser[];
    suggestedUsers: PublicUser[];
    feed: FeedActivity[];
    challenges: Challenge[];

    // Actions
    toggleLike: (activityId: string) => void;
    sendFriendRequest: (userId: string) => void;
    acceptFriendRequest: (userId: string) => void;
    removeFriend: (userId: string) => void;
    createChallenge: (challenge: Omit<Challenge, 'id' | 'status'>) => void;
    acceptChallenge: (challengeId: string) => void;
}

// Generate mock data
const MOCK_USERS: PublicUser[] = [
    { id: 'u1', name: 'Alex Fitness', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', streak: 12, level: 5, totalWorkouts: 45, isOnline: true, points: 520 },
    { id: 'u2', name: 'Sarah Lifts', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', streak: 4, level: 8, totalWorkouts: 120, isOnline: false, points: 850 },
    { id: 'u3', name: 'Mike Runner', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', streak: 25, level: 12, totalWorkouts: 200, isOnline: true, points: 1200 },
];

const MOCK_FEED: FeedActivity[] = [
    { id: 'f1', userId: 'u2', type: 'new_pr', title: 'New Personal Record!', description: 'Sarah hit a 100kg Deadlift PR 🔥', timestamp: new Date(Date.now() - 3600000).toISOString(), likes: 12, hasLiked: false, comments: 3 },
    { id: 'f2', userId: 'u1', type: 'workout_completed', title: 'Completed Leg Day', description: 'Alex crushed a 45 min leg session', timestamp: new Date(Date.now() - 7200000).toISOString(), likes: 8, hasLiked: true, comments: 1 },
    { id: 'f3', userId: 'u3', type: 'streak_milestone', title: '25 Day Streak!', description: 'Mike is unstoppable! 25 days straight', timestamp: new Date(Date.now() - 86400000).toISOString(), likes: 24, hasLiked: false, comments: 5 },
];

export const useSocialStore = create<SocialState>()(
    persist(
        (set, get) => ({
            friends: [MOCK_USERS[0], MOCK_USERS[1]],
            suggestedUsers: [MOCK_USERS[2]],
            feed: MOCK_FEED,
            challenges: [
                { id: 'c1', senderId: 'u1', receiverId: 'me', title: '100 Pushups Challenge', status: 'pending', progressMode: 'count', targetCount: 100, currentCount: 0 }
            ],

            toggleLike: (activityId) => set((state) => ({
                feed: state.feed.map(f => {
                    if (f.id === activityId) {
                        return { ...f, hasLiked: !f.hasLiked, likes: f.hasLiked ? f.likes - 1 : f.likes + 1 };
                    }
                    return f;
                })
            })),

            sendFriendRequest: (userId) => set((state) => {
                // Mock immediately adding to friends list for simulation
                const user = state.suggestedUsers.find(u => u.id === userId);
                if (!user) return state;
                return {
                    suggestedUsers: state.suggestedUsers.filter(u => u.id !== userId),
                    friends: [...state.friends, user]
                };
            }),

            acceptFriendRequest: (userId) => { },

            removeFriend: (userId) => set((state) => {
                const user = state.friends.find(u => u.id === userId);
                if (!user) return state;
                return {
                    friends: state.friends.filter(u => u.id !== userId),
                    suggestedUsers: [...state.suggestedUsers, user]
                };
            }),

            createChallenge: (challenge) => set((state) => ({
                challenges: [...state.challenges, { ...challenge, id: Math.random().toString(36).substr(2, 9), status: 'pending' }]
            })),

            acceptChallenge: (challengeId) => set((state) => ({
                challenges: state.challenges.map(c => c.id === challengeId ? { ...c, status: 'accepted' } : c)
            }))

        }),
        {
            name: 'fitapp-social-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
