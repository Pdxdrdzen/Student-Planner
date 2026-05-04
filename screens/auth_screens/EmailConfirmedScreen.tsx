import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailConfirmedScreen() {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>🎓</Text>
            <Text style={styles.title}>Email potwierdzony!</Text>
            <Text style={styles.subtitle}>
                Witaj, {user?.name ?? 'Studencie'}!{'\n'}
                Twoje konto jest już aktywne.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center', padding: 24 },
    emoji: { fontSize: 64, marginBottom: 16 },
    title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24 },
});