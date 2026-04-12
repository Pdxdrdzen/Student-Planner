// src/screens/ProfileScreen.tsx
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// temp mock - change when backend ready
const MOCK_USER = {
    loggedIn: false,
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    avatar: 'JK',
    groups: [
        { id: '1', name: 'Algorytmy i Struktury Danych', role: 'Członek', members: 24 },
        { id: '2', name: 'Projekt Inżynierski – Grupa B', role: 'Lider', members: 6 },
        { id: '3', name: 'Angielski B2/C1', role: 'Członek', members: 18 },
    ],
};

type Props = {
    navigation: CompositeNavigationProp<
        BottomTabNavigationProp<any>,
        NativeStackNavigationProp<any>
    >;
};

// Non-logged in screen
const NotLoggedIn = ({ navigation }: Props) => (
    <View style={styles.guestContainer}>
        <View style={styles.guestIconBox}>
            <Text style={styles.guestIcon}>👤</Text>
        </View>
        <Text style={styles.guestTitle}>Nie jesteś zalogowany</Text>
        <Text style={styles.guestDesc}>
            Zaloguj się, żeby zobaczyć swój profil, grupy i dane konta.
        </Text>
        <TouchableOpacity
            style={styles.loginCta}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
        >
            <Text style={styles.loginCtaText}>Zaloguj się</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
        >
            <Text style={styles.registerLink}>
                Nie masz konta?{' '}
                <Text style={styles.registerLinkAccent}>Zarejestruj się</Text>
            </Text>
        </TouchableOpacity>
    </View>
);

// Groups card
const GroupCard = ({
                       group,
                   }: {
    group: { id: string; name: string; role: string; members: number };
}) => (
    <TouchableOpacity style={styles.groupCard} activeOpacity={0.75}>
        <View style={styles.groupIconBox}>
            <Text style={styles.groupIcon}>👥</Text>
        </View>
        <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
            <Text style={styles.groupMeta}>{group.members} członków</Text>
        </View>
        <View style={[
            styles.roleBadge,
            group.role === 'Lider' && styles.roleBadgeLeader,
        ]}>
            <Text style={[
                styles.roleText,
                group.role === 'Lider' && styles.roleTextLeader,
            ]}>
                {group.role}
            </Text>
        </View>
    </TouchableOpacity>
);

