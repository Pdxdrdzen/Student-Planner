// screens/GroupViewScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    StatusBar,
    Platform,
} from 'react-native';
import {
    Group,
    GroupMember,
    MOCK_GROUPS,
    CURRENT_USER,
    canManageGroup,
    getUserRoleInGroup,
    formatDueDate,
    getEventIcon,
    getEventUrgencyColor,
    UserRole,
} from './groupTypes';

// ─── Nawigacja ────────────────────────────────────────────────────────────────
type Props = {
    navigation: any;
};

// ─── Kolory ───────────────────────────────────────────────────────────────────
const C = {
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    surface2: '#222222',
    border: '#2e2e2e',
    accent: '#6C63FF',
    accentLight: 'rgba(108,99,255,0.15)',
    text: '#ffffff',
    textMuted: '#888888',
    textDim: '#555555',
    danger: '#FF4444',
    success: '#4CAF50',
    warning: '#FF8C00',
    starostaColor: '#FFD700',
};

// ─── Rola badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: UserRole }) => {
    const config = {
        admin: { label: 'Admin', color: C.accent },
        staroста: { label: 'Starosta', color: C.starostaColor },
        student: { label: 'Student', color: C.textMuted },
    };
    const { label, color } = config[role];
    return (
        <View style={[styles.badge, { borderColor: color }]}>
            <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
    );
};

