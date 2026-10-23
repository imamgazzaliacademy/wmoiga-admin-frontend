export interface PermissionDefinition {
    key: string;
    label: string;
    description: string;
}

export interface PermissionGroup {
    id: string;
    name: string;
    description: string;
    permissions: PermissionDefinition[];
}

export const PERMISSION_REGISTRY: PermissionGroup[] = [
    {
        id: 'dashboard',
        name: 'Dashboard Overview',
        description: 'Dashboard metrics, counts, and overview stats',
        permissions: [
            { key: 'view_dashboard', label: 'View Dashboard', description: 'Access dashboard analytics, counts, and overview metrics' },
        ],
    },
    {
        id: 'students',
        name: 'Student Management',
        description: 'Student profiles, admission details, and records',
        permissions: [
            { key: 'view_students_manage', label: 'View Students', description: 'Browse student list and view profile details' },
            { key: 'add_update_student', label: 'Add & Update Student', description: 'Create new students and edit existing student profiles' },
            { key: 'delete_student', label: 'Delete Student', description: 'Permanently remove student records' },
        ],
    },
    {
        id: 'staff',
        name: 'Staff & Faculty Management',
        description: 'Teaching staff, administration, and support members',
        permissions: [
            { key: 'view_staff_manage', label: 'View Staff', description: 'Browse staff directory and view detailed profiles' },
            { key: 'add_update_staff', label: 'Add & Update Staff', description: 'Create and update staff details, salaries, and roles' },
            { key: 'delete_staff', label: 'Delete Staff', description: 'Permanently delete staff records' },
        ],
    },
    {
        id: 'admissions',
        name: 'Admissions & Applications',
        description: 'Student admission applications, review, and exports',
        permissions: [
            { key: 'view_admissions', label: 'View Admissions', description: 'Browse admission applications and view submitted forms' },
            { key: 'manage_admissions', label: 'Manage & Export Admissions', description: 'Update application statuses, edit details, and export to Excel/PDF' },
            { key: 'delete_admissions', label: 'Delete Applications', description: 'Delete submitted admission applications' },
        ],
    },
    {
        id: 'subjects',
        name: 'Academics - Subjects',
        description: 'Academic subjects catalog and class links',
        permissions: [
            { key: 'view_subjects', label: 'View Subjects', description: 'View curriculum subjects list' },
            { key: 'manage_subjects', label: 'Manage Subjects', description: 'Create, update, and delete academic subjects' },
        ],
    },
    {
        id: 'examinations',
        name: 'Academics - Examinations & Results',
        description: 'Exams, subject mapping, eligibility, hall tickets, and marks',
        permissions: [
            { key: 'view_examinations', label: 'View Examinations', description: 'View exam cycles and configured subjects' },
            { key: 'manage_examinations', label: 'Manage Examinations', description: 'Create, update, and configure examination cycles' },
            { key: 'manage_eligibility', label: 'Manage Eligibility', description: 'Manage student eligibility and hall ticket issuance' },
            { key: 'view_results', label: 'View Results & Reports', description: 'View marks tabulation, student result cards, and export PDFs' },
            { key: 'manage_results', label: 'Enter & Save Marks', description: 'Input and update subject marks for students' },
        ],
    },
    {
        id: 'announcements',
        name: 'Announcements',
        description: 'Institutional announcements and attachments',
        permissions: [
            { key: 'view_announcements', label: 'View Announcements', description: 'View announcements feed' },
            { key: 'add_update_announcements', label: 'Add & Update Announcements', description: 'Create and edit announcements and file attachments' },
            { key: 'delete_announcements', label: 'Delete Announcements', description: 'Remove announcement posts' },
        ],
    },
    {
        id: 'alumni',
        name: 'Alumni Network',
        description: 'Alumni directory, testimonials, and featured alumni',
        permissions: [
            { key: 'view_alumni_manage', label: 'View Alumni', description: 'Browse alumni directory' },
            { key: 'add_update_alumni', label: 'Add & Update Alumni', description: 'Create and update alumni profiles and featured status' },
            { key: 'delete_alumni', label: 'Delete Alumni', description: 'Delete alumni entries' },
        ],
    },
    {
        id: 'important_dates',
        name: 'Important Dates',
        description: 'Academic milestones and admission schedule dates',
        permissions: [
            { key: 'view_important_dates', label: 'View Important Dates', description: 'View institutional important dates' },
            { key: 'manage_important_dates', label: 'Manage Important Dates', description: 'Create and update important schedule dates' },
        ],
    },
];

export const ALL_PERMISSION_KEYS = PERMISSION_REGISTRY.flatMap((group) =>
    group.permissions.map((p) => p.key)
);

export interface AdminUser {
    id: number;
    name: string;
    username: string;
    role: 'super_admin' | 'admin';
    permissions: Record<string, boolean>;
    is_active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export function hasPermission(
    user: AdminUser | null | undefined,
    permissionKey: string
): boolean {
    if (!user) return false;
    // Super Admin has unconditional full access to all features
    if (user.role === 'super_admin') return true;
    return !!user.permissions?.[permissionKey];
}

export function isSuperAdmin(user: AdminUser | null | undefined): boolean {
    return user?.role === 'super_admin';
}
