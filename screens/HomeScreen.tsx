// screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import AnimatedBackground from '../components/AnimatedBackground';

type Props = {
    navigation: CompositeNavigationProp<
        BottomTabNavigationProp<any>,
        NativeStackNavigationProp<any>
    >;
};

type QuickLink = {
    icon: string;
    label: string;
    description: string;
    tab: string;
    accent: string;
};

const QUICK_LINKS: QuickLink[] = [
    {
        icon: '👥',
        label: 'Grupy',
        description: 'Dołącz lub zarządzaj grupami',
        tab: 'GroupDashboard',
        accent: '#6C63FF',
    },
    {
        icon: '🔍',
        label: 'Szukaj',
        description: 'Znajdź grupy i treści',
        tab: 'Search',
        accent: '#3ECFCF',
    },
    {
        icon: '👤',
        label: 'Profil',
        description: 'Twoje konto i ustawienia',
        tab: 'Profile',
        accent: '#FF6B9D',
    },
];

const AnimatedCard = ({
                          item,
                          index,
                          onPress,
                      }: {
    item: QuickLink;
    index: number;
    onPress: () => void;
}) => {
    const translateY = useSharedValue(40);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            300 + index * 120,
            withSpring(0, { damping: 18, stiffness: 120 }),
        );
        opacity.value = withDelay(
            300 + index * 120,
            withTiming(1, { duration: 400 }),
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={animStyle}>
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.75}
            >
                <View
                    style={[
                        styles.cardIconBox,
                        { backgroundColor: item.accent + '1A' },
                    ]}
                >
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                </View>
                <View style={styles.cardText}>
                    <Text style={styles.cardLabel}>{item.label}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
                <Text style={[styles.cardArrow, { color: item.accent }]}>›</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const HomeScreen = ({ navigation }: Props) => {
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Witaj' : 'Dobry wieczór';

    // Hero animations
    const badgeY = useSharedValue(-20);
    const badgeOpacity = useSharedValue(0);
    const titleY = useSharedValue(30);
    const titleOpacity = useSharedValue(0);
    const subtitleY = useSharedValue(24);
    const subtitleOpacity = useSharedValue(0);
    const ctaScale = useSharedValue(0.92);
    const ctaOpacity = useSharedValue(0);

    useEffect(() => {
        // Badge
        badgeY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) });
        badgeOpacity.value = withTiming(1, { duration: 500 });

        // Title
        titleY.value = withDelay(120, withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) }));
        titleOpacity.value = withDelay(120, withTiming(1, { duration: 500 }));

        // Subtitle
        subtitleY.value = withDelay(240, withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) }));
        subtitleOpacity.value = withDelay(240, withTiming(1, { duration: 500 }));

        // CTA button
        ctaScale.value = withDelay(380, withSpring(1, { damping: 14, stiffness: 130 }));
        ctaOpacity.value = withDelay(380, withTiming(1, { duration: 400 }));
    }, []);

    const badgeStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: badgeY.value }],
        opacity: badgeOpacity.value,
    }));
    const titleStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: titleY.value }],
        opacity: titleOpacity.value,
    }));
    const subtitleStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: subtitleY.value }],
        opacity: subtitleOpacity.value,
    }));
    const ctaStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ctaScale.value }],
        opacity: ctaOpacity.value,
    }));

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
            <SafeAreaView style={styles.safeArea}>
                {/* Pływające tło */}
                <AnimatedBackground />

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Animated.View style={[styles.badgeRow, badgeStyle]}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>✦ Student Planner</Text>
                            </View>
                        </Animated.View>

                        <Animated.Text style={[styles.greeting, titleStyle]}>
                            {greeting} 👋
                        </Animated.Text>
                        <Animated.Text style={[styles.heroTitle, titleStyle]}>
                            Organizuj naukę,{'\n'}działaj razem.
                        </Animated.Text>
                        <Animated.Text style={[styles.heroSubtitle, subtitleStyle]}>
                            Twoje centrum zarządzania grupami, zadaniami i harmonogramem —
                            wszystko w jednym miejscu.
                        </Animated.Text>

                        <Animated.View style={ctaStyle}>
                            <TouchableOpacity
                                style={styles.ctaButton}
                                onPress={() => navigation.navigate('GroupDashboard')}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.ctaButtonText}>Przejdź do grup →</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Section header */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Szybki dostęp</Text>
                        <View style={styles.sectionLine} />
                    </View>

                    {/* Quick links — każda karta animowana osobno */}
                    <View style={styles.quickLinks}>
                        {QUICK_LINKS.map((item, index) => (
                            <AnimatedCard
                                key={item.tab}
                                item={item}
                                index={index}
                                onPress={() => navigation.navigate(item.tab)}
                            />
                        ))}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <View style={styles.footerCard}>
                            <Text style={styles.footerIcon}>🎓</Text>
                            <View style={styles.footerTextBlock}>
                                <Text style={styles.footerTitle}>Nowy tutaj?</Text>
                                <Text style={styles.footerDesc}>
                                    Utwórz konto lub zaloguj się, żeby zapisywać swoje grupy i postępy.
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.loginButtonText}>Zaloguj się / Zarejestruj</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0f0f0f' as const,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    hero: {
        paddingHorizontal: 24,
        paddingTop: 36,
        paddingBottom: 32,
    },
    badgeRow: {
        flexDirection: 'row' as const,
        marginBottom: 20,
    },
    badge: {
        backgroundColor: '#6C63FF1A',
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#6C63FF44',
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    badgeText: {
        color: '#9D97FF',
        fontSize: 12,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
    },
    greeting: {
        fontSize: 16,
        color: '#888',
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '700' as const,
        color: '#ffffff',
        lineHeight: 40,
        letterSpacing: -0.8,
        marginBottom: 14,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#666',
        lineHeight: 23,
        marginBottom: 28,
    },
    ctaButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignSelf: 'flex-start' as const,
        shadowColor: '#6C63FF',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    ctaButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600' as const,
        letterSpacing: 0.2,
    },
    sectionHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: '#555',
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#222',
    },
    quickLinks: {
        paddingHorizontal: 16,
        gap: 10,
    },
    card: {
        backgroundColor: '#161616',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#242424',
        padding: 16,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    cardIconBox: {
        width: 46,
        height: 46,
        borderRadius: 13,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: 14,
    },
    cardIcon: {
        fontSize: 22,
    },
    cardText: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#eee',
        marginBottom: 2,
    },
    cardDescription: {
        fontSize: 13,
        color: '#666',
    },
    cardArrow: {
        fontSize: 24,
        fontWeight: '300' as const,
        marginLeft: 8,
    },
    footer: {
        marginTop: 32,
        marginHorizontal: 16,
        backgroundColor: '#141414',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#242424',
        padding: 20,
    },
    footerCard: {
        flexDirection: 'row' as const,
        alignItems: 'flex-start' as const,
        marginBottom: 16,
        gap: 14,
    },
    footerIcon: {
        fontSize: 28,
        marginTop: 2,
    },
    footerTextBlock: {
        flex: 1,
    },
    footerTitle: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: '#ddd',
        marginBottom: 4,
    },
    footerDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 20,
    },
    loginButton: {
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center' as const,
        borderWidth: 1,
        borderColor: '#6C63FF55',
        backgroundColor: '#6C63FF11',
    },
    loginButtonText: {
        color: '#9D97FF',
        fontSize: 14,
        fontWeight: '600' as const,
    },
});

export default HomeScreen;