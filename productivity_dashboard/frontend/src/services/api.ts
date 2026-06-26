import { a_pcall, AppError, AppErrorType, Err, HttpError, HttpErrorCode, Ok, pcall, Result } from "./error";
import { HttpMethod, HttpRequestConfig, HttpResponse, post, request } from "./http";

const BASE_URL = "http://localhost:8000/api";

interface AuthResponse {
    access: string;
    refresh: string;
}

interface RefreshResponse {
    access: string;
}

export default class ApiRoute {
    mainRoute: string;
    routes: string;
    httpMethod: HttpMethod;

    constructor(
        mainRoute: string,
        routes: string,
        httpMethod: HttpMethod,
    ) {
        this.mainRoute = mainRoute;
        this.routes = routes;
        this.httpMethod = httpMethod;
    }

    // =============================
    // 🔑 AUTH METHODS
    // =============================

    private static async authRequest<T>(endpoint: string, data: Record<string, any>): Promise<Result<T, Error>> {
        const result = await a_pcall(post<T>, `${BASE_URL}/users/${endpoint}/`, data);
        if (!result.ok) { return Err(result.error) }

        /// Store tokens
        const response = result.value;
        if (typeof response.data === "object" && response.data !== null &&
            "access" in response.data && "refresh" in response.data) {
            const { access, refresh } = response.data as any;
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);
        }

        return Ok(response.data);
    }

    static async register(email: string, password: string) {
        return await this.authRequest<AuthResponse>("register", {
            email,
            password,
        });
    }

    static async login(email: string, password: string) {
        return await this.authRequest<AuthResponse>("login", { email, password });
    }
    static async refreshToken(): Promise<Result<string, Error>> {
        const refresh = pcall(localStorage.getItem, "refresh");
        if (!refresh) {
            return Err(new AppError(AppErrorType.ValidationError, "No refresh token available"));
        }

        const result = await a_pcall(post<RefreshResponse>, `${BASE_URL}/auth/refresh/`, { refresh });
        if (!result.ok) { return Err(result.error) };
        const response = result.value;

        localStorage.setItem("access", response.data.access);
        return Ok(response.data.access);
    }

    static logout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    }

    // ERROR HANDLING
    private async handlingErrors<T>(config: HttpRequestConfig): Promise<Result<HttpResponse<T>, Error>> {
        const response = await a_pcall(request<T>, config);
        if (!response.ok) {
            const error = response.error;
            if (error instanceof HttpError) {
                switch (error.status) {
                    case HttpErrorCode.Unauthorized: {
                        const tokenres = await ApiRoute.refreshToken();
                        if (!tokenres.ok) {
                            ApiRoute.logout();
                            return Err(tokenres.error);
                        }

                        config.headers ??= {};
                        config.headers["Authorization"] = `Bearer ${tokenres.value}`;

                        const retry = await a_pcall(request<T>, config);
                        return retry.ok ? Ok(retry.value) : Err(retry.error);
                    }
                    case HttpErrorCode.Forbidden: {
                        return Err(new AppError(AppErrorType.ValidationError, "Forbidden", error.status, error.data));
                    }
                    case HttpErrorCode.NotFound: {
                        return Err(
                            new AppError(AppErrorType.ValidationError, "Resource not found", error.status, error.data));
                    }
                    case HttpErrorCode.BadRequest: {
                        return Err(new AppError(AppErrorType.ValidationError, "Bad request", error.status, error.data));
                    }
                    case HttpErrorCode.InternalServerError: {
                        return Err(new AppError(AppErrorType.Unknown, "Internal server error", error.status, error.data));
                    }
                }
            }
            return Err(error);
        }
        return Ok(response.value);
    }

    // =============================
    // 🌐 ROUTING METHOD
    // =============================

    async routing<T>(data?: any): Promise<Result<HttpResponse<T>, Error>> {
        const rawUrl = `${BASE_URL}/${this.mainRoute}/${this.routes}`;
        const url = rawUrl.replace(/([^:]\/)\/+/g, "$1");

        const headers: { [key: string]: string } = {
            "Content-Type": "application/json",
        };

        const token = localStorage.getItem("access");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            method: this.httpMethod,
            url: url,
            headers,
            data: data,
            withCredentials: true,
        };

        return await this.handlingErrors<T>(config);
    }
}
