import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, SIZES } from '../../constants/theme';
import { useStore } from '../../store/useStore';

// Standalone Ember component for stability
const EnergyEmber = ({ delay, startX, height }: { delay: number, startX: number, height: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 4000 + Math.random() * 3000,
        delay,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.ember, {
      left: startX,
      transform: [
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [height, -50] }) },
        { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 20, 0] }) },
        { scale: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.5, 1] }) }
      ],
      opacity: anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.6, 0.6, 0] })
    }]} />
  );
};

export default function HomeDashboard() {
  const router = useRouter();
  const { user, nutritionDays, workouts } = useStore();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [bgAnim] = useState(new Animated.Value(1)); // Background scale animation
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get('window');



  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();

    // Slow breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1.05, duration: 8000, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
      ])
    ).start();

    // Mesh Orbs Animation
    const startOrb = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true })
        ])
      ).start();
    };

    startOrb(orb1Anim, 15000);
    startOrb(orb2Anim, 20000);
  }, []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayNutrition = nutritionDays.find(d => d.date === todayStr) || { foods: [], waterGlasses: 0 };
  const consumedCalories = (todayNutrition.foods || []).reduce((acc, f) => acc + f.calories, 0);
  const calorieTarget = user?.goal === 'weight_loss' ? 2000 : user?.goal === 'muscle_gain' ? 3000 : 2500;

  // Calculate completed workouts today
  const safeWorkouts = workouts || [];
  const todayWorkouts = safeWorkouts.filter(s => s.date === todayStr);
  // Sum up calories burned from all finished sessions today
  const burnedCalories = todayWorkouts.reduce((acc, s) => acc + (s.caloriesBurned || 0), 0);
  const netCalories = consumedCalories - burnedCalories;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* MESH ORBS & ENERGY EMBERS BACKGROUND (EXACT SYNC WITH WORKOUT) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <EnergyEmber key={i} delay={i * 800} startX={(width / 8) * i} height={height} />
        ))}
        <Animated.View style={[styles.orb, {
          backgroundColor: COLORS.primary + '30',
          width: width,
          height: width,
          borderRadius: width / 2,
          top: -width * 0.2,
          left: -width * 0.3,
          transform: [
            { translateX: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) },
            { translateY: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 150] }) },
            { scale: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }
          ]
        }]} />
        <Animated.View style={[styles.orb, {
          backgroundColor: '#0ea5e960', // Brighter cyan
          width: width * 1.2,
          height: width * 1.2,
          borderRadius: width * 0.6,
          bottom: -width * 0.4,
          right: -width * 0.3,
          transform: [
            { translateX: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
            { translateY: orb1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) },
            { scale: orb2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }
          ]
        }]} />
      </View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profileAvatar} onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle" size={48} color={COLORS.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name || 'Athlete'} 👋</Text>
            <Text style={styles.subtitle}>Ready to crush it today?</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.streakBadge}>
          <Ionicons name="flame" size={20} color="#f97316" />
          <Text style={styles.streakText}>{user?.streak || 0}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} style={{ backgroundColor: 'transparent' }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <Text style={styles.sectionTitle}>Daily Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                  <Ionicons name="fast-food" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.progressVal}>{consumedCalories}</Text>
                <Text style={styles.progressLabel}>kcal eaten</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.progressItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                  <Ionicons name="flame" size={24} color="#f97316" />
                </View>
                <Text style={[styles.progressVal, { color: '#f97316' }]}>{burnedCalories}</Text>
                <Text style={styles.progressLabel}>kcal burned</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.progressItem}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                  <Ionicons name="water" size={24} color="#a855f7" />
                </View>
                <Text style={styles.progressVal}>{todayNutrition.waterGlasses}</Text>
                <Text style={styles.progressLabel}>/ 8 Glass</Text>
              </View>
            </View>

            {/* Net calories bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Net: {netCalories} kcal</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Target: {calorieTarget} kcal</Text>
            </View>
            <View style={styles.calorieBarBg}>
              <Animated.View style={[styles.calorieBarFill, { width: `${Math.min((netCalories / calorieTarget) * 100, 100)}%` }]} />
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.surface }]} onPress={() => router.push('/workouts')}>
              <View style={[styles.actionIconBg, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="play" size={20} color={COLORS.surface} />
              </View>
              <Text style={styles.actionText}>Start</Text>
              <Text style={styles.actionSubText}>Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.surface }]} onPress={() => router.push('/nutrition')}>
              <View style={[styles.actionIconBg, { backgroundColor: COLORS.accent }]}>
                <Ionicons name="restaurant" size={20} color={COLORS.surface} />
              </View>
              <Text style={styles.actionText}>Log Meal</Text>
              <Text style={styles.actionSubText}>Nutrition</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.surface }]} onPress={() => router.push('/progress')}>
              <View style={[styles.actionIconBg, { backgroundColor: COLORS.success }]}>
                <Ionicons name="trending-up" size={20} color={COLORS.surface} />
              </View>
              <Text style={styles.actionText}>Progress</Text>
              <Text style={styles.actionSubText}>Analytics</Text>
            </TouchableOpacity>
          </View>

          {/* RECENT ACTIVITY */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {safeWorkouts.length > 0 ? (
            <View style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{safeWorkouts[safeWorkouts.length - 1].mode} Workout</Text>
                <Text style={styles.activityTime}>Completed recently</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/workouts')} style={styles.activityArrow}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="leaf-outline" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyText}>No activity yet!</Text>
              <Text style={styles.emptySubText}>Jump into a workout to spark your momentum.</Text>
            </View>
          )}

        </Animated.View>
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
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginRight: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    marginLeft: 4,
    color: '#f97316',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scroll: {
    padding: SIZES.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.lg,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    ...SHADOWS.small,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.surfaceLight,
  },
  calorieBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  calorieBarFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  actionBtn: {
    width: '31%',
    padding: SIZES.md,
    borderRadius: SIZES.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  actionSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.lg,
    ...SHADOWS.small,
  },
  activityIcon: {
    marginRight: SIZES.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activityTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  activityArrow: {
    padding: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderStyle: 'dashed',
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
  },
  orb: {
    position: 'absolute',
    zIndex: -1,
    opacity: 0.5,
  },
  ember: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: -1,
  },
});
