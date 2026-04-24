import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useStore } from '../store/useStore';

export default function LoginScreen() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const authAction = useStore((state) => state.authAction);
    const router = useRouter();

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setShowPassword(false);
    };

    const handleSubmit = async () => {
        setError('');

        // Frontend Validation
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required.');
            return;
        }
        if (isSignUp && !name.trim()) {
            setError('Please enter your full name.');
            return;
        }
        if (isSignUp && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        const errorMsg = await authAction(
            isSignUp ? 'register' : 'login',
            isSignUp ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password }
        );
        setLoading(false);

        if (errorMsg) {
            setError(errorMsg);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>FitApp</Text>
                    <Text style={styles.subtitle}>
                        {isSignUp ? 'Create your account' : 'Elevate your fitness journey'}
                    </Text>
                </View>

                {/* Form Card */}
                <View style={styles.formContainer}>

                    {/* Tab Switch */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tab, !isSignUp && styles.tabActive]}
                            onPress={() => { setIsSignUp(false); resetForm(); }}
                        >
                            <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, isSignUp && styles.tabActive]}
                            onPress={() => { setIsSignUp(true); resetForm(); }}
                        >
                            <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Name Field (Sign Up only) */}
                    {isSignUp && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="John Doe"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>
                    )}

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={COLORS.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm Password (Sign Up only) */}
                    {isSignUp && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Repeat password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>
                    )}

                    {/* Error Message */}
                    {!!error && (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color={COLORS.background} />
                            : <Text style={styles.primaryButtonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* Bottom Toggle */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    </Text>
                    <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); resetForm(); }}>
                        <Text style={styles.footerLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    keyboardView: { flex: 1, padding: SIZES.lg, justifyContent: 'center' },
    headerContainer: { marginBottom: SIZES.xxxl, alignItems: 'center' },
    title: {
        fontSize: 48, fontWeight: '800', color: COLORS.primary,
        marginBottom: SIZES.sm, letterSpacing: 1,
    },
    subtitle: { fontSize: 15, color: COLORS.textMuted },

    formContainer: {
        backgroundColor: COLORS.surface,
        padding: SIZES.xl,
        borderRadius: SIZES.lg,
        ...SHADOWS.large,
    },

    // Tab Switch
    tabRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.background,
        borderRadius: SIZES.md,
        padding: 4,
        marginBottom: SIZES.xl,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: SIZES.sm,
        alignItems: 'center',
    },
    tabActive: { backgroundColor: COLORS.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
    tabTextActive: { color: COLORS.background },

    inputGroup: { marginBottom: SIZES.md },
    label: { color: COLORS.text, fontSize: 13, marginBottom: 6, fontWeight: '600' },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        borderRadius: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SIZES.sm,
    },
    inputIcon: { marginRight: 6 },
    input: {
        flex: 1,
        paddingVertical: SIZES.md,
        color: COLORS.text,
        fontSize: 15,
    },
    eyeBtn: { padding: 6 },

    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: `${COLORS.danger}18`,
        borderRadius: SIZES.sm,
        padding: SIZES.sm,
        marginBottom: SIZES.sm,
    },
    errorText: { color: COLORS.danger, fontSize: 13, flex: 1 },

    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.md,
        alignItems: 'center',
        marginTop: SIZES.sm,
        ...SHADOWS.small,
    },
    primaryButtonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },

    footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.xxl },
    footerText: { color: COLORS.textMuted },
    footerLink: { color: COLORS.primary, fontWeight: 'bold' },
});
