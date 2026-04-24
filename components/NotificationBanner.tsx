import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { AppNotification, useStore } from '../store/useStore';

export function NotificationBanner() {
    const notifications = useStore((state) => state.notifications);
    const removeNotification = useStore((state) => state.removeNotification);

    if (!notifications || notifications.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {notifications.map((noti) => (
                <NotificationItem key={noti.id} notification={noti} onDismiss={() => removeNotification(noti.id)} />
            ))}
        </View>
    );
}

function NotificationItem({ notification, onDismiss }: { notification: AppNotification, onDismiss: () => void }) {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => onDismiss());
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'warning';
            case 'info': default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (notification.type) {
            case 'success': return COLORS.success;
            case 'warning': return '#f59e0b';
            case 'info': default: return COLORS.primary;
        }
    };

    return (
        <Animated.View style={[styles.banner, { opacity: fadeAnim, borderLeftColor: getColor() }]}>
            <Ionicons name={getIcon()} size={24} color={getColor()} />
            <View style={styles.content}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
            </View>
            <TouchableOpacity onPress={onDismiss}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: SIZES.md,
        right: SIZES.md,
        zIndex: 9999,
        gap: 8,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SIZES.md,
        borderRadius: SIZES.sm,
        borderLeftWidth: 4,
        ...SHADOWS.medium,
    },
    content: {
        flex: 1,
        marginLeft: SIZES.sm,
    },
    title: {
        fontWeight: 'bold',
        color: COLORS.text,
        fontSize: 16,
    },
    message: {
        color: COLORS.textMuted,
        fontSize: 14,
        marginTop: 2,
    },
});
