import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminToken');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }
        return headers;
    },
});

const baseQueryWithAuthHandling = async (args: any, api: any, extraOptions: any) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            sessionStorage.setItem('session_expired_msg', 'Your session has expired. Please log in again.');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
    }

    return result;
};

export const adminApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: baseQueryWithAuthHandling,
    tagTypes: ['Students', 'Examinations', 'Subjects', 'Eligibilities', 'Marks', 'Dashboard'],
    endpoints: (builder) => ({
        // Dashboard Stats
        getDashboardStats: builder.query<{
            totalStudents: number;
            totalAlumni: number;
            totalApplications: number;
            totalAnnouncements: number;
            recentApplications: any[];
        }, void>({
            query: () => '/get_dashboard_stats',
            transformResponse: (response: any) => response?.data,
            providesTags: [
                { type: 'Dashboard', id: 'STATS' },
                { type: 'Students', id: 'LIST' },
            ],
        }),
        // Students
        getStudents: builder.query<any, {
            page?: number;
            limit?: number;
            search?: string;
            class_name?: string;
            year?: string | number;
            status?: string;
        }>({
            query: (params) => ({
                url: '/students',
                params,
            }),
            providesTags: (result) =>
                result?.data && Array.isArray(result.data)
                    ? [
                          ...result.data.map(({ id }: { id: number }) => ({ type: 'Students' as const, id })),
                          { type: 'Students', id: 'LIST' },
                      ]
                    : [{ type: 'Students', id: 'LIST' }],
        }),

        getPreviewAdmissionNumber: builder.query<{ preview: string; year: number }, { year?: number }>({
            query: (params) => ({
                url: '/students/preview_admission_number',
                params,
            }),
            transformResponse: (response: any) => response?.data,
        }),

        getStudentById: builder.query<any, number | string>({
            query: (id) => `/students/${id}`,
            providesTags: (result, error, id) => [{ type: 'Students', id }],
        }),

        createStudent: builder.mutation<any, FormData | any>({
            query: (body) => ({
                url: '/students',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Students', id: 'LIST' }],
        }),

        updateStudent: builder.mutation<any, { id: number | string; data: FormData | any }>({
            query: ({ id, data }) => ({
                url: `/students/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Students', id },
                { type: 'Students', id: 'LIST' },
            ],
        }),

        deleteStudent: builder.mutation<any, number | string>({
            query: (id) => ({
                url: `/students/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Students', id: 'LIST' }],
        }),

        // Examinations
        getExaminations: builder.query<any, {
            page?: number;
            limit?: number;
            search?: string;
            academic_year?: string;
            status?: string;
        }>({
            query: (params) => ({
                url: '/examinations',
                params,
            }),
            providesTags: (result) =>
                result?.data && Array.isArray(result.data)
                    ? [
                          ...result.data.map(({ id }: { id: number }) => ({ type: 'Examinations' as const, id })),
                          { type: 'Examinations', id: 'LIST' },
                      ]
                    : [{ type: 'Examinations', id: 'LIST' }],
        }),

        getExaminationById: builder.query<any, number | string>({
            query: (id) => `/examinations/${id}`,
            providesTags: (result, error, id) => [{ type: 'Examinations', id }],
        }),

        createExamination: builder.mutation<any, any>({
            query: (body) => ({
                url: '/examinations',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Examinations', id: 'LIST' }],
        }),

        updateExamination: builder.mutation<any, { id: number | string; data: any }>({
            query: ({ id, data }) => ({
                url: `/examinations/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Examinations', id },
                { type: 'Examinations', id: 'LIST' },
            ],
        }),

        deleteExamination: builder.mutation<any, number | string>({
            query: (id) => ({
                url: `/examinations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Examinations', id: 'LIST' }],
        }),

        // Global Subjects
        getGlobalSubjects: builder.query<any, {
            page?: number;
            limit?: number;
            search?: string;
            class_name?: string;
            status?: string;
        }>({
            query: (params) => ({
                url: '/subjects',
                params,
            }),
            providesTags: [{ type: 'Subjects', id: 'LIST' }],
        }),

        createGlobalSubject: builder.mutation<any, any>({
            query: (body) => ({
                url: '/subjects',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Subjects', id: 'LIST' }],
        }),

        updateGlobalSubject: builder.mutation<any, { id: number | string; data: any }>({
            query: ({ id, data }) => ({
                url: `/subjects/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: [{ type: 'Subjects', id: 'LIST' }],
        }),

        deleteGlobalSubject: builder.mutation<any, number | string>({
            query: (id) => ({
                url: `/subjects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Subjects', id: 'LIST' }],
        }),

        // Exam Class Subject Configuration
        getExamSubjectsForClass: builder.query<any, { examId: number | string; className: string }>({
            query: ({ examId, className }) => `/examinations/${examId}/classes/${className}/subjects`,
            providesTags: (result, error, { examId, className }) => [
                { type: 'Subjects', id: `${examId}-${className}` },
            ],
        }),

        configureExamSubjects: builder.mutation<any, {
            examId: number | string;
            className: string;
            subjects: Array<{ subject_id: number; max_marks: number; pass_marks: number; display_order?: number }>;
        }>({
            query: ({ examId, className, subjects }) => ({
                url: `/examinations/${examId}/classes/${className}/subjects`,
                method: 'POST',
                body: { class_name: className, subjects },
            }),
            invalidatesTags: (result, error, { examId, className }) => [
                { type: 'Subjects', id: `${examId}-${className}` },
                { type: 'Examinations', id: examId },
            ],
        }),

        removeExamSubject: builder.mutation<any, {
            examId: number | string;
            className: string;
            subjectId: number | string;
        }>({
            query: ({ examId, className, subjectId }) => ({
                url: `/examinations/${examId}/classes/${className}/subjects/${subjectId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { examId, className }) => [
                { type: 'Subjects', id: `${examId}-${className}` },
                { type: 'Examinations', id: examId },
            ],
        }),

        // Eligibility
        getExaminationEligibilities: builder.query<any, {
            examId: number | string;
            page?: number;
            limit?: number;
            class_name?: string;
            no_due_status?: string;
            fee_status?: string;
            search?: string;
        }>({
            query: ({ examId, ...params }) => ({
                url: `/examinations/${examId}/eligibility`,
                params,
            }),
            providesTags: (result, error, { examId }) => [
                { type: 'Eligibilities', id: examId },
            ],
        }),

        initializeEligibility: builder.mutation<any, { examId: number | string; class_name?: string }>({
            query: ({ examId, class_name }) => ({
                url: `/examinations/${examId}/eligibility/initialize`,
                method: 'POST',
                body: { class_name },
            }),
            invalidatesTags: (result, error, { examId }) => [
                { type: 'Eligibilities', id: examId },
            ],
        }),

        updateStudentEligibility: builder.mutation<any, {
            examId: number | string;
            studentId: number | string;
            data: { no_due_status?: string; no_due_remarks?: string; fee_status?: string; fee_remarks?: string };
        }>({
            query: ({ examId, studentId, data }) => ({
                url: `/examinations/${examId}/eligibility/${studentId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (result, error, { examId }) => [
                { type: 'Eligibilities', id: examId },
            ],
        }),

        bulkUpdateEligibility: builder.mutation<any, {
            examId: number | string;
            student_ids: number[];
            no_due_status?: string;
            fee_status?: string;
        }>({
            query: ({ examId, ...body }) => ({
                url: `/examinations/${examId}/eligibility/bulk`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, error, { examId }) => [
                { type: 'Eligibilities', id: examId },
            ],
        }),

        // Marks & Results
        getStudentMarksForExam: builder.query<any, { examId: number | string; studentId: number | string }>({
            query: ({ examId, studentId }) => `/examinations/${examId}/marks/${studentId}`,
            providesTags: (result, error, { examId, studentId }) => [
                { type: 'Marks', id: `${examId}-${studentId}` },
            ],
        }),

        getExaminationStudentsMarks: builder.query<any, {
            examId: number | string;
            class_name?: string;
            page?: number;
            limit?: number;
            search?: string;
        }>({
            query: ({ examId, ...params }) => ({
                url: `/examinations/${examId}/students_marks`,
                params,
            }),
            providesTags: (result, error, { examId }) => [
                { type: 'Marks', id: examId },
            ],
        }),

        saveStudentMarks: builder.mutation<any, {
            examId: number | string;
            studentId: number | string;
            marks: Array<{ subject_id: number; marks_obtained: number; is_absent?: boolean }>;
        }>({
            query: ({ examId, studentId, marks }) => ({
                url: `/examinations/${examId}/marks/${studentId}`,
                method: 'POST',
                body: { marks },
            }),
            invalidatesTags: (result, error, { examId, studentId }) => [
                { type: 'Marks', id: `${examId}-${studentId}` },
                { type: 'Marks', id: examId },
                { type: 'Examinations', id: examId },
                { type: 'Students', id: studentId },
            ],
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetStudentsQuery,
    useGetPreviewAdmissionNumberQuery,
    useGetStudentByIdQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
    useGetExaminationsQuery,
    useGetExaminationByIdQuery,
    useCreateExaminationMutation,
    useUpdateExaminationMutation,
    useDeleteExaminationMutation,
    useGetGlobalSubjectsQuery,
    useCreateGlobalSubjectMutation,
    useUpdateGlobalSubjectMutation,
    useDeleteGlobalSubjectMutation,
    useGetExamSubjectsForClassQuery,
    useConfigureExamSubjectsMutation,
    useRemoveExamSubjectMutation,
    useGetExaminationEligibilitiesQuery,
    useInitializeEligibilityMutation,
    useUpdateStudentEligibilityMutation,
    useBulkUpdateEligibilityMutation,
    useGetStudentMarksForExamQuery,
    useGetExaminationStudentsMarksQuery,
    useSaveStudentMarksMutation,
} = adminApi;
