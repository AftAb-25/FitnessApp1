import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { API_URL, FoodLog, MealType, useStore } from '../store/useStore';

export default function AddFoodModal() {
    const router = useRouter();
    const { date, meal } = useLocalSearchParams();
    const { addFood, authToken } = useStore();

    const [search, setSearch] = useState('');
    const [foods, setFoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        searchFoods();
    }, []);

    const searchFoods = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/external/nutrition?query=${search}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            setFoods(data.results || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFood = (food: Omit<FoodLog, 'id' | 'meal'>) => {
        if (date && meal) {
            addFood(date as string, {
                ...food,
                id: Math.random().toString(36).substr(2, 9),
                meal: meal as MealType,
            });
            router.back();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleSelectFood(item)}>
            <View style={styles.cardHeader}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.calories}>{item.calories} kcal</Text>
            </View>
            <Text style={styles.macros}>
                Protein: {item.protein}g  |  Carbs: {item.carbs}g  |  Fat: {item.fat}g
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Add to {meal}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search foods..."
                    placeholderTextColor={COLORS.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={searchFoods}
                    returnKeyType="search"
                    autoFocus={true}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={foods}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyText}>Type a food and press enter to search.</Text>
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
        textTransform: 'capitalize',
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
    listContent: {
        padding: SIZES.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        ...SHADOWS.small,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    foodName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    calories: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    macros: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        marginTop: SIZES.xl,
    },
});
