import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/services/api';

interface FetchOptions {
    params?: Record<string, any>;
    immediate?: boolean;
}

// Simple in-memory cache to prevent duplicate fetches across mount/unmount and tabs
const queryCache = new Map<string, { data: any; metadata: any; timestamp: number }>();

export function useFetch<T>(url: string, options: FetchOptions = {}) {
    const { immediate = true, params } = options;
    const cacheKey = `${url}:${JSON.stringify(params || {})}`;

    // Initialize with cached data if available
    const initialCached = queryCache.get(cacheKey);

    const [data, setData] = useState<T | null>(initialCached ? initialCached.data : null);
    const [metadata, setMetadata] = useState<any>(initialCached ? initialCached.metadata : null);
    const [loading, setLoading] = useState<boolean>(!initialCached && immediate);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isFirstMount = useRef(true);

    const execute = useCallback(
        async (overrideParams?: Record<string, any>) => {
            const currentKey = `${url}:${JSON.stringify({ ...params, ...overrideParams })}`;
            const cached = queryCache.get(currentKey);

            if (!cached && !data) {
                setLoading(true);
            }
            setIsFetching(true);
            setError(null);

            try {
                const response = await apiClient.get(url, {
                    params: { ...params, ...overrideParams },
                });

                const isSuccess =
                    response.data?.success === true ||
                    response.data?.status === 'success' ||
                    (response.status >= 200 && response.status < 300);

                if (isSuccess) {
                    const payload = response.data?.data !== undefined ? response.data.data : response.data;
                    let parsedData: any = payload;
                    let parsedMeta: any = null;

                    // Case 1: Payload is paginated object with rows
                    if (payload && typeof payload === 'object' && 'rows' in payload) {
                        parsedData = payload.rows;
                        parsedMeta = {
                            total: payload.totalItems ?? payload.total ?? payload.rows?.length ?? 0,
                            totalItems: payload.totalItems ?? payload.total ?? payload.rows?.length ?? 0,
                            totalPages: payload.totalPages ?? 1,
                            page: payload.currentPage ?? payload.page ?? 1,
                            currentPage: payload.currentPage ?? payload.page ?? 1,
                        };
                    } else if (response.data.metadata) {
                        // Case 2: metadata is at root level
                        const m = response.data.metadata;
                        parsedMeta = {
                            total: m.totalItems ?? m.total ?? (Array.isArray(payload) ? payload.length : 0),
                            totalItems: m.totalItems ?? m.total ?? (Array.isArray(payload) ? payload.length : 0),
                            totalPages: m.totalPages ?? 1,
                            page: m.currentPage ?? m.page ?? 1,
                            currentPage: m.currentPage ?? m.page ?? 1,
                        };
                    } else if (Array.isArray(payload)) {
                        parsedMeta = {
                            total: payload.length,
                            totalItems: payload.length,
                            totalPages: 1,
                            page: 1,
                            currentPage: 1,
                        };
                    }

                    setData(parsedData);
                    setMetadata(parsedMeta);

                    // Save to memory cache (valid for 5 minutes)
                    queryCache.set(currentKey, {
                        data: parsedData,
                        metadata: parsedMeta,
                        timestamp: Date.now(),
                    });
                } else {
                    setError(response.data?.message || 'Error fetching data');
                }
            } catch (err: any) {
                const errMsg =
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to load data. Please check your network connection.';
                setError(errMsg);
            } finally {
                setLoading(false);
                setIsFetching(false);
            }
        },
        [url, JSON.stringify(params)]
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    // Manual invalidation helper
    const refetch = useCallback(
        (overrideParams?: Record<string, any>) => {
            const currentKey = `${url}:${JSON.stringify({ ...params, ...overrideParams })}`;
            queryCache.delete(currentKey);
            return execute(overrideParams);
        },
        [execute, url, JSON.stringify(params)]
    );

    return {
        data,
        metadata,
        loading: loading && !data, // Only report loading if we don't have data yet
        isFetching,
        error,
        refetch,
    };
}
