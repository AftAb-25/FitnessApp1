import { format, subDays } from 'date-fns';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { useStore } from '../../store/useStore';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
    const workouts = useStore((state) => state.workouts);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 30000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    // Prepare chart data: Last 7 Days Calorie burn & Duration
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    const labels = last7Days.map(d => format(d, 'EE')); // Mon, Tue, etc.

    const chartDataCalories = last7Days.map(d => {
        const dStr = format(d, 'yyyy-MM-dd');
        return workouts
            .filter(w => w.date === dStr && w.isFinished)
            .reduce((acc, w) => acc + (w.caloriesBurned || 0), 0);
    });
    const chartDataDuration = last7Days.map(d => {
        const dStr = format(d, 'yyyy-MM-dd');
        const daySeconds = workouts
            .filter(w => w.date === dStr && w.isFinished)
            .reduce((acc, w) => acc + (w.duration || ((w.exercises?.length || 0) * 300)), 0);
        return daySeconds > 0 ? Math.max(1, Math.ceil(daySeconds / 60)) : 0; // Convert to mins, minimum 1 if any seconds logged
    });

    const hasCalories = chartDataCalories.some(val => val > 0);
    const hasDuration = chartDataDuration.some(val => val > 0);

    const completedWorkouts = workouts.filter(w => w.isFinished);
    const totalExercises = completedWorkouts.reduce((acc, w) => acc + (w.exercises?.length || 0), 0);

    // Sum exact seconds
    const totalSeconds = completedWorkouts.reduce((acc, w) => acc + (w.duration || ((w.exercises?.length || 0) * 300)), 0);
    const totalDurationMins = Math.floor(totalSeconds / 60);

    // Format duration string intelligently (hours, mins, or just seconds if testing)
    const totalTimeStr = totalSeconds < 60
        ? `${totalSeconds}s`
        : totalDurationMins >= 60
            ? `${Math.floor(totalDurationMins / 60)}h ${totalDurationMins % 60}m`
            : `${totalDurationMins}m`;


    const DataNode = ({ delay, startX, startY }: { delay: number, startX: number, startY: number }) => {
        const moveAnim = useRef(new Animated.Value(0)).current;
        useEffect(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(moveAnim, { toValue: 1, duration: 5000 + Math.random() * 5000, useNativeDriver: true }),
                    Animated.timing(moveAnim, { toValue: 0, duration: 5000 + Math.random() * 5000, useNativeDriver: true })
                ])
            ).start();
        }, []);

        return (
            <Animated.View style={[styles.dataNode, {
                left: startX,
                top: startY,
                transform: [
                    { translateX: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) },
                    { translateY: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) },
                ],
                opacity: moveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] })
            }]} />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* DATA NODES & GEOMETRIC RINGS BACKGROUND */}
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <DataNode key={i} delay={i * 1000} startX={(width / 4) * (i % 4) + 20} startY={(height / 4) * Math.floor(i / 2)} />
                ))}

                <Animated.View style={[styles.geoRing, {
                    width: width * 1.5,
                    height: width * 1.5,
                    borderRadius: width * 0.2, // Large rounded hex/square look
                    top: height * 0.1,
                    left: -width * 0.25,
                    transform: [{
                        rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                        })
                    }]
                }]} />

                <Animated.View style={[styles.geoRing, {
                    width: width * 1.2,
                    height: width * 1.2,
                    borderRadius: width * 0.3,
                    bottom: -width * 0.3,
                    right: -width * 0.3,
                    borderColor: COLORS.primary + '10',
                    transform: [{
                        rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['360deg', '0deg']
                        })
                    }]
                }]} />
            </View>
            <View style={styles.header}>
                <Text style={styles.title}>Progress & Analytics</Text>
                <Text style={styles.subtitle}>Review your long term performance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Generic Stats Block */}
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Workouts</Text>
                        <Text style={styles.statValue}>{completedWorkouts.length}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Exercises</Text>
                        <Text style={styles.statValue}>{totalExercises}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Time</Text>
                        <Text style={styles.statValue}>{totalTimeStr}</Text>
                    </View>
                </View>

                {/* CALORIES BURNED CHART */}
                <View style={[styles.card, { marginTop: 10 }]}>
                    <Text style={styles.cardTitle}>Calories Burned</Text>
                    <Text style={styles.cardSubtitle}>Last 7 Days (kcal)</Text>
                    <BarChart
                        data={{
                            labels: labels,
                            datasets: [{ data: hasCalories ? chartDataCalories : [0, 0, 0, 0, 0, 0, 0] }]
                        }}
                        width={screenWidth - SIZES.lg * 2 + 10}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        fromZero
                        showValuesOnTopOfBars
                        chartConfig={{
                            backgroundColor: COLORS.surface,
                            backgroundGradientFrom: COLORS.surface,
                            backgroundGradientTo: COLORS.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                            labelColor: (opacity = 1) => COLORS.textMuted,
                            style: { borderRadius: 8 },
                            barPercentage: Math.min(1, Math.max(0.2, screenWidth / 600)),
                        }}
                        style={styles.chartStyle}
                    />
                </View>

                {/* DURATION CHART */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Workout Duration</Text>
                    <Text style={styles.cardSubtitle}>Last 7 Days (minutes per day)</Text>
                    <LineChart
                        data={{
                            labels: labels,
                            datasets: [{ data: hasDuration ? chartDataDuration : [0, 0, 0, 0, 0, 0, 0] }]
                        }}
                        width={screenWidth - SIZES.lg * 2 + 10}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix="m"
                        fromZero
                        bezier
                        chartConfig={{
                            backgroundColor: COLORS.surface,
                            backgroundGradientFrom: COLORS.surface,
                            backgroundGradientTo: COLORS.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`, // primary blue
                            labelColor: (opacity = 1) => COLORS.textMuted,
                            style: { borderRadius: 8 },
                            propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.primary }
                        }}
                        style={styles.chartStyle}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SIZES.lg,
        backgroundColor: COLORS.surface,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.primary,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    scroll: {
        padding: SIZES.lg,
        paddingBottom: 100, // accommodate bottom tab
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        marginBottom: SIZES.xl,
        ...SHADOWS.medium,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: SIZES.lg,
        marginTop: 2,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 8,
        marginLeft: -20, // offset axis spacing inside the component library
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SIZES.md,
        marginBottom: SIZES.xl,
    },
    statBox: {
        flex: 1,
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    geoRing: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        zIndex: -1,
    },
    dataNode: {
        position: 'absolute',
        width: 6,
        height: 6,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
        zIndex: -1,
    },
});
