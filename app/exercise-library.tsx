import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { API_URL, useStore } from '../store/useStore';

// Estimate kcal burned per completed set based on difficulty & category
const getCaloriesPerSet = (difficulty: string, category: string): number => {
    const cat = (category || '').toLowerCase();
    const diff = (difficulty || '').toLowerCase();
    // Base multiplier by category (muscle-group compound lifts burn more)
    let base = 6;
    if (cat.includes('chest') || cat.includes('back') || cat.includes('legs') || cat.includes('shoulder')) base = 8;
    if (cat.includes('legs') || cat.includes('glutes')) base = 10;
    if (cat.includes('cardio') || cat.includes('running')) base = 12;
    // Scale by difficulty
    if (diff === 'intermediate' || diff === 'medium') base = Math.round(base * 1.35);
    if (diff === 'advanced' || diff === 'hard') base = Math.round(base * 1.75);
    return base;
};

const getMuscleIcon = (category: string): string => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('chest')) return 'body-outline';
    if (cat.includes('back')) return 'clipboard-outline';
    if (cat.includes('leg') || cat.includes('glutes')) return 'walk-outline';
    if (cat.includes('shoulder') || cat.includes('arm') || cat.includes('bicep') || cat.includes('tricep')) return 'barbell-outline';
    if (cat.includes('core') || cat.includes('abs')) return 'ellipse-outline';
    if (cat.includes('cardio')) return 'bicycle-outline';
    return 'fitness-outline';
};

export default function ExerciseLibraryScreen() {
    const router = useRouter();
    const { sessionId } = useLocalSearchParams();
    const { addExerciseToSession, authToken } = useStore();

    const [search, setSearch] = useState('');
    const [exercises, setExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        searchExercises();
    }, []);

    const searchExercises = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/external/workouts?query=${search}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            setExercises(data.results || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectExercise = (exercise: any) => {
        if (sessionId) {
            addExerciseToSession(sessionId as string, {
                id: Math.random().toString(36).substr(2, 9),
                exerciseId: String(exercise.id),
                name: exercise.name,
                sets: [{ id: 'set_1', reps: 0, weight: 0, completed: false }],
            });
            router.back();
        }
    };
    const renderItem = ({ item }: { item: any }) => {
        const cals = getCaloriesPerSet(item.difficulty, item.category);
        const muscle = item.muscles?.[0] || item.category || 'General';

        return (
            <TouchableOpacity style={styles.exerciseCard} onPress={() => handleSelectExercise(item)}>
                {/* Header row: name + difficulty badge */}
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.badge, {
                        backgroundColor:
                            item.difficulty === 'Advanced' ? 'rgba(239,68,68,0.15)' :
                                item.difficulty === 'Intermediate' ? 'rgba(251,146,60,0.15)' :
                                    'rgba(56,189,248,0.15)'
                    }]}>
                        <Text style={[styles.badgeText, {
                            color:
                                item.difficulty === 'Advanced' ? '#ef4444' :
                                    item.difficulty === 'Intermediate' ? '#fb923c' :
                                        COLORS.primary
                        }]}>{item.difficulty || 'General'}</Text>
                    </View>
                </View>

                {/* Info chips row: muscle group + calorie estimate */}
                <View style={styles.infoRow}>
                    <View style={styles.muscleChip}>
                        <Ionicons name={getMuscleIcon(item.category) as any} size={13} color={COLORS.textMuted} />
                        <Text style={styles.muscleChipText}>{muscle}</Text>
                    </View>
                    <View style={styles.calorieChip}>
                        <Text style={styles.calorieChipText}>🔥 ~{cals} kcal / set</Text>
                    </View>
                </View>

                {/* Description */}
                <Text style={styles.instructions} numberOfLines={2}>
                    {item.description}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Exercises</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={searchExercises}
                    returnKeyType="search"
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={exercises}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 40 }}>Type an exercise and hit enter to search.</Text>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.lg,
        paddingTop: SIZES.xl,
        backgroundColor: COLORS.surface,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    closeBtn: {
        padding: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: SIZES.md,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.md,
        paddingHorizontal: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: SIZES.md,
        color: COLORS.text,
        fontSize: 16,
    },
    categoriesContainer: {
        paddingHorizontal: SIZES.md,
        marginBottom: SIZES.md,
    },
    categoryBtn: {
        paddingHorizontal: SIZES.md,
        paddingVertical: 8,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.md,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    categoryBtnActive: {
        backgroundColor: COLORS.primaryDark,
        borderColor: COLORS.primary,
    },
    categoryText: {
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: COLORS.text,
    },
    listContent: {
        padding: SIZES.md,
    },
    exerciseCard: {
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        marginBottom: SIZES.md,
        ...SHADOWS.small,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    exerciseName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: SIZES.xs,
    },
    badgeText: {
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SIZES.sm,
    },
    muscleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
    },
    muscleChipText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    calorieChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(249,115,22,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.3)',
    },
    calorieChipText: {
        color: '#f97316',
        fontSize: 12,
        fontWeight: '700',
    },
    instructions: {
        color: COLORS.textMuted,
        fontSize: 14,
        lineHeight: 20,
    },
});
