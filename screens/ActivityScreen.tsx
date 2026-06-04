// screens/ActivityScreen.tsx
import React from 'react';
import {
    View, Text, StyleSheet, FlatList,
    StatusBar, Platform, RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useActivity, ActivityItem, ActivityType } from '../hooks/useActivity';
import {
    UserPlus, UserMinus, CalendarPlus, CalendarX, Bell,
} from 'lucide-react-native';

const C = {
    bg: '#0f0f0f', surface: '#1a1a1a', surface2: '#222222',
    border: '#2e2e2e', text: '#ffffff', textMuted: '#888888', textDim: '#555555',
    accent: '#6C63FF',
};

// activity types config
const ACTIVITY_CONFIG: Record<ActivityType, {
    color: string;
    bgColor: string;
    icon: (color: string) => React.ReactElement;
    getMessage: (item: ActivityItem) => string;
}> = {
    member_joined: {
        color: '#4CAF50',
        bgColor: 'rgba(76,175,80,0.12)',
        icon: (c) => <UserPlus size={16} color={c} strokeWidth={2} />,
        getMessage: (item) => `${item.actorName} dołączył do grupy`,
    },
    member_left: {
        color: '#FF4444',
        bgColor: 'rgba(255,68,68,0.12)',
        icon: (c) => <UserMinus size={16} color={c} strokeWidth={2} />,
        getMessage: (item) => `${item.actorName} opuścił grupę`,
    },
    event_created: {
        color: '#6C63FF',
        bgColor: 'rgba(108,99,255,0.12)',
        icon: (c) => <CalendarPlus size={16} color={c} strokeWidth={2} />,
        getMessage: (item) =>
            `${item.actorName} dodał wydarzenie "${item.payload.eventTitle ?? ''}"`,
    },
    event_deleted: {
        color: '#FF8C00',
        bgColor: 'rgba(255,140,0,0.12)',
        icon: (c) => <CalendarX size={16} color={c} strokeWidth={2} />,
        getMessage: (item) =>
            `${item.actorName} usunął wydarzenie "${item.payload.eventTitle ?? ''}"`,
    },
};

function timeAgo(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return 'przed chwilą';
    if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} dni temu`;
    return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

const ActivityCard = ({ item }: { item: ActivityItem }) => {
    const config = ACTIVITY_CONFIG[item.type];
    if (!config) return null;

    return (
        <View style={styles.card}>
            {/* left icon with color */}
            <View style={[styles.iconWrap, { backgroundColor: config.bgColor }]}>
                {config.icon(config.color)}
            </View>

            {/* info */}
            <View style={styles.cardBody}>
                <Text style={styles.cardMessage} numberOfLines={2}>
                    {config.getMessage(item)}
                </Text>
                {/* Group name */}
                <View style={[styles.groupBadge, { backgroundColor: item.groupColor + '22', borderColor: item.groupColor + '55' }]}>
                    <View style={[styles.groupDot, { backgroundColor: item.groupColor }]} />
                    <Text style={[styles.groupBadgeText, { color: item.groupColor }]} numberOfLines={1}>
                        {item.groupName}
                    </Text>
                </View>
            </View>

            {/* Czas */}
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
        </View>
    );
};

export default function ActivityScreen() {
    const { user } = useAuth();
    const { activity, loading, refetch } = useActivity(user?.id ?? null);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            <View style={styles.header}>
                <Text style={styles.headerSub}>StudenckiPlaner</Text>
                <Text style={styles.headerTitle}>Aktywność</Text>
            </View>

            <FlatList
                data={activity}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refetch}
                        tintColor={C.accent}
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Bell size={52} color={C.textDim} strokeWidth={1.2} style={{ marginBottom: 12 }} />
                            <Text style={styles.emptyTitle}>Brak aktywności</Text>
                            <Text style={styles.emptySubtext}>
                                Tu pojawią się zdarzenia z Twoich grup — dołączenia, nowe wydarzenia i więcej.
                            </Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => <ActivityCard item={item} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 16,
    },
    headerSub: {
        fontSize: 12, color: C.textMuted,
        letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2,
    },
    headerTitle: {
        fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: -0.5,
    },
    listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 10, paddingTop: 8 },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: C.surface,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: C.border,
    },
    iconWrap: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    cardBody: { flex: 1, gap: 6 },
    cardMessage: { fontSize: 14, color: C.text, lineHeight: 20 },
    groupBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        alignSelf: 'flex-start',
        borderWidth: 1, borderRadius: 8,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    groupDot: { width: 6, height: 6, borderRadius: 3 },
    groupBadgeText: { fontSize: 11, fontWeight: '600' },
    timeText: { fontSize: 11, color: C.textDim, flexShrink: 0, marginTop: 2 },
    empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 6 },
    emptySubtext: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
});