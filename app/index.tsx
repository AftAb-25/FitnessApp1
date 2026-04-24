import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

import { Redirect } from 'expo-router';
import { useStore } from '../store/useStore';

export default function IndexScreen() {
    const user = useStore((state) => state.user);
    if (!user) {
        return <Redirect href="/login" />;
    }
    if (!user.isOnboarded) {
        return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
