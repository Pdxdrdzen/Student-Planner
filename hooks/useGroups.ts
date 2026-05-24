// hooks/useGroups.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // twój klient supabase
import { Group, GroupEvent, GroupMember, EventType } from '../types/groupTypes';

export function useGroups(userId: string | null) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        if (!userId) { setGroups([]); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            // Pobierz grupy, których user jest członkiem
            const { data: memberRows, error: memberErr } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', userId);

            if (memberErr) throw memberErr;
            if (!memberRows?.length) { setGroups([]); return; }

            const groupIds = memberRows.map(r => r.group_id);

            const { data: groupRows, error: groupErr } = await supabase
                .from('groups')
                .select('*')
                .in('id', groupIds);

            if (groupErr) throw groupErr;

            // Dla każdej grupy pobierz członków i wydarzenia
            const fullGroups: Group[] = await Promise.all(
                (groupRows ?? []).map(async (g) => {
                    const [{ data: members }, { data: events }] = await Promise.all([
                        supabase.from('group_members').select('*').eq('group_id', g.id),
                        supabase.from('group_events').select('*').eq('group_id', g.id),
                    ]);

                    return {
                        id: g.id,
                        name: g.name,
                        description: g.description ?? '',
                        facultyCode: g.faculty_code,
                        adminId: g.admin_id,
                        starostaId: g.starosta_id,
                        color: g.color,
                        createdAt: g.created_at,
                        members: (members ?? []).map(m => ({
                            id: m.user_id,
                            name: m.name,
                            email: m.email,
                            role: m.role,
                            avatarInitials: m.avatar_initials ?? m.name.slice(0, 2).toUpperCase(),
                        })),
                        events: (events ?? []).map(e => ({
                            id: e.id,
                            title: e.title,
                            description: e.description ?? '',
                            type: e.type as EventType,
                            dueDate: e.due_date,
                            createdBy: e.created_by,
                            groupId: e.group_id,
                        })),
                    };
                })
            );

            setGroups(fullGroups);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    const createGroup = async (name: string, desc: string, code: string): Promise<Group | null> => {
        if (!userId) return null;
        const COLORS = ['#6C63FF', '#FF6584', '#43BCCD', '#F9C74F', '#90BE6D'];
        const color = COLORS[groups.length % COLORS.length];

        const { data: g, error: gErr } = await supabase
            .from('groups')
            .insert({ name, description: desc, faculty_code: code, admin_id: userId, color })
            .select()
            .single();

        if (gErr || !g) { setError(gErr?.message ?? 'Błąd tworzenia grupy'); return null; }

        // Dodaj twórcę jako admina
        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        await supabase.from('group_members').insert({
            group_id: g.id, user_id: userId,
            role: 'admin', name, email: '', avatar_initials: initials,
        });

        await fetchGroups();
        return groups.find(gr => gr.id === g.id) ?? null;
    };

    const addEvent = async (
        groupId: string,
        title: string,
        desc: string,
        type: EventType,
        dueDate: Date,
    ) => {
        const { error: err } = await supabase.from('group_events').insert({
            group_id: groupId, title, description: desc,
            type, due_date: dueDate.toISOString(), created_by: userId,
        });
        if (err) { setError(err.message); return; }
        await fetchGroups();
    };

    const deleteEvent = async (eventId: string) => {
        const { error: err } = await supabase
            .from('group_events').delete().eq('id', eventId);
        if (err) { setError(err.message); return; }
        await fetchGroups();
    };

    const addMember = async (groupId: string, name: string, email: string) => {
        const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        // Znajdź user_id po emailu (jeśli jest w auth.users)
        const { data: profile } = await supabase
            .from('profiles') // zakładam że masz tabelę profiles
            .select('id')
            .eq('email', email)
            .single();

        const { error: err } = await supabase.from('group_members').insert({
            group_id: groupId,
            user_id: profile?.id ?? null,
            role: 'student',
            name, email,
            avatar_initials: initials,
        });
        if (err) { setError(err.message); return; }
        await fetchGroups();
    };

    const promoteToStarosta = async (groupId: string, memberId: string) => {
        // Zdegraduj obecnego starostę
        await supabase.from('group_members')
            .update({ role: 'student' })
            .eq('group_id', groupId).eq('role', 'starosta');

        await supabase.from('group_members')
            .update({ role: 'starosta' })
            .eq('group_id', groupId).eq('user_id', memberId);

        await supabase.from('groups')
            .update({ starosta_id: memberId }).eq('id', groupId);

        await fetchGroups();
    };

    const removeMember = async (groupId: string, memberId: string) => {
        await supabase.from('group_members')
            .delete().eq('group_id', groupId).eq('user_id', memberId);
        await fetchGroups();
    };

    return {
        groups, loading, error, refetch: fetchGroups,
        createGroup, addEvent, deleteEvent,
        addMember, promoteToStarosta, removeMember,
    };
}