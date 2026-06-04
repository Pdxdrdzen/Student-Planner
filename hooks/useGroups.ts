import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Group, EventType } from '../screens/groupTypes';

export function useGroups(userId: string | null) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [publicGroups,setPublicGroups] = useState<Group[]>([]);

    const logActivity = async (
        groupId: string,
        type: string,
        actorName: string,
        actorInitials: string,
        payload: object = {}
    ) => {
        await supabase.from('group_activity').insert({
            group_id: groupId,
            actor_name: actorName,
            actor_initials: actorInitials,
            type,
            payload,
        });
    };

    const fetchGroups = useCallback(async () => {
        if (!userId) { setGroups([]); setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const { data: memberRows, error: e1 } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', userId);
            if (e1) throw e1;
            if (!memberRows?.length) { setGroups([]); return; }

            const groupIds = memberRows.map(r => r.group_id);
            const { data: groupRows, error: e2 } = await supabase
                .from('groups').select('*').in('id', groupIds);
            if (e2) throw e2;

            const full: Group[] = await Promise.all(
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
                        color: g.color ?? '#6C63FF',
                        isPublic: g.is_public??false,
                        createdAt: g.created_at,
                        members: (members ?? []).map(m => ({
                            id: m.user_id??m.id,
                            userId: m.user_id ?? null,
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
            setGroups(full);
            const { data: pubRows } = await supabase
                .from('groups')
                .select('id, name, faculty_code, color, is_public, admin_id, starosta_id, created_at, description')
                .eq('is_public', true);

            const pubFull: Group[] = (pubRows ?? []).map(g => ({
                id: g.id,
                name: g.name,
                description: g.description ?? '',
                facultyCode: g.faculty_code,
                adminId: g.admin_id,
                starostaId: g.starosta_id ?? null,
                color: g.color ?? '#6C63FF',
                isPublic: true,
                createdAt: g.created_at,
                members: [],
                events: [],
            }));
            setPublicGroups(pubFull);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    const createGroup = async (name: string, desc: string, code: string, isPublic:boolean) => {
        if (!userId){
            console.log('CREATE GROUP: no userId')
            return;
        }
        console.log('STARTING CREATEGROUP')
        const colors = ['#6C63FF','#FF6584','#43BCCD','#F9C74F','#90BE6D'];
        const color = colors[groups.length % colors.length];
        const { data: g, error: e } = await supabase
            .from('groups')
            .insert({ name, description: desc, faculty_code: code, admin_id: userId, color , created_by: userId, is_public: isPublic,})
            .select().single();
        console.log('CREATE GROUP RESULT: ',{g,error: e});
        if (e || !g) { setError(e?.message ?? 'Błąd'); return; }
        const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
        await supabase.from('group_members').insert({
            group_id: g.id, user_id: userId,
            role: 'admin', name, email: '', avatar_initials: initials,
        });
        await fetchGroups();
    };

    const addEvent = async (groupId: string, title: string, desc: string, type: EventType, dueDate: Date) => {
        const { error: e } = await supabase.from('group_events').insert({
            group_id: groupId, title, description: desc,
            type, due_date: dueDate.toISOString(), created_by: userId,
        });
        if (e) setError(e.message);
        const actor = groups.find(g => g.id === groupId)
            ?.members.find(m => m.id === userId);
        await logActivity(groupId, 'event_created',
            actor?.name ?? 'Ktoś',
            actor?.avatarInitials ?? '?',
            { eventTitle: title, eventType: type }
        );

        await fetchGroups();
    };

    const deleteEvent = async (eventId: string) => {
        const event = groups.flatMap(g => g.events).find(e => e.id === eventId);
        const group = groups.find(g => g.events.some(e => e.id === eventId));
        const actor = group?.members.find(m => m.id === userId);
        const { error: e } = await supabase.from('group_events').delete().eq('id', eventId);
        if (e) setError(e.message);
        if (group) {
            await logActivity(group.id, 'event_deleted',
                actor?.name ?? 'Ktoś',
                actor?.avatarInitials ?? '?',
                { eventTitle: event?.title ?? '' }
            );
        }
        await fetchGroups();
    };

    const addMember = async (groupId: string, name: string, email: string) => {
        const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
        const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single();
        const { error: e } = await supabase.from('group_members').insert({
            group_id: groupId, user_id: profile?.id ?? null,
            role: 'student', name, email, avatar_initials: initials,
        });
        if (e) setError(e.message);
        await logActivity(groupId, 'member_joined', name, initials);
        await fetchGroups();
    };

    const removeMember = async (groupId: string, memberId: string) => {
        const member = groups
            .find(g => g.id === groupId)
            ?.members.find(m => m.id === memberId);
        if (member) await logActivity(groupId, 'member_left', member.name, member.avatarInitials);
        await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', memberId);
        if (member) {
            await logActivity(groupId, 'member_left', member.name, member.avatarInitials);
        }
        await fetchGroups();
    };

    const promoteToStarosta = async (groupId: string, memberId: string) => {
        await supabase.from('group_members').update({ role: 'student' }).eq('group_id', groupId).eq('role', 'starosta');
        await supabase.from('group_members').update({ role: 'starosta' }).eq('group_id', groupId).eq('user_id', memberId);
        await supabase.from('groups').update({ starosta_id: memberId }).eq('id', groupId);
        await fetchGroups();
    };

    return { groups,publicGroups, loading, error, refetch: fetchGroups,
        createGroup, addEvent, deleteEvent,
        addMember, removeMember, promoteToStarosta };
}