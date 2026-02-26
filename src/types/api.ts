export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    metadata?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Alumni {
    id?: number | string;
    name: string;
    batch: string;
    profession: string;
    photoUrl?: string;
    photo?: string;
    isFeatured?: boolean;
}

export interface Application {
    id?: number | string;
    fullName: string;
    course: string;
    date: string;
    status: string;
}

export interface Announcement {
    id?: number | string;
    title: string;
    content: string;
    date: string;
}
