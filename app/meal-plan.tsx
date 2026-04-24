import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useStore } from '../store/useStore';

export default function MealPlanModal() {
    const router = useRouter();
    const { user } = useStore();
    const goal = user?.goal || 'maintain';

    const PLAN_DATA = {
        weight_loss: {
            title: 'Weight Loss Plan',
            meals: [
                { name: 'Breakfast', foods: ['Oatmeal with Berries', 'Black Coffee'] },
                { name: 'Lunch', foods: ['Grilled Chicken Salad', 'Vinaigrette Dressing'] },
                { name: 'Dinner', foods: ['Baked Salmon', 'Steamed Broccoli'] },
                { name: 'Snacks', foods: ['Apple', 'Almonds (small handful)'] },
            ],
            groceries: ['Oats', 'Berries', 'Chicken Breast', 'Mixed Greens', 'Salmon', 'Broccoli', 'Apples', 'Almonds'],
        },
        muscle_gain: {
            title: 'Muscle Gain Plan',
            meals: [
                { name: 'Breakfast', foods: ['4 Eggs Scrambled', 'Whole Wheat Toast', 'Milk'] },
                { name: 'Lunch', foods: ['Chicken Breast', 'Jasmine Rice', 'Avocado'] },
                { name: 'Dinner', foods: ['Steak', 'Sweet Potato', 'Asparagus'] },
                { name: 'Snacks', foods: ['Protein Shake', 'Greek Yogurt', 'Banana'] },
            ],
            groceries: ['Eggs', 'Bread', 'Milk', 'Chicken Breast', 'Rice', 'Avocado', 'Beef Steak', 'Sweet Potatoes', 'Asparagus', 'Whey Protein', 'Greek Yogurt', 'Bananas'],
        },
        maintain: {
            title: 'Maintenance Plan',
            meals: [
                { name: 'Breakfast', foods: ['Greek Yogurt', 'Granola', 'Honey'] },
                { name: 'Lunch', foods: ['Turkey Wrap', 'Side Salad'] },
                { name: 'Dinner', foods: ['Chicken Stir-fry', 'Brown Rice'] },
                { name: 'Snacks', foods: ['Mixed Nuts', 'Protein Bar'] },
            ],
            groceries: ['Greek Yogurt', 'Granola', 'Turkey Deli', 'Wraps', 'Chicken Breast', 'Mixed Veggies', 'Brown Rice', 'Mixed Nuts', 'Protein Bars'],
        },
    };

    const plan = PLAN_DATA[goal];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{plan.title}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suggested Meals</Text>
                    {plan.meals.map((meal, idx) => (
                        <View key={idx} style={styles.card}>
                            <Text style={styles.mealName}>{meal.name}</Text>
                            {meal.foods.map((food, i) => (
                                <Text key={i} style={styles.foodItem}>• {food}</Text>
                            ))}
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>Grocery List</Text>
                    <View style={styles.groceryCard}>
                        {plan.groceries.map((item, idx) => (
                            <View key={idx} style={styles.groceryRow}>
                                <Ionicons name="cart-outline" size={20} color={COLORS.textMuted} />
                                <Text style={styles.groceryItem}>{item}</Text>
                            </View>
                        ))}
                    </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.lg,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.text,
    },
    closeBtn: {
        padding: 8,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 20,
    },
    scroll: {
        padding: SIZES.lg,
        paddingBottom: 40,
    },
    section: {
        marginBottom: SIZES.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SIZES.md,
        borderRadius: SIZES.md,
        marginBottom: SIZES.sm,
        ...SHADOWS.small,
    },
    mealName: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    foodItem: {
        color: COLORS.text,
        fontSize: 14,
        marginBottom: 4,
        marginLeft: 8,
    },
    groceryCard: {
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        ...SHADOWS.small,
    },
    groceryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    groceryItem: {
        color: COLORS.text,
        fontSize: 16,
        marginLeft: 12,
    },
});
