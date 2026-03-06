import axios, { AxiosResponse } from "axios";

const BASE_URL = "http://localhost:8000/api";

interface AuthResponse {
  access: string;
  refresh: string;
}

export default class ApiRoute {
  mainRoute: string;
  routes: string;
  httpMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

  constructor(
    mainRoute: string,
    routes: string,
    httpMethod: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  ) {
    this.mainRoute = mainRoute;
    this.routes = routes;
    this.httpMethod = httpMethod;
  }

  // =============================
  // 🔑 AUTH METHODS
  // =============================

  private static async authRequest<T>(
    endpoint: string,
    data: Record<string, any>,
  ): Promise<T> {
    try {
      const response = await axios.post(`${BASE_URL}/users/${endpoint}/`, data);

      // Store tokens
      if ("access" in response.data && "refresh" in response.data) {
        const { access, refresh } = response.data as any;
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);
      }

      return response.data;
    } catch (error: any) {
      console.error(
        `${endpoint} failed:`,
        error.response?.data || error.message,
      );
      throw new Error(`${endpoint} failed. Check credentials.`);
    }
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
  static async refreshToken() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token available");

    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
        refresh,
      });

      localStorage.setItem("access", response.data.access);
      return response.data.access;
    } catch (error: any) {
      console.error(
        "Token refresh failed:",
        error.response?.data || error.message,
      );
      throw new Error("Session expired. Please login again.");
    }
  }

  static logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }

  // =============================
  // 🛠️ ERROR HANDLING
  // =============================

  private async handlingErrors<T>(config: any): Promise<AxiosResponse<T>> {
    try {
      const response = await axios<T>(config);
      return response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Try refresh if token expired
        try {
          const newToken = await ApiRoute.refreshToken();
          config.headers["Authorization"] = `Bearer ${newToken}`;
          return await axios<T>(config); // retry once
        } catch {
          ApiRoute.logout();
          throw new Error("Unauthorized. Please login again.");
        }
      }

      if (error.response) {
        console.error("Error response:", error.response.data);
        throw new Error(
          `HTTP ${error.response.status}: ${error.response.data.message || "Unknown error"
          }`,
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        throw new Error("Network error: No response from server");
      } else {
        console.error("Request setup error:", error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  // =============================
  // 🌐 ROUTING METHOD
  // =============================

  async routing<T>(data?: any): Promise<AxiosResponse<T>> {
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
