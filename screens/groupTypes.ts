// groupTypes.ts

export type UserRole = 'admin' | 'starosta' | 'student';
export type EventType = 'deadline' | 'event' | 'exam' | 'meeting';

export interface GroupEvent {
    id: string;
    title: string;
    description: string;
    type: EventType;
    dueDate: string;
    createdBy: string;
    groupId: string;
}

export interface GroupMember {
    id: string;
    userId?:string|null;
    name: string;
    email: string;
    role: UserRole;
    avatarInitials: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    facultyCode: string;
    adminId: string;
    starostaId: string | null;
    members: GroupMember[];
    events: GroupEvent[];
    createdAt: string;
    color: string;
    isPublic: boolean;
}

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getUserRoleInGroup(group: Group, userId: string): UserRole | null {
    const member = group.members.find(m => m.id === userId);
    return member ? member.role : null;
}

export function canManageGroup(group: Group, userId: string): boolean {
    return getUserRoleInGroup(group, userId) === 'admin';
}

export function canManageMembers(group: Group, userId: string): boolean {
    const role = getUserRoleInGroup(group, userId);
    return role === 'admin' || role === 'starosta';
}

export function canCreateEvents(group: Group, userId: string): boolean {
    const role = getUserRoleInGroup(group, userId);
    return role === 'admin' || role === 'starosta';
}

export function formatDueDate(isoString: string): string {
    const date = new Date(isoString);
    const diffDays = Math.ceil((date.getTime() - Date.now()) / 86400000);
    if (diffDays < 0) return 'Po terminie';
    if (diffDays === 0) return 'Dziś';
    if (diffDays === 1) return 'Jutro';
    if (diffDays < 7) return `Za ${diffDays} dni`;
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
}

export function getEventIcon(type: EventType): string {
    const icons: Record<EventType, string> = {
        deadline: '📋', exam: '📝', event: '🎬', meeting: '👥',
    };
    return icons[type];
}

export function getEventUrgencyColor(isoString: string): string {
    const diffDays = (new Date(isoString).getTime() - Date.now()) / 86400000;
    if (diffDays < 0) return '#FF4444';
    if (diffDays < 3) return '#FF8C00';
    if (diffDays < 7) return '#FFD700';
    return '#4CAF50';
}