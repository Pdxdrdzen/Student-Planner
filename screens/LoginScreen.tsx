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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
    navigation: NativeStackNavigationProp<any>;
};

const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Błąd', 'Wypełnij wszystkie pola');
            return;
        }
        // --authorization logic here
        navigation.replace('MainTabs');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.inner}>
                <Text style={styles.title}>Witaj </Text>
                <Text style={styles.subtitle}>Zaloguj się, aby kontynuować</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Adres e-mail"
                    placeholderTextColor="#aaa"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Hasło"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Zaloguj się</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Alert.alert('Info', 'Funkcja wkrótce')}>
                    <Text style={styles.forgotText}>Zapomniałeś hasła?</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    inner: { flex: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#aaa', marginBottom: 32 },
    input: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2e2e2e',
    },
    button: {
        backgroundColor: '#6C63FF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    forgotText: { color: '#6C63FF', textAlign: 'center', fontSize: 14 },
});

export default LoginScreen;