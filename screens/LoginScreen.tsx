// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StatusBar,
    ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Błąd', 'Wypełnij wszystkie pola');
            return;
        }
        // --authorization logic here
        navigation.replace('MainTabs');
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
                    {/* Logo / ikona */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoIcon}>✦</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Witaj ponownie</Text>
                    <Text style={styles.subtitle}>Zaloguj się, aby kontynuować</Text>

                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Adres e-mail</Text>
                        <TextInput
                            style={[styles.input, focused === 'email' && styles.inputFocused]}
                            placeholder="ty@przykład.com"
                            placeholderTextColor="#555"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                        />
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

                    {/* Przycisk logowania */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>Zaloguj się</Text>
                    </TouchableOpacity>

                    {/* Separator */}
                    <View style={styles.separator}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>lub</Text>
                        <View style={styles.separatorLine} />
                    </View>

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
        fontSize: 30,
        color: '#6C63FF',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        marginBottom: 36,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#aaa',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    forgotLink: {
        fontSize: 13,
        color: '#6C63FF',
        fontWeight: '500',
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
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 52,
    },
    eyeButton: {
        position: 'absolute',
        right: 14,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    eyeIcon: {
        fontSize: 18,
    },
    button: {
        backgroundColor: '#6C63FF',
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 8,
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
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#2a2a2a',
    },
    separatorText: {
        color: '#555',
        fontSize: 13,
        marginHorizontal: 12,
    },
    registerButton: {
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2e2e2e',
        backgroundColor: '#161616',
    },
    registerButtonText: {
        color: '#ccc',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LoginScreen;