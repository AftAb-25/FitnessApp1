import { Ionicons } from '@expo/vector-icons';
import { addDays, format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { FitnessMode, useStore, WorkoutSession } from '../../store/useStore';

// Standalone Lightning Strike component
const LightningStrike = ({ width, height }: { width: number, height: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const [startX] = useState(Math.random() * width);

    useEffect(() => {
        const triggerStrike = () => {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 40, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 60, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.8, duration: 40, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start(() => {
                setTimeout(triggerStrike, 2000 + Math.random() * 5000);
            });
        };

        const timeout = setTimeout(triggerStrike, Math.random() * 3000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View style={[styles.lightningBolt, {
            left: startX,
            height: height,
            opacity: opacity,
        }]} />
    );
};

export default function WorkoutDashboard() {
    const router = useRouter();
    const { workouts, addWorkoutSession, updateSet, deleteSession } = useStore();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [bgAnim] = useState(new Animated.Value(1)); // Background scale animation
    const { width, height } = Dimensions.get('window');

    // UI state to allow dismissing finished sessions to view the "Ready to Train?" empty state
    const [hiddenSessions, setHiddenSessions] = useState<Record<string, boolean>>({});

    // Timer logic & Background animation
    useEffect(() => {
        // Lightning Background Flicker
        const triggerFlash = () => {
            Animated.sequence([
                Animated.timing(bgAnim, { toValue: 1.2, duration: 50, useNativeDriver: true }),
                Animated.timing(bgAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start(() => {
                setTimeout(triggerFlash, 3000 + Math.random() * 7000);
            });
        };
        triggerFlash();

        let interval: ReturnType<typeof setInterval>;
        if (showTimer && timerSeconds > 0) {
            interval = setInterval(() => {
                setTimerSeconds((prev) => prev - 1);
            }, 1000);
        } else if (timerSeconds === 0 && showTimer) {
            setShowTimer(false);
            Alert.alert("Time's up!", "Ready for your next set?");
        }
        return () => clearInterval(interval);
    }, [showTimer, timerSeconds]);

    const startTimer = (seconds: number = 60) => {
        setTimerSeconds(seconds);
        setShowTimer(true);
    };

    // Resolve active session for selected date (hiding finished sessions and manually dismissed ones)
    const currentSession = React.useMemo(() => {
        const selectedDateStr = format(new Date(selectedDate), 'yyyy-MM-dd');
        return workouts.findLast((w) => w.date === selectedDateStr && !w.isFinished && !hiddenSessions[w.id]);
    }, [workouts, selectedDate, hiddenSessions]);

    const handleCreateSession = (mode: FitnessMode) => {
        const newSession: WorkoutSession = {
            id: Math.random().toString(36).substring(2, 9),
            date: selectedDate,
            mode,
            exercises: [],
        };
        addWorkoutSession(newSession);
    };

    const handleToggleSet = (exerciseId: string, setId: string, completed: boolean) => {
        if (!currentSession) return;
        updateSet(currentSession.id, exerciseId, setId, { completed: !completed });
        if (!completed) {
            startTimer(); // Start 60s rest timer when a set is marked complete
        }
    };

    const renderDateRibbon = () => {
        const today = new Date();
        const dates = [-3, -2, -1, 0, 1, 2, 3].map((num) => {
            const d = addDays(today, num);
            return {
                dateString: format(d, 'yyyy-MM-dd'),
                dayName: format(d, 'EEE'),
                dayNum: format(d, 'd'),
            };
        });

        return (
            <View style={styles.dateRibbon}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                    {dates.map((d) => {
                        const isSelected = d.dateString === selectedDate;
                        const hasWorkout = workouts.some((w) => w.date === d.dateString);
                        return (
                            <TouchableOpacity
                                key={d.dateString}
                                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                onPress={() => setSelectedDate(d.dateString)}
                            >
                                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{d.dayName}</Text>
                                <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{d.dayNum}</Text>
                                {hasWorkout && <View style={[styles.workoutDot, isSelected && styles.workoutDotActive]} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    const getModeImage = (mode: string) => {
        switch (mode) {
            case 'Gym': return require('../../assets/images/workouts/gym.png');
            case 'Home': return require('../../assets/images/workouts/home.png');
            case 'Yoga': return require('../../assets/images/workouts/yoga.png');
            case 'Running/Cycling': return require('../../assets/images/workouts/running.png');
            default: return require('../../assets/images/workouts/gym.png');
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'Gym': return 'barbell-outline';
            case 'Home': return 'home-outline';
            case 'Yoga': return 'body-outline';
            case 'Running/Cycling': return 'bicycle-outline';
            default: return 'fitness-outline';
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.heroBanner}>
                <Ionicons name="flash" size={48} color={COLORS.primary} style={styles.heroIcon} />
                <Text style={styles.emptyTitle}>Ready to Train?</Text>
                <Text style={styles.emptyText}>Select a style to begin</Text>
            </View>

            <View style={styles.modeGrid}>
                {['Gym', 'Home', 'Yoga', 'Running/Cycling'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={styles.imageModeCard}
                        onPress={() => handleCreateSession(mode as FitnessMode)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.imageModeTop}>
                            <Image source={getModeImage(mode)} style={styles.modeImageBg} />
                        </View>
                        <View style={styles.imageModeBottom}>
                            <Ionicons name={getModeIcon(mode) as any} size={18} color={COLORS.primary} />
                            <Text style={styles.modeImageText}>{mode}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderSession = () => {
        if (!currentSession) return null;

        return (
            <View style={styles.sessionContainer}>
                <View style={styles.sessionHeaderRow}>
                    <View style={styles.sessionModePill}>
                        <Ionicons name={getModeIcon(currentSession.mode) as any} size={18} color={COLORS.background} />
                        <Text style={styles.sessionModeText}>{currentSession.mode} Session</Text>
                    </View>
                    <TouchableOpacity style={styles.trashBtn} onPress={() => deleteSession(currentSession.id)}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                </View>

                {(currentSession.exercises || []).map((ex, index) => {
                    return (
                        <View key={ex.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseHeader}>
                                <View style={styles.exerciseIndexBadge}>
                                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.exerciseTitle}>{ex.name || 'Custom Exercise'}</Text>
                            </View>

                            <View style={styles.tableHeader}>
                                <Text style={styles.tableColShort}>Set</Text>
                                <Text style={styles.tableCol}>kg</Text>
                                <Text style={styles.tableCol}>Reps</Text>
                                <Text style={styles.tableColShort}><Ionicons name="checkmark-done" size={16} color={COLORS.textMuted} /></Text>
                            </View>

                            {(ex.sets || []).map((set, idx) => (
                                <View key={set.id} style={[styles.tableRow, set.completed && styles.tableRowCompleted]}>
                                    <View style={styles.setNumberPill}>
                                        <Text style={styles.setText}>{idx + 1}</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.setRowInput, set.completed && styles.setRowInputDisabled]}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={set.weight.toString()}
                                        onChangeText={(val) => updateSet(currentSession.id, ex.id, set.id, { weight: Number(val) || 0 })}
                                        editable={!set.completed}
                                    />
                                    <TextInput
                                        style={[styles.setRowInput, set.completed && styles.setRowInputDisabled]}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={set.reps.toString()}
                                        onChangeText={(val) => updateSet(currentSession.id, ex.id, set.id, { reps: Number(val) || 0 })}
                                        editable={!set.completed}
                                    />
                                    <TouchableOpacity
                                        style={[styles.checkbox, set.completed && styles.checkboxActive]}
                                        onPress={() => handleToggleSet(ex.id, set.id, set.completed)}
                                    >
                                        {set.completed && <Ionicons name="checkmark" size={16} color={COLORS.background} />}
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addSetBtn}
                                onPress={() => {
                                    const newSets = [...ex.sets, { id: Math.random().toString(36).substr(2, 9), reps: 0, weight: 0, completed: false }];
                                    useStore.setState((state) => ({
                                        workouts: state.workouts.map((w) =>
                                            w.id === currentSession.id
                                                ? { ...w, exercises: w.exercises.map((e) => (e.id === ex.id ? { ...e, sets: newSets } : e)) }
                                                : w
                                        ),
                                    }));
                                }}
                            >
                                <Ionicons name="add" size={16} color={COLORS.primary} />
                                <Text style={styles.addSetText}>Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                <TouchableOpacity
                    style={styles.addExerciseBtn}
                    onPress={() => router.push(`/exercise-library?sessionId=${currentSession.id}`)}
                >
                    <Ionicons name="duplicate-outline" size={20} color={COLORS.background} style={{ marginRight: 8 }} />
                    <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
                </TouchableOpacity>

                {(currentSession.exercises || []).length > 0 && !currentSession.isFinished && (
                    <TouchableOpacity
                        style={[styles.addExerciseBtn, { backgroundColor: COLORS.success, marginTop: 20 }]}
                        onPress={() => router.push(`/active-workout?sessionId=${currentSession.id}`)}
                    >
                        <Ionicons name="play-circle" size={22} color={COLORS.background} style={{ marginRight: 8 }} />
                        <Text style={styles.addExerciseBtnText}>▶  Start Workout</Text>
                    </TouchableOpacity>
                )}

                {currentSession.isFinished && (
                    <View style={styles.finishedBadge}>
                        <Ionicons name="flame" size={20} color="#f97316" />
                        <Text style={styles.finishedBadgeText}>
                            {currentSession.caloriesBurned} kcal burned  ·  Great work! 🎉
                        </Text>
                    </View>
                )}

                {/* Dismiss back to Ready to Train */}
                <TouchableOpacity
                    style={[styles.addExerciseBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#f43f5e', marginTop: 20 }]}
                    onPress={() => {
                        // Just hide it locally so "Ready to Train" shows up
                        setHiddenSessions(prev => ({ ...prev, [currentSession.id]: true }));
                    }}
                >
                    <Ionicons name="checkmark-done" size={22} color="#f43f5e" style={{ marginRight: 8 }} />
                    <Text style={[styles.addExerciseBtnText, { color: '#f43f5e' }]}>Finish</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* LIGHTNING STORM BACKGROUND (HIGH ENERGY) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[StyleSheet.absoluteFill, {
                    backgroundColor: '#fff',
                    opacity: bgAnim.interpolate({ inputRange: [1, 1.2], outputRange: [0, 0.15] })
                }]} />
                {[1, 2, 3].map((i) => (
                    <LightningStrike key={i} width={width} height={height} />
                ))}
            </View>
            {renderDateRibbon()}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                style={{ backgroundColor: 'transparent' }}
                showsVerticalScrollIndicator={false}
            >
                {!currentSession ? renderEmptyState() : renderSession()}
            </ScrollView>

            {/* Premium Pill Rest Timer Component */}
            {showTimer && (
                <View style={styles.premiumFloatingTimer}>
                    <View style={styles.timerLeft}>
                        <Ionicons name="timer-outline" size={24} color={COLORS.background} style={{ marginRight: 8 }} />
                        <Text style={styles.timerTitle}>Rest Time</Text>
                    </View>
                    <View style={styles.timerRight}>
                        <Text style={styles.timerText}>
                            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                        </Text>
                        <TouchableOpacity style={styles.skipBtn} onPress={() => setShowTimer(false)}>
                            <Ionicons name="play-skip-forward" size={16} color={COLORS.background} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    dateRibbon: {
        zIndex: 10,
        backgroundColor: 'transparent',
        paddingVertical: SIZES.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    dateScroll: {
        paddingHorizontal: SIZES.md,
    },
    dateCard: {
        width: 60,
        height: 75,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    dateCardActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOWS.medium,
    },
    dayName: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dayNameActive: {
        color: COLORS.background,
    },
    dayNum: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '900',
    },
    dayNumActive: {
        color: COLORS.background,
    },
    workoutDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.accent,
        marginTop: 6,
    },
    workoutDotActive: {
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.lg,
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 20,
        overflow: 'hidden',
        borderRadius: SIZES.xl,
        paddingBottom: SIZES.xl,
    },
    animatedBackground: {
        position: 'absolute',
        top: -100,
        left: -100,
        right: -100,
        bottom: -100,
        resizeMode: 'cover',
        opacity: 0.15,
    },
    animatedBackgroundOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    heroBanner: {
        alignItems: 'center',
        paddingVertical: SIZES.xl,
        width: '100%',
        marginBottom: SIZES.md,
    },
    heroIcon: {
        marginBottom: SIZES.sm,
    },
    emptyTitle: {
        color: COLORS.text,
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 4,
        letterSpacing: -1,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    modeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 8,
    },
    imageModeCard: {
        width: '48%',
        height: 180,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.xl,
        marginBottom: SIZES.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...SHADOWS.large,
    },
    imageModeTop: {
        flex: 1,
        width: '100%',
    },
    modeImageBg: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageModeBottom: {
        height: 48,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceLight,
    },
    modeImageText: {
        color: COLORS.text,
        fontWeight: '800',
        fontSize: 13,
        marginLeft: 6,
    },
    sessionContainer: {
        flex: 1,
    },
    sessionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    sessionModePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.text,
        paddingHorizontal: SIZES.lg,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sessionModeText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '800',
        marginLeft: 8,
    },
    trashBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 10,
        borderRadius: 20,
    },
    exerciseCard: {
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.xl,
        marginBottom: SIZES.xl,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        ...SHADOWS.medium,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
        paddingBottom: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    exerciseIndexBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    exerciseIndexText: {
        color: COLORS.surface,
        fontWeight: '900',
        fontSize: 12,
    },
    exerciseTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '900',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableCol: {
        flex: 1,
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    tableColShort: {
        width: 40,
        flex: 0,
        color: COLORS.textMuted,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: SIZES.md,
        marginBottom: 4,
    },
    tableRowCompleted: {
        backgroundColor: 'rgba(52, 211, 153, 0.08)', // Soft success tint
    },
    setNumberPill: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setText: {
        color: COLORS.textMuted,
        fontWeight: '800',
        fontSize: 14,
    },
    setRowInput: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        color: COLORS.text,
        marginHorizontal: 6,
        minHeight: 40,
        borderRadius: SIZES.sm,
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
    },
    setRowInputDisabled: {
        backgroundColor: 'transparent',
        opacity: 0.7,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    checkboxActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    addSetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.md,
        paddingVertical: 12,
        borderRadius: SIZES.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
    },
    addSetText: {
        color: COLORS.primary,
        fontWeight: '800',
        marginLeft: 6,
        fontSize: 14,
    },
    addExerciseBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.text,
        padding: SIZES.lg,
        borderRadius: 100, // Pill shape
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.sm,
        ...SHADOWS.large,
    },
    addExerciseBtnText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '900',
    },
    premiumFloatingTimer: {
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: COLORS.primary, // Vibrant accent
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.large,
        elevation: 10,
    },
    timerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerTitle: {
        color: COLORS.background,
        fontWeight: '800',
        fontSize: 16,
    },
    timerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        color: COLORS.background,
        fontSize: 22,
        fontWeight: '900',
        marginRight: 16,
        fontVariant: ['tabular-nums'],
    },
    skipBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lightningBolt: {
        position: 'absolute',
        width: 2,
        backgroundColor: '#fff',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },
    finishedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        borderRadius: SIZES.md,
        padding: SIZES.md,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#f97316',
    },
    finishedBadgeText: {
        color: '#f97316',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.xl,
    },
    victoryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: COLORS.primary + '40',
    },
    victoryEmoji: {
        fontSize: 60,
        marginBottom: 12,
    },
    victoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    victoryCalories: {
        fontSize: 64,
        fontWeight: '900',
        color: COLORS.primary,
        lineHeight: 72,
    },
    victoryLabel: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginBottom: 16,
    },
    victoryMsg: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    victoryBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 50,
    },
    victoryBtnText: {
        color: COLORS.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
