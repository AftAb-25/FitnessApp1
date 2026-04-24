import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// ─── Confetti Particle ───────────────────────────────────────────────────────
const COLORS_CONFETTI = ['#38BDF8', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#FB923C', '#FCD34D'];
const PARTICLE_COUNT = 60;

function ConfettiParticle({ delay }: { delay: number }) {
    const x = useRef(new Animated.Value(Math.random() * width)).current;
    const y = useRef(new Animated.Value(-20)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const color = COLORS_CONFETTI[Math.floor(Math.random() * COLORS_CONFETTI.length)];
    const size = Math.random() * 8 + 5;
    const isSquare = Math.random() > 0.5;

    useEffect(() => {
        const duration = 2000 + Math.random() * 2000;
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(y, { toValue: height + 40, duration, useNativeDriver: true }),
                Animated.timing(rotate, { toValue: Math.random() > 0.5 ? 5 : -5, duration, useNativeDriver: true }),
                Animated.sequence([
                    Animated.delay(duration * 0.6),
                    Animated.timing(opacity, { toValue: 0, duration: duration * 0.4, useNativeDriver: true }),
                ]),
            ]).start();
        }, delay);
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: Math.random() * width,
                width: size,
                height: isSquare ? size : size * 2.5,
                borderRadius: isSquare ? 2 : size / 2,
                backgroundColor: color,
                transform: [
                    { translateY: y },
                    { rotate: rotate.interpolate({ inputRange: [-5, 5], outputRange: ['-720deg', '720deg'] }) },
                ],
                opacity,
            }}
        />
    );
}

// ─── Pulsing Ring ─────────────────────────────────────────────────────────────
function PulseRing({ delay, color }: { delay: number; color: string }) {
    const scale = useRef(new Animated.Value(0.3)).current;
    const opacity = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.parallel([
                Animated.timing(scale, { toValue: 2.5, duration: 2000, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        );
        setTimeout(() => anim.start(), delay);
        return () => anim.stop();
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: 160,
                height: 160,
                borderRadius: 80,
                borderWidth: 2,
                borderColor: color,
                transform: [{ scale }],
                opacity,
            }}
        />
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WorkoutSummaryScreen() {
    const router = useRouter();
    const { elapsed, xp, totalSets, completedSets, caloriesBurned } = useLocalSearchParams<{
        elapsed: string; xp: string; totalSets: string; completedSets: string; caloriesBurned: string;
    }>();

    const elapsedNum = Number(elapsed) || 0;
    const xpNum = Number(xp) || 0;
    const totalSetsNum = Number(totalSets) || 0;
    const completedSetsNum = Number(completedSets) || 0;
    const caloriesBurnedNum = Number(caloriesBurned) || 0;

    // Animations
    const cardScale = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const trophyBounce = useRef(new Animated.Value(0)).current;
    const titleSlide = useRef(new Animated.Value(40)).current;
    const statsSlide = useRef(new Animated.Value(60)).current;
    const bgGlow = useRef(new Animated.Value(0)).current;
    const [xpDisplay, setXpDisplay] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    useEffect(() => {
        setShowConfetti(true);

        // Background glow pulse loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(bgGlow, { toValue: 1, duration: 2000, useNativeDriver: false }),
                Animated.timing(bgGlow, { toValue: 0, duration: 2000, useNativeDriver: false }),
            ])
        ).start();

        // Staggered entrance
        Animated.sequence([
            Animated.delay(300),
            Animated.parallel([
                Animated.spring(cardScale, { toValue: 1, bounciness: 16, useNativeDriver: true }),
                Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]),
            Animated.spring(trophyBounce, { toValue: -20, bounciness: 20, useNativeDriver: true }),
            Animated.parallel([
                Animated.timing(titleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(statsSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
        ]).start();

        // XP counter animation
        let current = 0;
        const step = Math.ceil(xpNum / 40);
        const timer = setInterval(() => {
            current = Math.min(current + step, xpNum);
            setXpDisplay(current);
            if (current >= xpNum) clearInterval(timer);
        }, 35);
        return () => clearInterval(timer);
    }, []);

    const glowColor = bgGlow.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(56,189,248,0.06)', 'rgba(56,189,248,0.18)'],
    });

    return (
        <View style={styles.root}>
            {/* Animated background glow */}
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: glowColor }]} />

            {/* Pulsing rings behind trophy */}
            <View style={styles.ringsContainer}>
                <PulseRing delay={0} color={COLORS.primary} />
                <PulseRing delay={700} color={COLORS.success} />
                <PulseRing delay={1400} color="#A78BFA" />
            </View>

            {/* Confetti */}
            {showConfetti && Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <ConfettiParticle key={i} delay={i * 40} />
            ))}

            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    style={[
                        styles.card,
                        { opacity: cardOpacity, transform: [{ scale: cardScale }] },
                    ]}
                >
                    {/* Trophy */}
                    <Animated.Text style={[styles.trophy, { transform: [{ translateY: trophyBounce }] }]}>
                        🏆
                    </Animated.Text>

                    {/* Title */}
                    <Animated.View style={{ transform: [{ translateY: titleSlide }], alignItems: 'center', gap: 4 }}>
                        <Text style={styles.congrats}>Workout Complete!</Text>
                        <Text style={styles.sub}>Incredible work. Here's your summary.</Text>
                    </Animated.View>

                    {/* Stats */}
                    <Animated.View style={[styles.statsGrid, { transform: [{ translateY: statsSlide }] }]}>
                        <View style={styles.statBox}>
                            <Ionicons name="time-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.statValue}>{formatTime(elapsedNum)}</Text>
                            <Text style={styles.statLabel}>Total Time</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Ionicons name="barbell-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.statValue}>{completedSetsNum}/{totalSetsNum}</Text>
                            <Text style={styles.statLabel}>Sets Done</Text>
                        </View>
                        <View style={[styles.statBox, { borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)' }]}>
                            <Text style={{ fontSize: 22 }}>🔥</Text>
                            <Text style={[styles.statValue, { color: '#f97316' }]}>{caloriesBurnedNum}</Text>
                            <Text style={styles.statLabel}>kcal Burned</Text>
                        </View>
                        <View style={[styles.statBox, styles.statBoxXP]}>
                            <Text style={styles.xpFlash}>⚡</Text>
                            <Text style={[styles.statValue, styles.xpValue]}>{xpDisplay} XP</Text>
                            <Text style={styles.statLabel}>XP Earned</Text>
                        </View>
                    </Animated.View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={styles.doneBtn}
                        onPress={() => router.replace('/(tabs)/workouts' as any)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.doneBtnText}>Finish</Text>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#080F1E' },
    safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.md },
    ringsContainer: {
        position: 'absolute',
        top: height * 0.22,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(30,41,59,0.95)',
        borderRadius: 28,
        padding: 28,
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.2)',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 20,
    },
    trophy: { fontSize: 80, marginBottom: 4 },
    congrats: { fontSize: 26, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
    sub: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
    statsGrid: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.8)',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.1)',
    },
    statBoxXP: {
        borderColor: 'rgba(251,191,36,0.3)',
        backgroundColor: 'rgba(251,191,36,0.08)',
    },
    statValue: { fontSize: 15, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
    xpValue: { color: '#FFD700', fontSize: 16 },
    xpFlash: { fontSize: 22 },
    statLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center' },
    doneBtn: {
        marginTop: 8,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    doneBtnText: { fontWeight: '800', fontSize: 16, color: '#000' },
});