// ─── Karta grupy ──────────────────────────────────────────────────────────────
const GroupCard = ({
                       group,
                       onPress,
                       userRole,
                   }: {
    group: Group;
    onPress: () => void;
    userRole: UserRole | null;
}) => {
    const upcoming = group.events
        .filter(e => new Date(e.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 2);

    const starost = group.members.find(m => m.role === 'staroста');

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={[styles.colorDot, { backgroundColor: group.color }]} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{group.name}</Text>
                    <Text style={styles.cardCode}>{group.facultyCode}</Text>
                </View>
                {userRole && <RoleBadge role={userRole} />}
            </View>

            {/* Stats */}
            <View style={styles.cardStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{group.members.length}</Text>
                    <Text style={styles.statLabel}>członków</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>{group.events.length}</Text>
                    <Text style={styles.statLabel}>wydarzeń</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNum}>
                        {starost ? starost.avatarInitials : '—'}
                    </Text>
                    <Text style={styles.statLabel}>starosta</Text>
                </View>
            </View>

            {/* Nadchodzące */}
            {upcoming.length > 0 && (
                <View style={styles.upcomingSection}>
                    <Text style={styles.upcomingLabel}>Najbliższe:</Text>
                    {upcoming.map(ev => (
                        <View key={ev.id} style={styles.upcomingItem}>
                            <View
                                style={[
                                    styles.urgencyDot,
                                    { backgroundColor: getEventUrgencyColor(ev.dueDate) },
                                ]}
                            />
                            <Text style={styles.upcomingIcon}>{getEventIcon(ev.type)}</Text>
                            <Text style={styles.upcomingTitle} numberOfLines={1}>{ev.title}</Text>
                            <Text style={styles.upcomingDate}>{formatDueDate(ev.dueDate)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
};

// ─── Modal tworzenia grupy ────────────────────────────────────────────────────
const CreateGroupModal = ({
                              visible,
                              onClose,
                              onCreate,
                          }: {
    visible: boolean;
    onClose: () => void;
    onCreate: (name: string, desc: string, code: string) => void;
}) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [code, setCode] = useState('');

    const handle = () => {
        if (!name.trim() || !code.trim()) {
            Alert.alert('Błąd', 'Nazwa i kod wydziałowy są wymagane.');
            return;
        }
        onCreate(name.trim(), desc.trim(), code.trim());
        setName(''); setDesc(''); setCode('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Nowa Grupa</Text>

                    <Text style={styles.inputLabel}>Nazwa grupy *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="np. Informatyka 2024/2025"
                        placeholderTextColor={C.textDim}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.inputLabel}>Kod wydziałowy *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="np. INF-2024"
                        placeholderTextColor={C.textDim}
                        value={code}
                        onChangeText={setCode}
                        autoCapitalize="characters"
                    />

                    <Text style={styles.inputLabel}>Opis (opcjonalny)</Text>
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        placeholder="Krótki opis grupy..."
                        placeholderTextColor={C.textDim}
                        value={desc}
                        onChangeText={setDesc}
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                            <Text style={styles.btnCancelText}>Anuluj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnPrimary} onPress={handle}>
                            <Text style={styles.btnPrimaryText}>Utwórz</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ─── Główny ekran ─────────────────────────────────────────────────────────────
export default function GroupViewScreen({ navigation }: Props) {
    const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState<'all' | 'mine'>('all');

    const isAdmin = CURRENT_USER.role === 'admin';

    const visibleGroups = groups.filter(g =>
        filter === 'all'
            ? true
            : g.members.some(m => m.id === CURRENT_USER.id)
    );

    const handleCreate = (name: string, desc: string, code: string) => {
        const COLORS = ['#6C63FF', '#FF6584', '#43BCCD', '#F9C74F', '#90BE6D'];
        const newGroup: Group = {
            id: `group-${Date.now()}`,
            name,
            description: desc,
            facultyCode: code,
            adminId: CURRENT_USER.id,
            starostaId: null,
            color: COLORS[groups.length % COLORS.length],
            createdAt: new Date().toISOString(),
            members: [
                {
                    id: CURRENT_USER.id,
                    name: CURRENT_USER.name,
                    email: CURRENT_USER.email,
                    role: 'admin',
                    avatarInitials: CURRENT_USER.name.split(' ').map(w => w[0]).join('').slice(0, 2),
                },
            ],
            events: [],
        };
        setGroups(prev => [newGroup, ...prev]);
        Alert.alert('Sukces', `Grupa "${name}" została utworzona.`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSub}>StudenckiPlaner</Text>
                    <Text style={styles.headerTitle}>Grupy</Text>
                </View>
                {isAdmin && (
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setShowCreate(true)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.addBtnText}>+ Nowa</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
                {(['all', 'mine'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && styles.filterTabActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                            {f === 'all' ? 'Wszystkie' : 'Moje grupy'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Lista grup */}
            <FlatList
                data={visibleGroups}
                keyExtractor={g => g.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyText}>Brak grup</Text>
                        <Text style={styles.emptySubtext}>
                            {isAdmin ? 'Utwórz pierwszą grupę przyciskiem powyżej.' : 'Poproś admina o dodanie do grupy.'}
                        </Text>
                    </View>
                }
                renderItem={({ item: group }) => (
                    <GroupCard
                        group={group}
                        userRole={getUserRoleInGroup(group, CURRENT_USER.id)}
                        onPress={() =>
                            navigation.navigate('GroupDetail', {
                                groupId: group.id,
                                groups,
                                setGroups,
                            })
                        }
                    />
                )}
            />

            <CreateGroupModal
                visible={showCreate}
                onClose={() => setShowCreate(false)}
                onCreate={handleCreate}
            />
        </View>
    );
}

// ─── Style ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 16,
    },
    headerSub: {
        fontSize: 12,
        color: C.textMuted,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: C.text,
        letterSpacing: -0.5,
    },
    addBtn: {
        backgroundColor: C.accent,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
    },
    filterTabActive: {
        backgroundColor: C.accentLight,
        borderColor: C.accent,
    },
    filterTabText: {
        color: C.textMuted,
        fontSize: 13,
        fontWeight: '500',
    },
    filterTabTextActive: {
        color: C.accent,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 12,
    },
    // Karta
    card: {
        backgroundColor: C.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: C.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: C.text,
        letterSpacing: -0.3,
    },
    cardCode: {
        fontSize: 12,
        color: C.textMuted,
        marginTop: 1,
    },
    badge: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    cardStats: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface2,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 16,
        fontWeight: '700',
        color: C.text,
    },
    statLabel: {
        fontSize: 10,
        color: C.textMuted,
        marginTop: 1,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: C.border,
    },
    upcomingSection: {
        gap: 6,
    },
    upcomingLabel: {
        fontSize: 11,
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    upcomingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    urgencyDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    upcomingIcon: {
        fontSize: 12,
    },
    upcomingTitle: {
        flex: 1,
        fontSize: 13,
        color: C.text,
    },
    upcomingDate: {
        fontSize: 11,
        color: C.textMuted,
    },
    // Empty
    empty: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: C.text,
        marginBottom: 6,
    },
    emptySubtext: {
        fontSize: 14,
        color: C.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#1c1c1c',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: C.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: C.text,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    input: {
        backgroundColor: C.surface2,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 12,
        padding: 13,
        color: C.text,
        fontSize: 15,
        marginBottom: 16,
    },
    inputMultiline: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    btnCancel: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: C.surface2,
        alignItems: 'center',
    },
    btnCancelText: {
        color: C.textMuted,
        fontWeight: '600',
        fontSize: 15,
    },
    btnPrimary: {
        flex: 2,
        padding: 14,
        borderRadius: 12,
        backgroundColor: C.accent,
        alignItems: 'center',
    },
    btnPrimaryText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});