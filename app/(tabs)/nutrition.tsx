import { Ionicons } from '@expo/vector-icons';
import { addDays, format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { useStore } from '../../store/useStore';

// Standalone Orbital Ring component for technical vibe
const OrbitalRing = ({ size, duration, reverse = false, nodeCount = 3 }: { size: number, duration: number, reverse?: boolean, nodeCount?: number }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg']
    });

    return (
        <Animated.View style={[styles.orbitalRing, {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ rotate: rotation }]
        }]}>
            {[...Array(nodeCount)].map((_, i) => (
                <View key={i} style={[styles.orbitalNode, {
                    top: -4,
                    left: size / 2 - 4,
                    transform: [{ rotate: `${(360 / nodeCount) * i}deg` }, { translateY: -size / 2 }]
                }]} />
            ))}
        </Animated.View>
    );
};

export default function NutritionDashboard() {
    const router = useRouter();
    const { user, nutritionDays, updateWater } = useStore();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [bgAnim] = useState(new Animated.Value(1)); // Background scale animation
    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        // Slow breathing animation for the background
        Animated.loop(
            Animated.sequence([
                Animated.timing(bgAnim, { toValue: 1.1, duration: 4000, useNativeDriver: true }),
                Animated.timing(bgAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const currentDay = nutritionDays.find((d) => d.date === selectedDate) || {
        date: selectedDate,
        waterGlasses: 0,
        foods: [],
    };

    const calorieTarget = user?.goal === 'weight_loss' ? 2000 : user?.goal === 'muscle_gain' ? 3000 : 2500;

    const consumedCalories = currentDay.foods.reduce((acc, f) => acc + f.calories, 0);
    const consumedProtein = currentDay.foods.reduce((acc, f) => acc + f.protein, 0);
    const consumedCarbs = currentDay.foods.reduce((acc, f) => acc + f.carbs, 0);
    const consumedFat = currentDay.foods.reduce((acc, f) => acc + f.fat, 0);

    const totalMacros = consumedProtein + consumedCarbs + consumedFat || 1;

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
                        const hasData = nutritionDays.some((nd) => nd.date === d.dateString && (nd.foods.length > 0 || nd.waterGlasses > 0));
                        return (
                            <TouchableOpacity
                                key={d.dateString}
                                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                                onPress={() => setSelectedDate(d.dateString)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{d.dayName}</Text>
                                <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{d.dayNum}</Text>
                                {hasData && <View style={[styles.dataDot, isSelected && styles.dataDotActive]} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    const renderMacnutrients = () => {
        return (
            <View style={styles.premiumMacroCard}>
                <View style={styles.macroHeaderRow}>
                    <View>
                        <Text style={styles.caloriesTitle}>Daily Calories</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={styles.caloriesLarge}>{consumedCalories}</Text>
                            <Text style={styles.caloriesTarget}> / {calorieTarget} kcal</Text>
                        </View>
                    </View>
                    <View style={styles.flameBadge}>
                        <Ionicons name="flame" size={24} color={COLORS.surface} />
                    </View>
                </View>

                {/* Thick Visual Progress Line */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min((consumedCalories / calorieTarget) * 100, 100)}%` }]} />
                </View>

                <View style={styles.macroBarsContainer}>
                    <View style={styles.macroCol}>
                        <View style={styles.macroLabelRow}>
                            <View style={[styles.macroDot, { backgroundColor: COLORS.primary }]} />
                            <Text style={styles.macroLabel}>Protein</Text>
                        </View>
                        <Text style={styles.macroVal}>{consumedProtein}g</Text>
                        <View style={styles.miniBarBg}>
                            <View style={[styles.miniBarFill, { backgroundColor: COLORS.primary, width: `${(consumedProtein / totalMacros) * 100}%` }]} />
                        </View>
                    </View>

                    <View style={styles.macroCol}>
                        <View style={styles.macroLabelRow}>
                            <View style={[styles.macroDot, { backgroundColor: COLORS.secondary }]} />
                            <Text style={styles.macroLabel}>Carbs</Text>
                        </View>
                        <Text style={styles.macroVal}>{consumedCarbs}g</Text>
                        <View style={styles.miniBarBg}>
                            <View style={[styles.miniBarFill, { backgroundColor: COLORS.secondary, width: `${(consumedCarbs / totalMacros) * 100}%` }]} />
                        </View>
                    </View>

                    <View style={styles.macroCol}>
                        <View style={styles.macroLabelRow}>
                            <View style={[styles.macroDot, { backgroundColor: COLORS.warning }]} />
                            <Text style={styles.macroLabel}>Fat</Text>
                        </View>
                        <Text style={styles.macroVal}>{consumedFat}g</Text>
                        <View style={styles.miniBarBg}>
                            <View style={[styles.miniBarFill, { backgroundColor: COLORS.warning, width: `${(consumedFat / totalMacros) * 100}%` }]} />
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const getMealImage = (mealType: string) => {
        switch (mealType) {
            case 'breakfast': return require('../../assets/images/nutrition/breakfast.png');
            case 'lunch': return require('../../assets/images/nutrition/lunch.png');
            case 'snacks': return require('../../assets/images/nutrition/snacks.png');
            case 'dinner': return require('../../assets/images/nutrition/dinner.png');
            default: return require('../../assets/images/nutrition/breakfast.png');
        }
    };

    const renderMealGrid = () => {
        const meals = [
            { title: 'Breakfast', type: 'breakfast', icon: 'sunny' },
            { title: 'Lunch', type: 'lunch', icon: 'fast-food' },
            { title: 'Snacks', type: 'snacks', icon: 'cafe' },
            { title: 'Dinner', type: 'dinner', icon: 'moon' },
        ];

        return (
            <View style={styles.gridContainer}>
                {meals.map((meal) => {
                    const mealFoods = currentDay.foods.filter((f) => f.meal === meal.type);
                    const mealCalories = mealFoods.reduce((acc, f) => acc + f.calories, 0);

                    return (
                        <TouchableOpacity
                            key={meal.type}
                            style={styles.gridMealCard}
                            onPress={() => router.push(`/add-food?date=${selectedDate}&meal=${meal.type}`)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.gridMealTop}>
                                <Image source={getMealImage(meal.type)} style={styles.gridMealImage} />
                            </View>
                            <View style={styles.gridMealBottom}>
                                <View style={styles.gridMealHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name={meal.icon as any} size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                                        <Text style={styles.gridMealTitle}>{meal.title}</Text>
                                    </View>
                                    <Text style={styles.gridMealCals}>
                                        {mealCalories} <Text style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: '500' }}>kcal</Text>
                                    </Text>
                                </View>

                                <View style={styles.gridMealContent}>
                                    {mealFoods.length > 0 ? (
                                        <Text style={styles.gridMealFoodsList} numberOfLines={2}>
                                            {mealFoods.map(f => f.name).join(', ')}
                                        </Text>
                                    ) : (
                                        <Text style={styles.gridMealEmpty}>No foods logged yet.</Text>
                                    )}

                                    <View style={styles.gridMealAddBtn}>
                                        <Ionicons name="add" size={14} color={COLORS.primary} />
                                        <Text style={styles.gridMealAddText}>Track further</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* CYBERNETIC ORBITALS BACKGROUND (NUTRITION SYNC) */}
            <View style={[StyleSheet.absoluteFill, styles.orbitalContainer]} pointerEvents="none">
                <Animated.View style={{ transform: [{ scale: bgAnim }], alignItems: 'center', justifyContent: 'center' }}>
                    <OrbitalRing size={width * 1.5} duration={30000} nodeCount={4} />
                    <OrbitalRing size={width * 1.1} duration={20000} reverse nodeCount={3} />
                    <OrbitalRing size={width * 0.7} duration={15000} nodeCount={5} />
                    <View style={styles.orbitalCore} />
                </Animated.View>
            </View>
            {renderDateRibbon()}
            <ScrollView contentContainerStyle={styles.scroll} style={{ backgroundColor: 'transparent' }}>

                {renderMacnutrients()}

                <TouchableOpacity
                    style={styles.premiumMealPlanBanner}
                    onPress={() => router.push('/meal-plan')}
                    activeOpacity={0.9}
                >
                    <View style={styles.mealPlanBannerContent}>
                        <Ionicons name="restaurant" size={28} color={COLORS.background} />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={styles.mealPlanBannerTitle}>Goal-Based Meal Plan</Text>
                            <Text style={styles.mealPlanBannerSub}>Tap to view suggestions & groceries</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.background} />
                    </View>
                </TouchableOpacity>

                <View style={styles.premiumWaterTracker}>
                    <View style={styles.waterHeader}>
                        <Ionicons name="water" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.waterTitle}>Water Tracker</Text>
                    </View>
                    <View style={styles.waterControls}>
                        <TouchableOpacity onPress={() => updateWater(selectedDate, -1)} style={styles.waterActionBtn}>
                            <Ionicons name="remove" size={24} color={COLORS.background} />
                        </TouchableOpacity>

                        <View style={styles.waterDisplayProgress}>
                            <Text style={styles.waterCount}>{currentDay.waterGlasses}
                                <Text style={styles.waterTarget}> / 8 glasses</Text>
                            </Text>
                            <View style={styles.waterBarBg}>
                                <View style={[styles.waterBarFill, { width: `${Math.min((currentDay.waterGlasses / 8) * 100, 100)}%` }]} />
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => updateWater(selectedDate, 1)} style={styles.waterActionBtn}>
                            <Ionicons name="add" size={24} color={COLORS.background} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2x2 Meal Grid */}
                {renderMealGrid()}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    dateRibbon: {
        paddingVertical: SIZES.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
        ...SHADOWS.small,
        zIndex: 10,
    },
    dateScroll: {
        paddingHorizontal: SIZES.md,
    },
    dateCard: {
        width: 62,
        height: 75,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    dateCardActive: {
        backgroundColor: COLORS.primaryDark,
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
    dataDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.success,
        marginTop: 6,
    },
    dataDotActive: {
        backgroundColor: COLORS.background,
    },
    scroll: {
        padding: SIZES.lg,
        paddingBottom: 100,
    },
    premiumMacroCard: {
        backgroundColor: COLORS.surface,
        padding: SIZES.xl,
        borderRadius: SIZES.xl,
        marginBottom: SIZES.xl,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        ...SHADOWS.medium,
    },
    macroHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    caloriesTitle: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    caloriesLarge: {
        color: COLORS.text,
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: -1,
    },
    caloriesTarget: {
        color: COLORS.textMuted,
        fontSize: 18,
        fontWeight: '600',
    },
    flameBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 6,
        marginBottom: SIZES.xl,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: 12,
        backgroundColor: COLORS.primary,
        borderRadius: 6,
    },
    macroBarsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroCol: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: COLORS.background,
        padding: SIZES.sm,
        borderRadius: SIZES.md,
    },
    macroLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    macroDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    macroLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '700',
    },
    macroVal: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 6,
    },
    miniBarBg: {
        height: 6,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    miniBarFill: {
        height: 6,
        borderRadius: 3,
    },
    premiumMealPlanBanner: {
        backgroundColor: COLORS.text,
        borderRadius: SIZES.xl,
        padding: SIZES.xl,
        marginBottom: SIZES.xl,
        ...SHADOWS.large,
    },
    mealPlanBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealPlanBannerTitle: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 4,
    },
    mealPlanBannerSub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: '500',
    },
    premiumWaterTracker: {
        backgroundColor: COLORS.surface,
        padding: SIZES.xl,
        borderRadius: SIZES.xl,
        marginBottom: SIZES.xl,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        ...SHADOWS.medium,
    },
    waterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    waterTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '900',
    },
    waterControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    waterActionBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    waterDisplayProgress: {
        flex: 1,
        marginHorizontal: SIZES.xl,
        alignItems: 'center',
    },
    waterCount: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
    },
    waterBtnText: {
        color: COLORS.background,
        fontWeight: '900',
        fontSize: 16,
    },
    waterTarget: {
        color: COLORS.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    waterBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    waterBarFill: {
        height: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },

    // 2x2 Grid Styles
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
    },
    gridMealCard: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.lg,
        marginBottom: SIZES.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        ...SHADOWS.small,
    },
    gridMealTop: {
        height: 100, // Top half is image
        width: '100%',
    },
    gridMealImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gridMealBottom: {
        padding: SIZES.sm,
        flex: 1,
        justifyContent: 'space-between',
    },
    gridMealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    gridMealTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '900',
    },
    gridMealCals: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    gridMealContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    gridMealFoodsList: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginBottom: 8,
        lineHeight: 16,
    },
    gridMealEmpty: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    gridMealAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        paddingVertical: 6,
        borderRadius: SIZES.sm,
    },
    gridMealAddText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '800',
    },
    orbitalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    orbitalRing: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: COLORS.primary + '25',
    },
    orbitalNode: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
    orbitalCore: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        opacity: 0.3,
    },
});
