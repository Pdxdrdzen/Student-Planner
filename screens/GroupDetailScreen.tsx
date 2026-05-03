// screens/GroupDetailScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    FlatList,
    Platform,
} from 'react-native';
import {
    Group,
    GroupEvent,
    GroupMember,
    EventType,
    CURRENT_USER,
    canManageGroup,
    canManageMembers,
    canCreateEvents,
    getUserRoleInGroup,
    formatDueDate,
    getEventIcon,
    getEventUrgencyColor,
    UserRole,
} from './groupTypes';

// ─── Kolory ───────────────────────────────────────────────────────────────────
const C = {
    bg: '#0f0f0f',
    surface: '#1a1a1a',
    surface2: '#222222',
    surface3: '#2a2a2a',
    border: '#2e2e2e',
    accent: '#6C63FF',
    accentLight: 'rgba(108,99,255,0.15)',
    text: '#ffffff',
    textMuted: '#888888',
    textDim: '#444444',
    danger: '#FF4444',
    success: '#4CAF50',
    warning: '#FF8C00',
    starostaColor: '#FFD700',
};

type Tab = 'events' | 'members';
type EventFilter = 'all' | 'deadline' | 'event' | 'exam' | 'meeting';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ initials, color = C.accent, size = 38 }: { initials: string; color?: string; size?: number }) => (
    <View
        style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color + '33',
            borderWidth: 1,
            borderColor: color + '55',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Text style={{ color, fontSize: size * 0.35, fontWeight: '700' }}>{initials}</Text>
    </View>
);

