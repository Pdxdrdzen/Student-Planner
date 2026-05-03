// groupTypes.ts

export type UserRole = 'admin' | 'staroста' | 'student';

export type EventType = 'deadline' | 'event' | 'exam' | 'meeting';

export interface GroupEvent {
    id: string;
    title: string;
    description: string;
    type: EventType;
    dueDate: string; // ISO string
    createdBy: string; // userId
    groupId: string;
}

export interface GroupMember {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarInitials: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    facultyCode: string; // e.g. "INF-2024"
    adminId: string;
    starostaId: string | null;
    members: GroupMember[];
    events: GroupEvent[];
    createdAt: string;
    color: string;
}

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

// ─── Mock current user ───────────────────────────────────────────────────────
export const CURRENT_USER: CurrentUser = {
    id: 'user-1',
    name: 'Admin Testowy',
    email: 'admin@uczelnia.pl',
    role: 'admin',
};

// ─── Mock data ────────────────────────────────────────────────────────────────
export const MOCK_GROUPS: Group[] = [
    {
        id: 'group-1',
        name: 'Informatyka 2024/2025',
        description: 'Grupa pierwszego roku informatyki',
        facultyCode: 'INF-2024',
        adminId: 'user-1',
        starostaId: 'user-2',
        color: '#6C63FF',
        createdAt: '2024-10-01T00:00:00Z',
        members: [
            { id: 'user-1', name: 'Admin Testowy', email: 'admin@uczelnia.pl', role: 'admin', avatarInitials: 'AT' },
            { id: 'user-2', name: 'Karolina Wiśniewska', email: 'k.wisniewska@student.pl', role: 'staroста', avatarInitials: 'KW' },
            { id: 'user-3', name: 'Marek Kowalski', email: 'm.kowalski@student.pl', role: 'student', avatarInitials: 'MK' },
            { id: 'user-4', name: 'Anna Nowak', email: 'a.nowak@student.pl', role: 'student', avatarInitials: 'AN' },
            { id: 'user-5', name: 'Piotr Zając', email: 'p.zajac@student.pl', role: 'student', avatarInitials: 'PZ' },
        ],
        events: [
            {
                id: 'ev-1',
                title: 'Sprawozdanie z Algorytmów',
                description: 'Oddać sprawozdanie z laboratorium nr 3 przez Moodle',
                type: 'deadline',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'user-2',
                groupId: 'group-1',
            },
            {
                id: 'ev-2',
                title: 'Egzamin z Matematyki',
                description: 'Sala A201, materiał z całego semestru',
                type: 'exam',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'user-2',
                groupId: 'group-1',
            },
            {
                id: 'ev-3',
                title: 'Film "Oppenheimer" — Dziekanat',
                description: 'Seans organizowany przez dziekanat, sala kinowa WNT',
                type: 'event',
                dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'user-1',
                groupId: 'group-1',
            },
        ],
    },
    {
        id: 'group-2',
        name: 'Zarządzanie 2024/2025',
        description: 'Grupa II roku zarządzania i ekonomii',
        facultyCode: 'ZAR-2024',
        adminId: 'user-1',
        starostaId: null,
        color: '#FF6584',
        createdAt: '2024-10-03T00:00:00Z',
        members: [
            { id: 'user-1', name: 'Admin Testowy', email: 'admin@uczelnia.pl', role: 'admin', avatarInitials: 'AT' },
            { id: 'user-6', name: 'Zofia Adamska', email: 'z.adamska@student.pl', role: 'student', avatarInitials: 'ZA' },
        ],
        events: [
            {
                id: 'ev-4',
                title: 'Prezentacja projektu',
                description: 'Każda grupa 10 minut + Q&A',
                type: 'meeting',
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                createdBy: 'user-1',
                groupId: 'group-2',
            },
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getUserRoleInGroup(group: Group, userId: string): UserRole | null {
    const member = group.members.find(m => m.id === userId);
    return member ? member.role : null;
}

export function canManageGroup(group: Group, userId: string): boolean {
    const role = getUserRoleInGroup(group, userId);
    return role === 'admin';
}

export function canManageMembers(group: Group, userId: string): boolean {
    const role = getUserRoleInGroup(group, userId);
    return role === 'admin' || role === 'staroста';
}

export function canCreateEvents(group: Group, userId: string): boolean {
    const role = getUserRoleInGroup(group, userId);
    return role === 'admin' || role === 'staroста';
}

export function formatDueDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Po terminie';
    if (diffDays === 0) return 'Dziś';
    if (diffDays === 1) return 'Jutro';
    if (diffDays < 7) return `Za ${diffDays} dni`;

    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
}

export function getEventIcon(type: EventType): string {
    switch (type) {
        case 'deadline': return '📋';
        case 'exam': return '📝';
        case 'event': return '🎬';
        case 'meeting': return '👥';
    }
}

export function getEventUrgencyColor(isoString: string): string {
    const diffMs = new Date(isoString).getTime() - Date.now();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return '#FF4444';
    if (diffDays < 3) return '#FF8C00';
    if (diffDays < 7) return '#FFD700';
    return '#4CAF50';
}