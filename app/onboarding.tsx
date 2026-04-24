import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { ActivityLevel, Goal, useStore } from '../store/useStore';

export default function OnboardingScreen() {
    const [step, setStep] = useState(1);
    const { setUser, completeOnboarding } = useStore();

    const [formData, setFormData] = useState({
        gender: 'male' as string,
        age: '',
        weight: '',
        height: '',
        goal: 'weight_loss' as Goal,
        activityLevel: 'moderate' as ActivityLevel,
    });

    const updateForm = (key: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setUser(formData);
            completeOnboarding();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const renderStepIndicator = () => {
        return (
            <View style={styles.stepIndicatorContainer}>
                {[1, 2, 3].map((s) => (
                    <View key={s} style={[styles.stepDot, step >= s ? styles.stepDotActive : null]} />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    {step > 1 && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}
                    {renderStepIndicator()}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Let's get to know you</Text>

                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.label}>What is your gender?</Text>
                            <View style={styles.rowSelectors}>
                                {['male', 'female', 'other'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.selectorBtn, formData.gender === g && styles.selectorBtnActive]}
                                        onPress={() => updateForm('gender', g)}
                                    >
                                        <Text style={[styles.selectorText, formData.gender === g && styles.selectorTextActive]}>
                                            {g.charAt(0).toUpperCase() + g.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { marginTop: SIZES.xl }]}>What is your age?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 25"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={formData.age}
                                onChangeText={(val) => updateForm('age', val)}
                            />
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 70"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={formData.weight}
                                onChangeText={(val) => updateForm('weight', val)}
                            />

                            <Text style={[styles.label, { marginTop: SIZES.xl }]}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 175"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={formData.height}
                                onChangeText={(val) => updateForm('height', val)}
                            />
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.label}>What is your primary goal?</Text>
                            {['weight_loss', 'muscle_gain', 'maintain'].map((goal) => (
                                <TouchableOpacity
                                    key={goal}
                                    style={[styles.listSelectorBtn, formData.goal === goal && styles.selectorBtnActive]}
                                    onPress={() => updateForm('goal', goal)}
                                >
                                    <Text style={[styles.selectorText, formData.goal === goal && styles.selectorTextActive]}>
                                        {goal.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            <Text style={[styles.label, { marginTop: SIZES.xl }]}>Activity Level</Text>
                            {['sedentary', 'moderate', 'active', 'very_active'].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[styles.listSelectorBtn, formData.activityLevel === level && styles.selectorBtnActive]}
                                    onPress={() => updateForm('activityLevel', level)}
                                >
                                    <Text style={[styles.selectorText, formData.activityLevel === level && styles.selectorTextActive]}>
                                        {level.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                        <Text style={styles.primaryButtonText}>{step === 3 ? 'Finish' : 'Continue'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        padding: SIZES.lg,
        height: 60,
    },
    backButton: {
        position: 'absolute',
        left: SIZES.lg,
        zIndex: 1,
    },
    backButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    stepIndicatorContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepDot: {
        width: 30,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.surfaceLight,
        marginHorizontal: 4,
    },
    stepDotActive: {
        backgroundColor: COLORS.primary,
    },
    scrollContent: {
        padding: SIZES.lg,
        paddingBottom: 100,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SIZES.xxl,
    },
    stepContainer: {
        flex: 1,
    },
    label: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: SIZES.md,
    },
    input: {
        backgroundColor: COLORS.surface,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        fontSize: 18,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
    },
    rowSelectors: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    selectorBtn: {
        flex: 1,
        backgroundColor: COLORS.surface,
        paddingVertical: SIZES.md,
        marginHorizontal: 4,
        borderRadius: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        alignItems: 'center',
    },
    listSelectorBtn: {
        backgroundColor: COLORS.surface,
        padding: SIZES.md,
        borderRadius: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
        marginBottom: SIZES.sm,
    },
    selectorBtnActive: {
        backgroundColor: COLORS.primaryDark,
        borderColor: COLORS.primary,
    },
    selectorText: {
        color: COLORS.textMuted,
        fontWeight: '600',
        fontSize: 14,
    },
    selectorTextActive: {
        color: COLORS.text,
    },
    footer: {
        padding: SIZES.lg,
        backgroundColor: COLORS.background,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.lg,
        borderRadius: SIZES.md,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    primaryButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
