import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { ActivityLevel, Goal, useStore } from '../../store/useStore';

// Standalone Star component for twinkling effect
const ProfileStar = ({ delay, startX, startY, size }: { delay: number, startX: number, startY: number, size: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.8,
                    duration: 2000 + Math.random() * 2000,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.2,
                    duration: 2000 + Math.random() * 2000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.star, {
            left: startX,
            top: startY,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: opacity,
            transform: [{ scale: opacity.interpolate({ inputRange: [0.2, 0.8], outputRange: [0.8, 1.2] }) }]
        }]} />
    );
};

export default function ProfileScreen() {
    const { user, setUser, clearUser } = useStore();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: user?.age || '',
        weight: user?.weight || '',
        height: user?.height || '',
        goal: user?.goal || 'weight_loss',
        activityLevel: user?.activityLevel || 'moderate',
    });

    const updateForm = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setUser({
            ...formData,
            goal: formData.goal as Goal,
            activityLevel: formData.activityLevel as ActivityLevel,
        });
        setEditing(false);
    };

    const renderField = (label: string, value: string, key: string, numeric = false) => {
        if (editing) {
            return (
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={(txt) => updateForm(key, txt)}
                        keyboardType={numeric ? 'numeric' : 'default'}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
            );
        }

        return (
            <View style={styles.readOnlyContainer}>
                <Text style={styles.readOnlyLabel}>{label}</Text>
                <Text style={styles.readOnlyValue}>{value || 'Not set'}</Text>
            </View>
        );
    };

    const renderBadges = () => {
        const badges = user?.achievements || [];
        // Available Badge Definitions
        const allBadges = [
            { id: 'first_workout', icon: 'barbell', name: 'First Lift', desc: '1st workout', color: '#38bdf8' },
            { id: '3_day_streak', icon: 'flame', name: '3-Day Fire', desc: '3-day streak', color: '#f97316' },
            { id: 'hydration_king', icon: 'water', name: 'Hydration', desc: 'Track 8 glasses', color: '#a855f7' },
            { id: 'iron_lung', icon: 'fitness', name: 'Cardio King', desc: '5 runs', color: '#10b981' },
            { id: 'early_bird', icon: 'sunny', name: 'Early Bird', desc: 'Before 8 AM', color: '#facc15' },
        ];

        return (
            <View style={[styles.card, { paddingRight: 0 }]}>
                <View style={[styles.cardHeader, { paddingRight: SIZES.lg }]}>
                    <Text style={styles.cardTitle}>Achievements</Text>
                    <Text style={styles.badgeCount}>{badges.length} Unlocked</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
                    {allBadges.map((badge) => {
                        const unlocked = badges.includes(badge.id);
                        return (
                            <View key={badge.id} style={[styles.premiumBadge, !unlocked && styles.badgeLocked]}>
                                <View style={[styles.premiumBadgeIconBg, unlocked ? { backgroundColor: badge.color } : {}]}>
                                    <Ionicons name={badge.icon as any} size={28} color={unlocked ? COLORS.background : COLORS.textMuted} />
                                </View>
                                <Text style={styles.premiumBadgeName}>{badge.name}</Text>
                                <Text style={styles.premiumBadgeDesc}>{badge.desc}</Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };


    const { width, height } = Dimensions.get('window');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* STARFIELD BACKGROUND */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {[...Array(40)].map((_, i) => (
                    <ProfileStar
                        key={i}
                        delay={i * 200}
                        startX={Math.random() * width}
                        startY={Math.random() * height}
                        size={Math.random() * 3 + 1}
                    />
                ))}
            </View>
            <ScrollView contentContainerStyle={styles.scroll} style={{ backgroundColor: 'transparent' }}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={40} color={COLORS.surfaceLight} />
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Ionicons name="camera" size={16} color={COLORS.background} />
                        </TouchableOpacity>
                        <View style={styles.levelBadgeMini}>
                            <Text style={styles.levelBadgeText}>Lv {user?.level || 1}</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>{user?.name || 'Athlete'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                {renderBadges()}

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Personal Info</Text>
                        <TouchableOpacity onPress={() => (editing ? handleSave() : setEditing(true))}>
                            <Text style={styles.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    {renderField('Name', formData.name, 'name')}
                    {renderField('Age', formData.age, 'age', true)}
                    {renderField('Weight (kg)', formData.weight, 'weight', true)}
                    {renderField('Height (cm)', formData.height, 'height', true)}

                    {editing ? (
                        <>
                            <Text style={styles.label}>Goal</Text>
                            <View style={styles.pickerRow}>
                                {['weight_loss', 'muscle_gain', 'maintain'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.miniBtn, formData.goal === g && styles.miniBtnActive]}
                                        onPress={() => updateForm('goal', g)}
                                    >
                                        <Text style={[styles.miniBtnText, formData.goal === g && styles.miniBtnTextActive]}>
                                            {g.split('_')[0].toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    ) : (
                        <View style={styles.readOnlyContainer}>
                            <Text style={styles.readOnlyLabel}>Goal</Text>
                            <Text style={styles.readOnlyValue}>{formData.goal.replace('_', ' ').toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={clearUser}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        padding: SIZES.lg,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SIZES.md,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    levelBadgeMini: {
        position: 'absolute',
        top: 0,
        left: -10,
        backgroundColor: '#f59e0b',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    levelBadgeText: {
        color: COLORS.background,
        fontWeight: 'bold',
        fontSize: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    email: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.md,
        padding: SIZES.lg,
        ...SHADOWS.small,
        marginBottom: SIZES.xl,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    badgeCount: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    editBtn: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    badgeScroll: {
        paddingRight: SIZES.lg,
        paddingBottom: SIZES.sm,
    },
    premiumBadge: {
        width: 120,
        backgroundColor: COLORS.background,
        padding: SIZES.md,
        borderRadius: SIZES.md,
        alignItems: 'center',
        marginRight: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    badgeLocked: {
        opacity: 0.4,
    },
    premiumBadgeIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
        ...SHADOWS.small,
    },
    premiumBadgeName: {
        color: COLORS.text,
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
    premiumBadgeDesc: {
        color: COLORS.textMuted,
        fontSize: 10,
        textAlign: 'center',
    },

    fieldContainer: {
        marginBottom: SIZES.md,
    },
    label: {
        color: COLORS.textMuted,
        fontSize: 14,
        marginBottom: 4,
    },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        padding: SIZES.sm,
        borderRadius: SIZES.xs,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    readOnlyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SIZES.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surfaceLight,
    },
    readOnlyLabel: {
        color: COLORS.textMuted,
        fontSize: 16,
    },
    readOnlyValue: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
    },
    pickerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: SIZES.md,
    },
    miniBtn: {
        flex: 1,
        paddingVertical: 8,
        marginHorizontal: 4,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.xs,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    miniBtnActive: {
        backgroundColor: COLORS.primaryDark,
        borderColor: COLORS.primary,
    },
    miniBtnText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    miniBtnTextActive: {
        color: COLORS.text,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SIZES.md,
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    logoutText: {
        color: COLORS.danger,
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    star: {
        position: 'absolute',
        backgroundColor: '#fff',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
});