// ─── Kafelek wydarzenia ───────────────────────────────────────────────────────
const EventCard = ({
                       event,
                       canDelete,
                       onDelete,
                   }: {
    event: GroupEvent;
    canDelete: boolean;
    onDelete: () => void;
}) => {
    const urgencyColor = getEventUrgencyColor(event.dueDate);
    const dueLabel = formatDueDate(event.dueDate);
    const isPast = new Date(event.dueDate) < new Date();

    const typeLabels: Record<EventType, string> = {
        deadline: 'TERMIN',
        exam: 'EGZAMIN',
        event: 'WYDARZENIE',
        meeting: 'SPOTKANIE',
    };

    return (
        <View style={[styles.eventCard, isPast && { opacity: 0.5 }]}>
            <View style={[styles.eventAccent, { backgroundColor: urgencyColor }]} />
            <View style={styles.eventBody}>
                <View style={styles.eventTop}>
                    <View style={styles.eventTypeRow}>
                        <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
                        <Text style={[styles.eventTypeLabel, { color: urgencyColor }]}>
                            {typeLabels[event.type]}
                        </Text>
                    </View>
                    {canDelete && (
                        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.deleteBtn}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description ? (
                    <Text style={styles.eventDesc} numberOfLines={2}>{event.description}</Text>
                ) : null}
                <View style={styles.eventFooter}>
                    <View style={[styles.dueBadge, { borderColor: urgencyColor + '66' }]}>
                        <View style={[styles.dueDot, { backgroundColor: urgencyColor }]} />
                        <Text style={[styles.dueText, { color: urgencyColor }]}>{dueLabel}</Text>
                    </View>
                    <Text style={styles.eventFullDate}>
                        {new Date(event.dueDate).toLocaleDateString('pl-PL', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>
            </View>
        </View>
    );
};

// ─── Wiersz członka ───────────────────────────────────────────────────────────
const MemberRow = ({
                       member,
                       canManage,
                       isCurrentUser,
                       onPromoteToStarosta,
                       onRemove,
                       isStarostaSlotTaken,
                   }: {
    member: GroupMember;
    canManage: boolean;
    isCurrentUser: boolean;
    onPromoteToStarosta: () => void;
    onRemove: () => void;
    isStarostaSlotTaken: boolean;
}) => {
    const roleColors: Record<UserRole, string> = {
        admin: C.accent,
        staroста: C.starostaColor,
        student: C.textMuted,
    };
    const roleLabels: Record<UserRole, string> = {
        admin: 'Admin',
        staroста: 'Starosta',
        student: 'Student',
    };

    return (
        <View style={styles.memberRow}>
            <Avatar initials={member.avatarInitials} color={roleColors[member.role]} />
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                    {member.name}
                    {isCurrentUser ? ' (Ty)' : ''}
                </Text>
                <Text style={styles.memberEmail} numberOfLines={1}>{member.email}</Text>
            </View>
            <View style={styles.memberRight}>
                <Text style={[styles.memberRoleLabel, { color: roleColors[member.role] }]}>
                    {roleLabels[member.role]}
                </Text>
                {canManage && !isCurrentUser && member.role === 'student' && (
                    <View style={styles.memberActions}>
                        {!isStarostaSlotTaken && (
                            <TouchableOpacity style={styles.memberActionBtn} onPress={onPromoteToStarosta}>
                                <Text style={styles.memberActionBtnText}>⭐ Starosta</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.memberActionBtn, styles.memberActionBtnDanger]}
                            onPress={onRemove}
                        >
                            <Text style={[styles.memberActionBtnText, { color: C.danger }]}>Usuń</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

// ─── Modal: Dodaj wydarzenie ──────────────────────────────────────────────────
const AddEventModal = ({
                           visible,
                           onClose,
                           onAdd,
                       }: {
    visible: boolean;
    onClose: () => void;
    onAdd: (title: string, desc: string, type: EventType, dueDate: Date) => void;
}) => {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState<EventType>('deadline');
    const [dateStr, setDateStr] = useState('');
    const [timeStr, setTimeStr] = useState('23:59');

    const eventTypes: { key: EventType; label: string; icon: string }[] = [
        { key: 'deadline', label: 'Termin', icon: '📋' },
        { key: 'exam', label: 'Egzamin', icon: '📝' },
        { key: 'event', label: 'Wydarzenie', icon: '🎬' },
        { key: 'meeting', label: 'Spotkanie', icon: '👥' },
    ];

    const handle = () => {
        if (!title.trim()) { Alert.alert('Błąd', 'Tytuł jest wymagany.'); return; }
        if (!dateStr.trim()) { Alert.alert('Błąd', 'Data jest wymagana (format: YYYY-MM-DD).'); return; }

        const combined = new Date(`${dateStr}T${timeStr}:00`);
        if (isNaN(combined.getTime())) {
            Alert.alert('Błąd', 'Nieprawidłowa data. Użyj formatu YYYY-MM-DD.');
            return;
        }

        onAdd(title.trim(), desc.trim(), type, combined);
        setTitle(''); setDesc(''); setDateStr(''); setTimeStr('23:59'); setType('deadline');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
            <View style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Nowe wydarzenie</Text>

                        {/* Typ */}
                        <Text style={styles.inputLabel}>Typ wydarzenia</Text>
                        <View style={styles.typeRow}>
                            {eventTypes.map(et => (
                                <TouchableOpacity
                                    key={et.key}
                                    style={[styles.typeBtn, type === et.key && styles.typeBtnActive]}
                                    onPress={() => setType(et.key)}
                                >
                                    <Text style={styles.typeBtnIcon}>{et.icon}</Text>
                                    <Text style={[styles.typeBtnLabel, type === et.key && styles.typeBtnLabelActive]}>
                                        {et.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Tytuł *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="np. Sprawozdanie z laboratorium"
                            placeholderTextColor={C.textDim}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.inputLabel}>Opis (opcjonalny)</Text>
                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            placeholder="Szczegóły..."
                            placeholderTextColor={C.textDim}
                            value={desc}
                            onChangeText={setDesc}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.dateRow}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.inputLabel}>Data * (YYYY-MM-DD)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="2025-06-15"
                                    placeholderTextColor={C.textDim}
                                    value={dateStr}
                                    onChangeText={setDateStr}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.inputLabel}>Godzina</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="23:59"
                                    placeholderTextColor={C.textDim}
                                    value={timeStr}
                                    onChangeText={setTimeStr}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                                <Text style={styles.btnCancelText}>Anuluj</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnPrimary} onPress={handle}>
                                <Text style={styles.btnPrimaryText}>Dodaj</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

// ─── Modal: Dodaj członka ─────────────────────────────────────────────────────
const AddMemberModal = ({
                            visible,
                            onClose,
                            onAdd,
                        }: {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, email: string) => void;
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handle = () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Błąd', 'Imię i e-mail są wymagane.');
            return;
        }
        onAdd(name.trim(), email.trim().toLowerCase());
        setName(''); setEmail('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Dodaj studenta</Text>

                    <Text style={styles.inputLabel}>Imię i nazwisko *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="np. Jan Kowalski"
                        placeholderTextColor={C.textDim}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.inputLabel}>E-mail *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="jan@student.pl"
                        placeholderTextColor={C.textDim}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                            <Text style={styles.btnCancelText}>Anuluj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnPrimary} onPress={handle}>
                            <Text style={styles.btnPrimaryText}>Dodaj</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ─── Główny ekran szczegółów grupy ────────────────────────────────────────────
export default function GroupDetailScreen({ route, navigation }: any) {
    const { groupId } = route.params as { groupId: string };

    // W prawdziwej aplikacji stan pochodzi z kontekstu/store
    // Tu dla uproszczenia trzymamy lokalnie
    const [groups, setGroups] = useState<Group[]>(route.params.groups ?? []);
    const group = groups.find(g => g.id === groupId)!;

    const [activeTab, setActiveTab] = useState<Tab>('events');
    const [eventFilter, setEventFilter] = useState<EventFilter>('all');
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    if (!group) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: C.text }}>Nie znaleziono grupy.</Text>
            </View>
        );
    }

    const myRole = getUserRoleInGroup(group, CURRENT_USER.id);
    const iCanManage = canManageGroup(group, CURRENT_USER.id);
    const iCanManageMembers = canManageMembers(group, CURRENT_USER.id);
    const iCanCreateEvents = canCreateEvents(group, CURRENT_USER.id);
    const hasStarosta = group.members.some(m => m.role === 'staroста');

    const updateGroup = (updater: (g: Group) => Group) => {
        setGroups(prev => prev.map(g => g.id === groupId ? updater(g) : g));
    };

    // ─── Event handlers ───
    const handleAddEvent = (title: string, desc: string, type: EventType, dueDate: Date) => {
        const ev: GroupEvent = {
            id: `ev-${Date.now()}`,
            title,
            description: desc,
            type,
            dueDate: dueDate.toISOString(),
            createdBy: CURRENT_USER.id,
            groupId,
        };
        updateGroup(g => ({ ...g, events: [...g.events, ev] }));
    };

    const handleDeleteEvent = (evId: string) => {
        Alert.alert('Usuń wydarzenie', 'Na pewno chcesz usunąć to wydarzenie?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Usuń', style: 'destructive',
                onPress: () => updateGroup(g => ({ ...g, events: g.events.filter(e => e.id !== evId) })),
            },
        ]);
    };

    const handleAddMember = (name: string, email: string) => {
        if (group.members.some(m => m.email === email)) {
            Alert.alert('Błąd', 'Ten użytkownik już należy do grupy.');
            return;
        }
        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const newMember: GroupMember = {
            id: `user-${Date.now()}`,
            name,
            email,
            role: 'student',
            avatarInitials: initials,
        };
        updateGroup(g => ({ ...g, members: [...g.members, newMember] }));
    };

    const handlePromoteToStarosta = (memberId: string) => {
        Alert.alert('Mianuj Starostę', 'Ten student zostanie starostą grupy. Obecny starosta (jeśli jest) straci tę rolę.', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Mianuj', onPress: () => {
                    updateGroup(g => ({
                        ...g,
                        starostaId: memberId,
                        members: g.members.map(m => ({
                            ...m,
                            role: m.id === memberId ? 'staroста' : m.role === 'staroста' ? 'student' : m.role,
                        })),
                    }));
                },
            },
        ]);
    };

    const handleRemoveMember = (memberId: string) => {
        Alert.alert('Usuń członka', 'Na pewno chcesz usunąć tego studenta z grupy?', [
            { text: 'Anuluj', style: 'cancel' },
            {
                text: 'Usuń', style: 'destructive',
                onPress: () => updateGroup(g => ({
                    ...g,
                    members: g.members.filter(m => m.id !== memberId),
                    starostaId: g.starostaId === memberId ? null : g.starostaId,
                })),
            },
        ]);
    };

    // ─── Filtrowane wydarzenia ───
    const filteredEvents = group.events
        .filter(e => eventFilter === 'all' || e.type === eventFilter)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const eventFilterOptions: { key: EventFilter; label: string }[] = [
        { key: 'all', label: 'Wszystkie' },
        { key: 'deadline', label: '📋 Terminy' },
        { key: 'exam', label: '📝 Egzaminy' },
        { key: 'event', label: '🎬 Eventy' },
        { key: 'meeting', label: '👥 Spotkania' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.detailHeader, { borderBottomColor: group.color + '44' }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.colorBar, { backgroundColor: group.color }]} />
                    <View>
                        <Text style={styles.detailTitle} numberOfLines={1}>{group.name}</Text>
                        <Text style={styles.detailCode}>{group.facultyCode} · {group.members.length} członków</Text>
                    </View>
                </View>
                {myRole && (
                    <View style={[
                        styles.myRolePill,
                        myRole === 'admin' ? { borderColor: C.accent } :
                            myRole === 'staroста' ? { borderColor: C.starostaColor } :
                                { borderColor: C.border }
                    ]}>
                        <Text style={[
                            styles.myRoleText,
                            myRole === 'admin' ? { color: C.accent } :
                                myRole === 'staroста' ? { color: C.starostaColor } :
                                    { color: C.textMuted }
                        ]}>
                            {myRole === 'admin' ? '🛡 Admin' : myRole === 'staroста' ? '⭐ Starosta' : '🎓 Student'}
                        </Text>
                    </View>
                )}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'events' && styles.tabActive]}
                    onPress={() => setActiveTab('events')}
                >
                    <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
                        📅 Wydarzenia ({group.events.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'members' && styles.tabActive]}
                    onPress={() => setActiveTab('members')}
                >
                    <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
                        👥 Członkowie ({group.members.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* ── EVENTS TAB ── */}
            {activeTab === 'events' && (
                <View style={{ flex: 1 }}>
                    {/* Event filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        {eventFilterOptions.map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.filterChip, eventFilter === opt.key && styles.filterChipActive]}
                                onPress={() => setEventFilter(opt.key)}
                            >
                                <Text style={[styles.filterChipText, eventFilter === opt.key && styles.filterChipTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <FlatList
                        data={filteredEvents}
                        keyExtractor={e => e.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyIcon}>📭</Text>
                                <Text style={styles.emptyText}>Brak wydarzeń</Text>
                                {iCanCreateEvents && (
                                    <Text style={styles.emptySubtext}>Dodaj pierwsze wydarzenie przyciskiem poniżej.</Text>
                                )}
                            </View>
                        }
                        renderItem={({ item: ev }) => (
                            <EventCard
                                event={ev}
                                canDelete={iCanCreateEvents}
                                onDelete={() => handleDeleteEvent(ev.id)}
                            />
                        )}
                    />

                    {iCanCreateEvents && (
                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => setShowAddEvent(true)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.fabText}>+ Wydarzenie</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* ── MEMBERS TAB ── */}
            {activeTab === 'members' && (
                <View style={{ flex: 1 }}>
                    {!hasStarosta && iCanManage && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxText}>
                                ⭐ Ta grupa nie ma jeszcze starosty. Mianuj go z listy poniżej.
                            </Text>
                        </View>
                    )}

                    <FlatList
                        data={group.members}
                        keyExtractor={m => m.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item: member }) => (
                            <MemberRow
                                member={member}
                                canManage={iCanManageMembers}
                                isCurrentUser={member.id === CURRENT_USER.id}
                                isStarostaSlotTaken={hasStarosta}
                                onPromoteToStarosta={() => handlePromoteToStarosta(member.id)}
                                onRemove={() => handleRemoveMember(member.id)}
                            />
                        )}
                    />

                    {iCanManageMembers && (
                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => setShowAddMember(true)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.fabText}>+ Dodaj studenta</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <AddEventModal
                visible={showAddEvent}
                onClose={() => setShowAddEvent(false)}
                onAdd={handleAddEvent}
            />
            <AddMemberModal
                visible={showAddMember}
                onClose={() => setShowAddMember(false)}
                onAdd={handleAddMember}
            />
        </View>
    );
}

