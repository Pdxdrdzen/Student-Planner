// src/screens/SearchScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

const POPULAR_TAGS = ['Systemy Inteligetne 1', 'Aplikacje sieciowe', 'Analityka Big Data', 'Matematyka 1', 'Fizyka', 'Systemy Operacyjne 2'];

const SearchScreen = () => {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Szukaj</Text>
                        <Text style={styles.subtitle}>Znajdź grupy, kursy i materiały</Text>
                    </View>

                    {/* Search input */}
                    <View style={styles.searchRow}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={[styles.input, focused && styles.inputFocused]}
                            placeholder="Wpisz nazwę grupy lub temat..."
                            placeholderTextColor="#555"
                            value={query}
                            onChangeText={setQuery}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            returnKeyType="search"
                            autoCapitalize="none"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => setQuery('')}
                            >
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Popularne tagi */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>POPULARNE TEMATY</Text>
                        <View style={styles.tagsWrap}>
                            {POPULAR_TAGS.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    style={styles.tag}
                                    onPress={() => setQuery(tag)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.tagText}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Empty state */}
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🗂️</Text>
                        <Text style={styles.emptyTitle}>Zacznij wyszukiwanie</Text>
                        <Text style={styles.emptyDesc}>
                            Wpisz nazwę grupy, temat lub nazwę prowadzącego — wkrótce tutaj pojawią się wyniki.
                        </Text>
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
    header: {
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: '#fff',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    searchRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginHorizontal: 16,
        backgroundColor: '#161616',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        paddingHorizontal: 14,
        marginBottom: 28,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#fff',
    },
    inputFocused: {
    },
    clearButton: {
        padding: 6,
        marginLeft: 4,
    },
    clearIcon: {
        color: '#555',
        fontSize: 14,
        fontWeight: '600' as const,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: '#555',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    tagsWrap: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
        gap: 8,
    },
    tag: {
        backgroundColor: '#1a1a1a',
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#2e2e2e',
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    tagText: {
        color: '#aaa',
        fontSize: 13,
        fontWeight: '500' as const,
    },
    emptyState: {
        alignItems: 'center' as const,
        paddingHorizontal: 40,
        paddingTop: 16,
    },
    emptyIcon: {
        fontSize: 44,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600' as const,
        color: '#444',
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center' as const,
        lineHeight: 21,
    },
});

export default SearchScreen;