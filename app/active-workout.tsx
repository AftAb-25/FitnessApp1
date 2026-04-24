import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';
import { useStore } from '../store/useStore';

export default function ActiveWorkoutScreen() {
    const router = useRouter();
    const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
    const { workouts, updateSet, syncWorkoutSession, addPoints, addNotification, finishSession } = useStore();

    const session = workouts.find((w) => w.id === sessionId);

    // ── Stopwatch ────────────────────────────────────────────────────────────
    const [elapsed, setElapsed] = useState(0);          // total seconds
    const [running, setRunning] = useState(true);
    const elapsedRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                elapsedRef.current += 1;
                setElapsed(elapsedRef.current);
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // ── Exercise Navigation ───────────────────────────────────────────────────
    const [currentIndex, setCurrentIndex] = useState(0);
    const exercises = session?.exercises || [];
    const currentExercise = exercises[currentIndex];
    const isLast = currentIndex === exercises.length - 1;

    // ── Rest Timer ────────────────────────────────────────────────────────────
    const [resting, setResting] = useState(false);
    const [restSeconds, setRestSeconds] = useState(15);
    const restPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!resting) return;
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(restPulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
                Animated.timing(restPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
            ])
        );
        pulse.start();
        const t = setInterval(() => {
            setRestSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(t);
                    setResting(false);
                    pulse.stop();
                    Vibration.vibrate(400);
                    restPulse.setValue(1);
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { clearInterval(t); pulse.stop(); };
    }, [resting]);

    const startRest = () => {
        setRestSeconds(15);
        setResting(true);
    };

    const skipRest = () => {
        setResting(false);
        setRestSeconds(15);
        restPulse.setValue(1);
    };

    // ── Finish Workout ────────────────────────────────────────────────────────
    const finish = useCallback(async () => {
        setRunning(false);
        if (!session) return;

        // Read the LIVE session from store (not the stale closure variable)
        // so we get the latest set completions even if state changed mid-workout
        const liveSession = useStore.getState().workouts.find(w => w.id === sessionId);
        const liveExercises = liveSession?.exercises || exercises;

        const totalSets = liveExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
        const completedSets = liveExercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
        const xpEarned = completedSets * 10 + Math.floor(elapsedRef.current / 60) * 5;

        // ── Inline calorie calculation (no store lookup by ID) ──────────────
        const MET: Record<string, number> = {
            'Gym': 0.08, 'Home': 0.07, 'Yoga': 0.04, 'Running/Cycling': 0.10,
        };
        const coeff = MET[session.mode] || 0.07;
        let totalCals = 0;
        for (const ex of liveExercises) {
            for (const s of ex.sets) {
                if (s.completed) {
                    const load = s.weight > 0 ? s.weight : 5;
                    totalCals += Math.round(s.reps * load * coeff);
                }
            }
        }
        const caloriesBurned = Math.max(totalCals, 50);

        // ── Save directly to store using date as the key (robust to ID changes) ──
        useStore.setState((state) => ({
            workouts: state.workouts.map((w) =>
                w.id === sessionId
                    ? { ...w, caloriesBurned, isFinished: true, duration: elapsedRef.current }
                    : w
            ),
        }));

        addPoints(xpEarned);
        addNotification({
            title: '🔥 Workout Complete!',
            message: `You burned ${caloriesBurned} kcal and earned ${xpEarned} XP!`,
            type: 'success'
        });

        // Sync to backend last — syncWithBackend now preserves caloriesBurned by date
        await syncWorkoutSession(liveSession || session);

        router.replace({
            pathname: '/workout-summary',
            params: {
                sessionId: session.id,
                elapsed: String(elapsedRef.current),
                xp: String(xpEarned),
                totalSets: String(totalSets),
                completedSets: String(completedSets),
                caloriesBurned: String(caloriesBurned),
            },
        });
    }, [session, exercises, sessionId]);

    const handleNext = () => {
        if (isLast) {
            finish();
        } else {
            setCurrentIndex((i) => i + 1);
            setResting(false);
        }
    };

    if (!session || exercises.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.emptyText}>No exercises in this session.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { setRunning(false); router.back(); }} style={styles.exitBtn}>
                    <Ionicons name="close" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
                <View style={styles.stopwatchContainer}>
                    <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                    <Text style={styles.stopwatch}>{formatTime(elapsed)}</Text>
                </View>
                <TouchableOpacity onPress={() => setRunning(r => !r)} style={styles.pauseBtn}>
                    <Ionicons name={running ? 'pause' : 'play'} size={20} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressRow}>
                {exercises.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.progressSegment,
                            i < currentIndex && styles.progressDone,
                            i === currentIndex && styles.progressActive,
                        ]}
                    />
                ))}
            </View>

            {/* Exercise Counter */}
            <Text style={styles.counter}>
                Exercise {currentIndex + 1} of {exercises.length}
            </Text>

            {/* Rest Timer Overlay */}
            {resting ? (
                <View style={styles.restOverlay}>
                    <Animated.View style={[styles.restCircle, { transform: [{ scale: restPulse }] }]}>
                        <Text style={styles.restLabel}>REST</Text>
                        <Text style={styles.restTime}>{restSeconds}s</Text>
                    </Animated.View>
                    <TouchableOpacity style={styles.skipBtn} onPress={skipRest}>
                        <Text style={styles.skipBtnText}>Skip Rest →</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Exercise Name */}
                    <Text style={styles.exerciseName}>{currentExercise.name || 'Exercise'}</Text>

                    {/* Set Table */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.tableCellLabel]}>Set</Text>
                        <Text style={[styles.tableCell, styles.tableCellLabel]}>kg / lbs</Text>
                        <Text style={[styles.tableCell, styles.tableCellLabel]}>Reps</Text>
                        <Text style={[styles.tableCell, styles.tableCellLabel]}>✓</Text>
                    </View>

                    {currentExercise.sets.map((set, idx) => (
                        <View key={set.id} style={[styles.tableRow, set.completed && styles.tableRowDone]}>
                            <View style={styles.setBadge}>
                                <Text style={styles.setBadgeText}>{idx + 1}</Text>
                            </View>
                            <TextInput
                                style={[styles.input, set.completed && styles.inputDisabled]}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                value={set.weight > 0 ? String(set.weight) : ''}
                                onChangeText={(v) =>
                                    updateSet(session.id, currentExercise.id, set.id, { weight: Number(v) || 0 })
                                }
                                editable={!set.completed}
                            />
                            <TextInput
                                style={[styles.input, set.completed && styles.inputDisabled]}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                value={set.reps > 0 ? String(set.reps) : ''}
                                onChangeText={(v) =>
                                    updateSet(session.id, currentExercise.id, set.id, { reps: Number(v) || 0 })
                                }
                                editable={!set.completed}
                            />
                            <TouchableOpacity
                                style={[styles.checkBtn, set.completed && styles.checkBtnDone]}
                                onPress={() => {
                                    updateSet(session.id, currentExercise.id, set.id, { completed: !set.completed });
                                    if (!set.completed) startRest();
                                }}
                            >
                                <Ionicons
                                    name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={26}
                                    color={set.completed ? COLORS.success : COLORS.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Rest Button */}
                    <TouchableOpacity style={styles.restBtn} onPress={startRest}>
                        <Ionicons name="hourglass-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.restBtnText}>Start 60s Rest</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Navigation Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.navBtn, styles.navBtnSecondary, currentIndex === 0 && { opacity: 0.3 }]}
                    onPress={() => currentIndex > 0 && setCurrentIndex(i => i - 1)}
                    disabled={currentIndex === 0}
                >
                    <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                    <Text style={styles.navBtnText}>Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={handleNext}>
                    <Text style={[styles.navBtnText, { color: '#000' }]}>{isLast ? '🎉 Finish' : 'Next'}</Text>
                    {!isLast && <Ionicons name="arrow-forward" size={20} color="#000" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    exitBtn: { padding: 6 },
    pauseBtn: { padding: 6 },
    stopwatchContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stopwatch: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: 2 },
    progressRow: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: SIZES.md,
        paddingVertical: 10,
    },
    progressSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.surface,
    },
    progressDone: { backgroundColor: COLORS.success },
    progressActive: { backgroundColor: COLORS.primary },
    counter: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13, marginBottom: 4 },
    scroll: { padding: SIZES.md, paddingBottom: 120 },
    exerciseName: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 20,
        textAlign: 'center',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingHorizontal: 4,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
        marginBottom: 4,
    },
    tableCell: { flex: 1, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 },
    tableCellLabel: { fontWeight: '600' },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    tableRowDone: { backgroundColor: `${COLORS.success}15` },
    setBadge: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
    },
    setBadgeText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
    input: {
        flex: 1,
        textAlign: 'center',
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
        marginHorizontal: 4,
        paddingVertical: 4,
    },
    inputDisabled: { color: COLORS.textMuted },
    checkBtn: { flex: 1, alignItems: 'center' },
    checkBtnDone: {},
    restBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    restBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
    restOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
    },
    restCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: `${COLORS.primary}20`,
        borderWidth: 3,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    restLabel: { color: COLORS.primary, fontWeight: '800', fontSize: 18, letterSpacing: 3 },
    restTime: { color: COLORS.text, fontWeight: '800', fontSize: 48 },
    skipBtn: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 24,
        backgroundColor: COLORS.surface,
    },
    skipBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: SIZES.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.surface,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
    },
    navBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
    },
    navBtnPrimary: { backgroundColor: COLORS.primary },
    navBtnSecondary: { backgroundColor: COLORS.surface },
    navBtnText: { fontWeight: '700', fontSize: 16, color: COLORS.text },
    emptyText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 16 },
    backBtn: { alignSelf: 'center', marginTop: 16, padding: 12 },
    backBtnText: { color: COLORS.primary, fontWeight: '600' },
});
