import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type ActivityType = 'member_joined' | 'member_left' | 'event_created' | 'event_deleted';

export interface ActivityItem {
    id: string;
    groupId: string;
    groupName: string;
    groupColor: string;
    actorName: string;
    actorInitials: string;
    type: ActivityType;
    payload: Record<string, any>;
    createdAt: string;
}

export function useActivity(userId: string | null) {
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = useCallback(async () => {
        if (!userId) { setActivity([]); setLoading(false); return; }
        setLoading(true);

        // fetch user groups
        const { data: memberRows } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId);

        if (!memberRows?.length) { setActivity([]); setLoading(false); return; }

        const groupIds = memberRows.map(r => r.group_id);

        // fetch roup data
        const { data: groupRows } = await supabase
            .from('groups')
            .select('id, name, color')
            .in('id', groupIds);

        const groupMap = Object.fromEntries(
            (groupRows ?? []).map(g => [g.id, { name: g.name, color: g.color ?? '#6C63FF' }])
        );

        // last 30 days activity fetch
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: rows } = await supabase
            .from('group_activity')
            .select('*')
            .in('group_id', groupIds)
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(60);

        const items: ActivityItem[] = (rows ?? []).map(r => ({
            id: r.id,
            groupId: r.group_id,
            groupName: groupMap[r.group_id]?.name ?? 'Grupa',
            groupColor: groupMap[r.group_id]?.color ?? '#6C63FF',
            actorName: r.actor_name,
            actorInitials: r.actor_initials,
            type: r.type as ActivityType,
            payload: r.payload ?? {},
            createdAt: r.created_at,
        }));

        setActivity(items);
        setLoading(false);
    }, [userId]);

    useEffect(() => { fetchActivity(); }, [fetchActivity]);

    return { activity, loading, refetch: fetchActivity };
}