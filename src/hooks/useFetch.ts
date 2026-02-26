import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/api';

interface FetchOptions {
    params?: Record<string, any>;
    immediate?: boolean;
}

export function useFetch<T>(url: string, options: FetchOptions = {}) {
    const { immediate = true, params } = options;
    const [data, setData] = useState<T | null>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(
        async (overrideParams?: Record<string, any>) => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get(url, {
                    params: { ...params, ...overrideParams },
                });
                console.log("the repooooo==", response);

                if (response.data.success) {
                    const payload = response.data.data;

                    // Check if the response data is a paginated object
                    if (payload && typeof payload === 'object' && 'rows' in payload) {
                        setData(payload.rows);
                        setMetadata({
                            total: payload.totalItems,
                            totalPages: payload.totalPages,
                            page: payload.currentPage,
                        });
                    } else {
                        // Standard unpaginated response
                        setData(payload);
                        if (response.data.metadata) {
                            setMetadata(response.data.metadata);
                        }
                    }
                } else {
                    setError(response.data.message || 'Error fetching data');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Error fetching data');
            } finally {
                setLoading(false);
            }
        },
        [url, JSON.stringify(params)]
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, metadata, loading, error, refetch: execute };
}