// Logged in succesfully screen
const LoggedIn = ({ navigation }: Props) => {
    const user = MOCK_USER;

    const handleLogout = () => {
        Alert.alert('Wyloguj się', 'Na pewno chcesz się wylogować?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Wyloguj',
                style: 'destructive',
                onPress: () => {
                },
            },
        ]);
    };

    return (
        <ScrollView
            contentContainerStyle={styles.loggedScrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Avatar + dane */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{user.avatar}</Text>
                </View>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
            </View>

            {/* Dane logowania */}
            <View style={styles.section}>
                <Text style={styles.sectionLabel}>DANE KONTA</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>✉️</Text>
                        <View style={styles.infoTextBlock}>
                            <Text style={styles.infoKey}>Adres e-mail</Text>
                            <Text style={styles.infoValue}>{user.email}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>👤</Text>
                        <View style={styles.infoTextBlock}>
                            <Text style={styles.infoKey}>Nazwa użytkownika</Text>
                            <Text style={styles.infoValue}>{user.name}</Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.editLink}>Edytuj</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🔑</Text>
                        <View style={styles.infoTextBlock}>
                            <Text style={styles.infoKey}>Hasło</Text>
                            <Text style={styles.infoValue}>••••••••</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.editLink}>Zmień</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Twoje grupy */}
            <View style={styles.section}>
                <View style={styles.sectionRow}>
                    <Text style={styles.sectionLabel}>TWOJE GRUPY</Text>
                    <Text style={styles.sectionCount}>{user.groups.length}</Text>
                </View>
                {user.groups.length === 0 ? (
                    <View style={styles.emptyGroups}>
                        <Text style={styles.emptyGroupsText}>
                            Nie należysz jeszcze do żadnej grupy.
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('GroupDashboard')}>
                            <Text style={styles.emptyGroupsCta}>Przeglądaj grupy →</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.groupsList}>
                        {user.groups.map((group) => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </View>
                )}
            </View>

            {/* Wyloguj */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
            >
                <Text style={styles.logoutText}>Wyloguj się</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const ProfileScreen = ({ navigation }: Props) => {
    // Change MOCK_USER.loggedIn later to real state when auth is ready
    const isLoggedIn = MOCK_USER.loggedIn;

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
            <SafeAreaView style={styles.safeArea}>
                {isLoggedIn ? (
                    <LoggedIn navigation={navigation} />
                ) : (
                    <NotLoggedIn navigation={navigation} />
                )}
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0f0f0f' as const,
    },

    // ── Guest ──
    guestContainer: {
        flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingHorizontal: 36,
    },
    guestIconBox: {
        width: 88,
        height: 88,
        borderRadius: 28,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2e2e2e',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginBottom: 24,
    },
    guestIcon: {
        fontSize: 36,
    },
    guestTitle: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center' as const,
    },
    guestDesc: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center' as const,
        lineHeight: 21,
        marginBottom: 28,
    },
    loginCta: {
        backgroundColor: '#6C63FF',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 40,
        marginBottom: 16,
        shadowColor: '#6C63FF',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    loginCtaText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600' as const,
    },
    registerLink: {
        fontSize: 14,
        color: '#555',
    },
    registerLinkAccent: {
        color: '#6C63FF',
        fontWeight: '600' as const,
    },

    // ── Logged in ──
    loggedScrollContent: {
        paddingBottom: 48,
    },
    profileHeader: {
        alignItems: 'center' as const,
        paddingTop: 32,
        paddingBottom: 28,
        borderBottomWidth: 1,
        borderBottomColor: '#1e1e1e',
        marginBottom: 8,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6C63FF22',
        borderWidth: 2,
        borderColor: '#6C63FF55',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginBottom: 14,
    },
    avatarText: {
        fontSize: 26,
        fontWeight: '700' as const,
        color: '#9D97FF',
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
    },

    // ── Section ──
    section: {
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    sectionRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: 12,
        gap: 8,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: '#555',
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    sectionCount: {
        fontSize: 11,
        fontWeight: '700' as const,
        color: '#6C63FF',
        backgroundColor: '#6C63FF1A',
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginBottom: 12,
    },

    // ── Info card ──
    infoCard: {
        backgroundColor: '#141414',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#242424',
        overflow: 'hidden' as const,
    },
    infoRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: 16,
        gap: 12,
    },
    infoIcon: {
        fontSize: 18,
        width: 24,
        textAlign: 'center' as const,
    },
    infoTextBlock: {
        flex: 1,
    },
    infoKey: {
        fontSize: 11,
        color: '#555',
        marginBottom: 2,
        fontWeight: '500' as const,
    },
    infoValue: {
        fontSize: 14,
        color: '#ccc',
        fontWeight: '500' as const,
    },
    editLink: {
        fontSize: 13,
        color: '#6C63FF',
        fontWeight: '600' as const,
    },
    divider: {
        height: 1,
        backgroundColor: '#1e1e1e',
        marginHorizontal: 16,
    },

    // ── Groups ──
    groupsList: {
        gap: 8,
    },
    groupCard: {
        backgroundColor: '#141414',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#242424',
        padding: 14,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    groupIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#6C63FF1A',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: 12,
    },
    groupIcon: {
        fontSize: 18,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: '#ddd',
        marginBottom: 2,
    },
    groupMeta: {
        fontSize: 12,
        color: '#555',
    },
    roleBadge: {
        borderRadius: 99,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#2a2a2a',
    },
    roleBadgeLeader: {
        backgroundColor: '#6C63FF22',
    },
    roleText: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: '#666',
    },
    roleTextLeader: {
        color: '#9D97FF',
    },
    emptyGroups: {
        backgroundColor: '#141414',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#242424',
        padding: 20,
        alignItems: 'center' as const,
    },
    emptyGroupsText: {
        color: '#555',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center' as const,
    },
    emptyGroupsCta: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '600' as const,
    },

    // ── Logout ──
    logoutButton: {
        marginHorizontal: 16,
        marginTop: 32,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center' as const,
        borderWidth: 1,
        borderColor: '#FF4C4C33',
        backgroundColor: '#FF4C4C0D',
    },
    logoutText: {
        color: '#FF4C4C',
        fontSize: 15,
        fontWeight: '600' as const,
    },
});

export default ProfileScreen;
