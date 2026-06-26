import { a_pcall, HttpError, HttpErrorCode } from "./error";

export interface HttpResponse<T> {
    data: T;
    status: number;
    ok: boolean;
    headers: Headers;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestConfig {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    data?: unknown;
    withCredentials?: boolean;
}
export async function request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json", ...(config.headers ?? {}),
    };

    const response = await fetch(config.url, {
        method: config.method,
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        credentials: config.withCredentials ? "include" : "same-origin",
    });

    const json = await a_pcall(response.json.bind(response));
    let payload: unknown = json;
    if (json.ok) {
        payload = json.value;
    } else {
        const text = await a_pcall(response.text.bind(response));
        payload = text.ok ? text.value : null;
    }

    if (!response.ok) {
        throw new HttpError(`HTTP ${response.status}`, response.status as HttpErrorCode, payload);
    }

    return {
        data: payload as T,
        status: response.status,
        ok: response.ok,
        headers: response.headers,
    };
}


export function get<T>(url: string, headers?: Record<string, string>) {
    return request<T>({ method: "GET", url, headers });
}

export function post<T>(url: string, data?: unknown, headers?: Record<string, string>) {
    return request<T>({ method: "POST", url, headers, data });
}

export function put<T>(url: string, data?: unknown, headers?: Record<string, string>) {
    return request<T>({ method: "PUT", url, headers, data });
}

export function patch<T>(url: string, data?: unknown, headers?: Record<string, string>) {
    return request<T>({ method: "PATCH", url, headers, data });
}

export function delete_method<T>(url: string, headers?: Record<string, string>) {
    return request<T>({ method: "DELETE", url, headers });
}