// ─── Style ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    // Header
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 16 : 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    colorBar: { width: 4, height: 36, borderRadius: 2 },
    detailTitle: { fontSize: 17, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
    detailCode: { fontSize: 12, color: C.textMuted, marginTop: 1 },
    myRolePill: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginLeft: 8,
    },
    myRoleText: { fontSize: 11, fontWeight: '700' },
    // Tabs
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: { borderBottomColor: C.accent },
    tabText: { fontSize: 13, color: C.textMuted, fontWeight: '500' },
    tabTextActive: { color: C.accent, fontWeight: '700' },
    // Filter scroll
    filterScroll: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 6,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
    },
    filterChipActive: {
        backgroundColor: C.accentLight,
        borderColor: C.accent,
    },
    filterChipText: { fontSize: 12, color: C.textMuted },
    filterChipTextActive: { color: C.accent, fontWeight: '600' },
    // List
    listContent: { padding: 14, gap: 10, paddingBottom: 100 },
    // EventCard
    eventCard: {
        backgroundColor: C.surface,
        borderRadius: 14,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
    },
    eventAccent: { width: 4 },
    eventBody: { flex: 1, padding: 13 },
    eventTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    eventTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    eventIcon: { fontSize: 13 },
    eventTypeLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
    deleteBtn: { color: C.textDim, fontSize: 14, fontWeight: '700' },
    eventTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4, letterSpacing: -0.2 },
    eventDesc: { fontSize: 13, color: C.textMuted, marginBottom: 8, lineHeight: 18 },
    eventFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    dueDot: { width: 5, height: 5, borderRadius: 2.5 },
    dueText: { fontSize: 11, fontWeight: '700' },
    eventFullDate: { fontSize: 10, color: C.textDim },
    // MemberRow
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: C.border,
        gap: 10,
    },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 14, fontWeight: '600', color: C.text },
    memberEmail: { fontSize: 11, color: C.textMuted, marginTop: 1 },
    memberRight: { alignItems: 'flex-end', gap: 5 },
    memberRoleLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    memberActions: { flexDirection: 'row', gap: 6 },
    memberActionBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: C.surface2,
        borderWidth: 1,
        borderColor: C.border,
    },
    memberActionBtnDanger: { borderColor: C.danger + '66' },
    memberActionBtnText: { fontSize: 10, fontWeight: '600', color: C.textMuted },
    // InfoBox
    infoBox: {
        margin: 14,
        marginBottom: 0,
        padding: 12,
        backgroundColor: C.starostaColor + '15',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: C.starostaColor + '44',
    },
    infoBoxText: { color: C.starostaColor, fontSize: 13 },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        backgroundColor: C.accent,
        paddingHorizontal: 20,
        paddingVertical: 13,
        borderRadius: 28,
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    // Empty
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 5 },
    emptySubtext: { fontSize: 13, color: C.textMuted, textAlign: 'center' },
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
        width: 40, height: 4,
        backgroundColor: C.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20 },
    inputLabel: {
        fontSize: 11, color: C.textMuted,
        textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
    },
    input: {
        backgroundColor: C.surface2,
        borderWidth: 1, borderColor: C.border,
        borderRadius: 12, padding: 13,
        color: C.text, fontSize: 15, marginBottom: 14,
    },
    inputMultiline: { height: 80, textAlignVertical: 'top' },
    dateRow: { flexDirection: 'row' },
    typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    typeBtn: {
        flex: 1, alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: C.surface2,
        borderWidth: 1, borderColor: C.border,
    },
    typeBtnActive: { backgroundColor: C.accentLight, borderColor: C.accent },
    typeBtnIcon: { fontSize: 18, marginBottom: 3 },
    typeBtnLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
    typeBtnLabelActive: { color: C.accent },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
    btnCancel: {
        flex: 1, padding: 14, borderRadius: 12,
        backgroundColor: C.surface2, alignItems: 'center',
    },
    btnCancelText: { color: C.textMuted, fontWeight: '600', fontSize: 15 },
    btnPrimary: {
        flex: 2, padding: 14, borderRadius: 12,
        backgroundColor: C.accent, alignItems: 'center',
    },
    btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});