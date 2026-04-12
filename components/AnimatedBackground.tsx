// src/components/AnimatedBackground.tsx
import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

type Orb = {
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
    duration: number;
};

const ORBS: Orb[] = [
    { x: W * 0.15, y: H * 0.12, size: 180, color: '#6C63FF', delay: 0,    duration: 6000 },
    { x: W * 0.7,  y: H * 0.08, size: 140, color: '#3ECFCF', delay: 1500, duration: 8000 },
    { x: W * 0.05, y: H * 0.5,  size: 120, color: '#FF6B9D', delay: 800,  duration: 7000 },
    { x: W * 0.75, y: H * 0.45, size: 160, color: '#6C63FF', delay: 2000, duration: 9000 },
    { x: W * 0.4,  y: H * 0.75, size: 100, color: '#3ECFCF', delay: 400,  duration: 6500 },
];

const OrbComponent = ({ orb }: { orb: Orb }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.07);

    useEffect(() => {
        scale.value = withDelay(
            orb.delay,
            withRepeat(
                withTiming(1.35, { duration: orb.duration, easing: Easing.inOut(Easing.sin) }),
                -1,
                true,
            ),
        );
        opacity.value = withDelay(
            orb.delay,
            withRepeat(
                withTiming(0.13, { duration: orb.duration, easing: Easing.inOut(Easing.sin) }),
                -1,
                true,
            ),
        );
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.orb,
                animStyle,
                {
                    left: orb.x - orb.size / 2,
                    top: orb.y - orb.size / 2,
                    width: orb.size,
                    height: orb.size,
                    borderRadius: orb.size / 2,
                    backgroundColor: orb.color,
                },
            ]}
        />
    );
};

const AnimatedBackground = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {ORBS.map((orb, i) => (
            <OrbComponent key={i} orb={orb} />
        ))}
    </View>
);

const styles = StyleSheet.create({
    orb: {
        position: 'absolute' as const,
    },
});

export default AnimatedBackground;