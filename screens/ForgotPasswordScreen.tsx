// src/screens/ForgotPasswordScreen.tsx
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated,{useSharedValue,useAnimatedStyle,withTiming} from "react-native-reanimated";

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

type Step = 'email' | 'sent';

const ForgotPasswordScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [focused, setFocused] = useState(false);
    const [step, setStep] = useState<Step>('email');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);


    //timer countdown
    useEffect(() => {
        if(timer<=0)return;
        const id=setTimeout(()=>setTimer(t=>t-1),1000);
        return ()=>clearTimeout(id);
    }, [timer]);

    //Fade between steps
    const opacity=useSharedValue(1);
    const fadeStyle=useAnimatedStyle(()=>({opacity:opacity.value}))

    const changeStep=(next:'email'|'sent')=>{
        opacity.value=withTiming(0,{duration:200});
        setTimeout(()=>{
            setStep(next);
            opacity.value=withTiming(1,{duration:300});
        },200);
    };

    const handleSend = async () => {
        if (!email || !email.includes('@')) {
            setError('Podaj prawidłowy adres e-mail');
            return;
        }
        setError('');
        setLoading(true);
        // --send reset email logic here(API)
        await new Promise(r=>setTimeout(r,1000));
        setLoading(false);
        setTimer(60);
        changeStep('sent');
    };


    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
            <Animated.View style={[{ flex: 1 }, fadeStyle]}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {step === 'email' ? (
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.logoContainer}>
                                <View style={styles.logoCircle}>
                                    <Text style={styles.logoIcon}>🔑</Text>
                                </View>
                            </View>

                            <Text style={styles.title}>Resetuj hasło</Text>
                            <Text style={styles.subtitle}>
                                Podaj swój adres e-mail. Wyślemy Ci link do ustawienia nowego hasła.
                            </Text>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Adres e-mail</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focused && styles.inputFocused,
                                        error.length > 0 && styles.inputError,
                                    ]}
                                    placeholder="ty@przykład.com"
                                    placeholderTextColor="#555"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError(''); }}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                />
                                {error.length > 0 && (
                                    <Text style={styles.errorText}>{error}</Text>
                                )}
                            </View>

                            {/* Button */}
                            <TouchableOpacity
                                style={[styles.button, loading && { opacity: 0.6 }]}
                                onPress={handleSend}
                                activeOpacity={0.85}
                                disabled={loading}
                            >
                                {loading
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.buttonText}>Wyślij link resetujący</Text>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
                                <Text style={styles.backLinkText}>← Wróć do logowania</Text>
                            </TouchableOpacity>
                        </ScrollView>

                    ) : (
                        // check email box view
                        <ScrollView
                            contentContainerStyle={[styles.scrollContent, { alignItems: 'center' }]}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.logoContainer}>
                                <View style={styles.logoCircle}>
                                    <Text style={styles.logoIcon}>✉️</Text>
                                </View>
                            </View>

                            <Text style={styles.title}>Sprawdź skrzynkę</Text>
                            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                                Wysłaliśmy link na adres{' '}
                                <Text style={{ color: '#ccc', fontWeight: '600' }}>{email}</Text>
                            </Text>
                            <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
                                Nie widzisz wiadomości? Sprawdź folder spam lub wyślij ponownie.
                            </Text>

                            {/* Send again button with a timer */}
                            <TouchableOpacity
                                style={[styles.button, { width: '100%' }, timer > 0 && { opacity: 0.5 }]}
                                onPress={() => {
                                    if (timer > 0) return;
                                    setLoading(true);
                                    setTimeout(() => { setLoading(false); setTimer(60); }, 1000);
                                }}
                                disabled={timer > 0 || loading}
                            >
                                {loading
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : <Text style={styles.buttonText}>
                                        {timer > 0 ? `Wyślij ponownie (${timer}s)` : 'Wyślij ponownie'}
                                    </Text>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
                                <Text style={styles.backLinkText}>← Wróć do logowania</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </KeyboardAvoidingView>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#6C63FF33',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6C63FF',
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    logoIcon: {
        fontSize: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        marginBottom: 36,
        lineHeight: 22,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#aaa',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    input: {
        backgroundColor: '#161616',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    inputFocused: {
        borderColor: '#6C63FF',
        backgroundColor: '#1a1a2e',
    },
    inputError: {
        borderColor: '#FF4C4C55',
    },
    errorText: {
        color: '#FF4C4C',
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    button: {
        backgroundColor: '#6C63FF',
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    backLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    backLinkText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '500',
    },
    // --- Ekran "Wysłano" ---
    sentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    successCircle: {
        width: 88,
        height: 88,
        borderRadius: 28,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#6C63FF44',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        shadowColor: '#6C63FF',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
    },
    successIcon: {
        fontSize: 36,
    },
    sentTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    sentSubtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 12,
    },
    sentEmail: {
        color: '#ccc',
        fontWeight: '600',
    },
    sentHint: {
        fontSize: 13,
        color: '#555',
        textAlign: 'center',
        marginBottom: 36,
        lineHeight: 20,
    },
});

export default ForgotPasswordScreen;