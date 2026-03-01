import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

async function handleProxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const { path } = await params;
        const urlPath = path.join('/');
        const searchParams = request.nextUrl.search;

        // Construct the backend URL directly from the path
        const backendUrl = `${BACKEND_URL}/${urlPath}${searchParams}`;

        // Forward the headers, omitting 'host'
        const headers = new Headers(request.headers);
        headers.delete('host');

        const fetchOptions: RequestInit & { duplex?: 'half' } = {
            method: request.method,
            headers,
        };

        // Forward the stream body directly
        if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
            fetchOptions.body = request.body;
            fetchOptions.duplex = 'half';
        }

        const response = await fetch(backendUrl, fetchOptions);

        // // Filter headers to return to the client
        // const responseHeaders = new Headers(response.headers);
        // responseHeaders.delete('content-encoding');

        // // Check if the response is binary/file
        // const contentType = responseHeaders.get("content-type") || "";
        // if (contentType.includes("application/pdf") || contentType.includes("image/")) {
        //     // Forward the binary buffer exactly as is
        //     const arrayBuffer = await response.arrayBuffer();
        //     return new Response(arrayBuffer, {
        //         status: response.status,
        //         statusText: response.statusText,
        //         headers: responseHeaders,
        //     });
        // }
        

        // const text = await response.text();
        // return new Response(text, {
        //     status: response.status,
        //     statusText: response.statusText,
        //     headers: responseHeaders,
        // });
        const responseHeaders = new Headers(response.headers);
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('content-length');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Admin Proxy Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const OPTIONS = handleProxy;