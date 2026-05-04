// src/screens/RegisterScreen.tsx
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
    ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {useSharedValue,useAnimatedStyle, withDelay, withSpring} from "react-native-reanimated";
import {useAuth} from '../../contexts/AuthContext';
import UniversityPicker from "../../components/UniversityPicker";

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const RegisterScreen = ({ navigation }: Props) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const {register} = useAuth();
    const EMAIL_REGEX= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [emailError, setEmailError] = useState('');
    const [university, setUniversity] = useState('');
    const [faculty, setFaculty] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateEmail = (val: string) => {
        setEmail(val);
        if (val.length > 0 && !EMAIL_REGEX.test(val)) {
            setEmailError('Podaj poprawny adres email');
        } else {
            setEmailError('');
        }
    };

    const getPasswordStrength = (): { label: string; color: string; width: string } => {
        if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
        if (password.length < 6) return { label: 'Słabe', color: '#FF4C4C', width: '33%' };
        if (password.length < 10) return { label: 'Średnie', color: '#FFB347', width: '66%' };
        return { label: 'Silne', color: '#4CAF50', width: '100%' };
    };

    const strength = getPasswordStrength();

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Błąd', 'Wypełnij wszystkie pola');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Błąd', 'Hasła nie są identyczne');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
            return;
        }
        if(!accepted) {
            Alert.alert('Błąd','Zaakceptuj regulamin!');
        }
        if(!EMAIL_REGEX.test(email)) {
            Alert.alert('Błąd','Podaj prawidlowy adres email')
        }
       setLoading(true);
       const {error}=await register(email, name, password);
       setLoading(false);
       if(error) {
           if(error.includes('already registered')) {
               Alert.alert('Błąd','Konto z tym adresem e-mail juz istnieje');
           }else{
               Alert.alert('Błąd',error);
           }
       }else{
           Alert.alert(
               'Sprawdz skrzynke mailowa',
                    'Wysłaliśmy e-mail potwierdzający. Kliknij link aby aktywować konto.',
                        [{text:'OK',onPress:()=>navigation.navigate('Login')}]
           );
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

                    <Text style={styles.title}>Utwórz konto</Text>
                    <Text style={styles.subtitle}>Dołącz i zacznij działać</Text>

                    {/* Imię / Nazwa */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Imię lub pseudonim</Text>
                        <TextInput
                            style={[styles.input, focused === 'name' && styles.inputFocused]}
                            placeholder="Jan Kowalski"
                            placeholderTextColor="#555"
                            autoCapitalize="words"
                            autoComplete="name"
                            value={name}
                            onChangeText={setName}
                            onFocus={() => setFocused('name')}
                            onBlur={() => setFocused(null)}
                        />
                    </View>

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
                        {emailError?<Text style={styles.errorText}>{emailError}</Text>:null}
                    </View>

                    {/* Hasło */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Hasło</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.passwordInput,
                                    focused === 'password' && styles.inputFocused,
                                ]}
                                placeholder="Minimum 6 znaków"
                                placeholderTextColor="#555"
                                secureTextEntry={!showPassword}
                                autoComplete="new-password"
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
                        {/* Password strength bar */}
                        {password.length > 0 && (
                            <View style={styles.strengthRow}>
                                <View style={styles.strengthTrack}>
                                    <View
                                        style={[
                                            styles.strengthFill,
                                            {
                                                width: strength.width as any,
                                                backgroundColor: strength.color,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                    {strength.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Potwierdź hasło */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Potwierdź hasło</Text>
                        <TextInput
                            style={[
                                styles.input,
                                focused === 'confirm' && styles.inputFocused,
                                confirmPassword.length > 0 &&
                                password !== confirmPassword &&
                                styles.inputError,
                            ]}
                            placeholder="Powtórz hasło"
                            placeholderTextColor="#555"
                            secureTextEntry={!showPassword}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            onFocus={() => setFocused('confirm')}
                            onBlur={() => setFocused(null)}
                        />
                        {/*University input field*/}
                        <Text style={styles.label}>Uczelnia/Kierunek (opcjonalne)</Text>
                        <UniversityPicker
                            university={university}
                            faculty={faculty}
                            onUniversityChange={(val) => setUniversity(val)}
                            onFacultyChange={(val) => setFaculty(val)}
                            />

                        <TouchableOpacity
                            style={{flexDirection:'row',alignItems:'center',marginBottom:20,gap:12}}
                            onPress={()=>setAccepted(!accepted)}
                        >
                            <View style={{
                                width: 22, height: 22, borderRadius: 6,
                                borderWidth: 1.5, borderColor: accepted ? '#6C63FF' : '#3a3a3a',
                                backgroundColor: accepted ? '#6C63FF' : '#161616',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                {accepted && <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>}
                            </View>
                            <Text style={{ flex: 1, fontSize: 13, color: '#888' }}>
                                Akceptuję <Text style={{ color: '#6C63FF' }}>regulamin</Text> i <Text style={{ color: '#6C63FF' }}>politykę prywatności</Text>
                            </Text>
                        </TouchableOpacity>

                        {confirmPassword.length > 0 && password !== confirmPassword && (
                            <Text style={styles.errorText}>Hasła nie są identyczne</Text>
                        )}
                    </View>

                    {/* Przycisk rejestracji */}
                    <TouchableOpacity
                        disabled={!accepted||loading}
                        style={[styles.button,(!accepted||loading)&&{opacity:0.45}]}
                        onPress={handleRegister}
                        activeOpacity={0.85}
                    >
                        {loading?<ActivityIndicator size="small" color="fff" />:
                        <Text style={styles.buttonText}>Zarejestruj się</Text>}
                    </TouchableOpacity>

                    {/* Link do logowania */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.loginLinkText}>
                            Masz już konto?{' '}
                            <Text style={styles.loginLinkAccent}>Zaloguj się</Text>
                        </Text>
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
        marginBottom: 28,
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
        marginBottom: 32,
    },
    inputWrapper: {
        marginBottom: 18,
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
    strengthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 10,
    },
    strengthTrack: {
        flex: 1,
        height: 4,
        backgroundColor: '#2a2a2a',
        borderRadius: 99,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 99,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 44,
        textAlign: 'right',
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
    loginLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#666',
        fontSize: 14,
    },
    loginLinkAccent: {
        color: '#6C63FF',
        fontWeight: '600',
    },
});

export default RegisterScreen;