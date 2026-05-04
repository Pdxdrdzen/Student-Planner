// screens/LoginScreen.tsx
import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, StatusBar, ScrollView,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useSharedValue, useAnimatedStyle, withSequence, withTiming,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';

type Props = { navigation: NativeStackNavigationProp<any> };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = ({ navigation }: Props) => {
    const { login } = useAuth();
    console.log('login function: ', login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);

    // Shake animation
    const shakeX = useSharedValue(0);
    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const triggerShake = () => {
        shakeX.value = withSequence(
            withTiming(-10, { duration: 60 }),
            withTiming(10, { duration: 60 }),
            withTiming(-8, { duration: 60 }),
            withTiming(8, { duration: 60 }),
            withTiming(0, { duration: 60 }),
        );
    };

    const validateEmail = (val: string) => {
        setEmail(val);
        if (val.length > 0 && !EMAIL_REGEX.test(val)) {
            setEmailError('Podaj prawidłowy adres e-mail');
        } else {
            setEmailError('');
        }
    };

    const handleLogin = async () => {
        console.log('handleLogin called');
        if (!password) {
            triggerShake();
            return;
        }
        if (!EMAIL_REGEX.test(email)||!email) {
            setEmailError('Podaj prawidłowy adres e-mail');
            triggerShake();
            return;
        }
        setLoading(true);

        const timeout=setTimeout(() => {
            setLoading(false);
            setEmailError('Przekroczono czas oczekiwania. Sprawdz polaczenie internetowe.');
        },10000);
        const {error}=await login(email, password);
        console.log('Error supabase: ', error);
        clearTimeout(timeout);
        setLoading(false);

        if(error){
            triggerShake();
            if(error.includes('Invalid login credentials')){
                setEmailError('Nieprawidlowy adres e-mail lub haslo');
            }else if(error.includes('Email not confirmed')){
                setEmailError('Potwierdz adres e-mail');
            }
            else{
                setEmailError('Wystąpił błąd. Spróbuj ponownie.');
            }
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoIcon}>✦</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Witaj ponownie</Text>
                    <Text style={styles.subtitle}>Zaloguj się, aby kontynuować</Text>

                    {/* Shake wrapper */}
                    <Animated.View style={shakeStyle}>
                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Adres e-mail</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focused === 'email' && styles.inputFocused,
                                    emailError ? styles.inputError : null,
                                ]}
                                placeholder="ty@przykład.com"
                                placeholderTextColor="#555"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                value={email}
                                onChangeText={validateEmail}
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused(null)}
                            />
                            {emailError ? (
                                <Text style={styles.errorText}>{emailError}</Text>
                            ) : null}
                        </View>

                        {/* Hasło */}
                        <View style={styles.inputWrapper}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Hasło</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                    <Text style={styles.forgotLink}>Zapomniałeś hasła?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        focused === 'password' && styles.inputFocused,
                                    ]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#555"
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Przycisk logowania */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Zaloguj się</Text>
                        )}
                    </TouchableOpacity>

                    {/* Separator */}
                    <View style={styles.separator}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>lub</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    {/* Social login */}
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                        <Text style={styles.socialIcon}>G</Text>
                        <Text style={styles.socialText}>Kontynuuj z Google</Text>
                    </TouchableOpacity>

                    {Platform.OS === 'ios' && (
                        <TouchableOpacity style={[styles.socialButton, styles.appleButton]} activeOpacity={0.8}>
                            <Text style={styles.socialIconApple}></Text>
                            <Text style={styles.socialTextApple}>Kontynuuj z Apple</Text>
                        </TouchableOpacity>
                    )}

                    {/* Link do rejestracji */}
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Utwórz konto</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 72, height: 72, borderRadius: 22,
        backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#6C63FF33',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#6C63FF', shadowOpacity: 0.3, shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 }, elevation: 8,
    },
    logoIcon: { fontSize: 30, color: '#6C63FF' },
    title: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 6, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: '#888', marginBottom: 36 },
    inputWrapper: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 13, fontWeight: '500', color: '#aaa', marginBottom: 8, letterSpacing: 0.2 },
    forgotLink: { fontSize: 13, color: '#6C63FF', fontWeight: '500' },
    input: {
        backgroundColor: '#161616', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#2a2a2a',
    },
    inputFocused: { borderColor: '#6C63FF', backgroundColor: '#1a1a2e' },
    inputError: { borderColor: '#FF4C4C88' },
    errorText: { color: '#FF4C4C', fontSize: 12, marginTop: 6, marginLeft: 4 },
    passwordContainer: { position: 'relative' },
    passwordInput: { paddingRight: 52 },
    eyeButton: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 4 },
    eyeIcon: { fontSize: 18 },
    button: {
        backgroundColor: '#6C63FF', borderRadius: 14, paddingVertical: 15,
        alignItems: 'center', marginTop: 8,
        shadowColor: '#6C63FF', shadowOpacity: 0.4, shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
    separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    separatorLine: { flex: 1, height: 1, backgroundColor: '#2a2a2a' },
    separatorText: { color: '#555', fontSize: 13, marginHorizontal: 12 },
    socialButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: 14, paddingVertical: 14,
        borderWidth: 1, borderColor: '#2e2e2e', backgroundColor: '#161616',
        marginBottom: 12, gap: 10,
    },
    appleButton: { backgroundColor: '#fff' },
    socialIcon: { fontSize: 16, fontWeight: '700', color: '#EA4335' },
    socialIconApple: { fontSize: 16, color: '#000' },
    socialText: { color: '#ccc', fontSize: 15, fontWeight: '500' },
    socialTextApple: { color: '#000', fontSize: 15, fontWeight: '500' },
    registerButton: {
        borderRadius: 14, paddingVertical: 15, alignItems: 'center',
        borderWidth: 1, borderColor: '#2e2e2e', backgroundColor: '#161616',
    },
    registerButtonText: { color: '#ccc', fontSize: 16, fontWeight: '500' },
});

export default LoginScreen;