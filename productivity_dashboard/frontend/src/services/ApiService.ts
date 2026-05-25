import ApiRoute from "./api.ts";

export default class ApiService {
    static tasks = {
        getAll: <T>() => new ApiRoute("tasks", "", "GET").routing<T[]>(),
        getById: <T>(id: string) =>
            new ApiRoute("tasks", `${id}/`, "GET").routing<T>(),
        create: <T>(data: T) => new ApiRoute("tasks", "", "POST").routing<T>(data),
        update: <T>(id: string, data: T) =>
            new ApiRoute("tasks", `${id}/`, "PUT").routing<T>(data),
        delete: (id: string) =>
            new ApiRoute("tasks", `${id}/`, "DELETE").routing<void>(),
    };

    static notes = {
        getTaskNotes: <T>(taskId: number) => new ApiRoute("notes", `?task=${taskId}`, "GET").routing<T[]>(),
        createNote: <T>(data: T) => new ApiRoute("notes", "", "POST").routing<T>(data),
    };

    static quick_notes = {
        getAll: <T>() => new ApiRoute("quick-notes", "", "GET").routing<T>(),
        create: <T>(data: Partial<T>) =>
            new ApiRoute("quick-notes/", "", "POST").routing<T>(data),
        update: <T>(id: number, data: Partial<T>) =>
            new ApiRoute("quick-notes", `${id}/`, "PATCH").routing<T>(data)
    };

    static journal = {
        list: <T>() => new ApiRoute("journals", "", "GET").routing<T>(),
        get: <T>(id: number) => new ApiRoute("journals", `${id}/`, "GET").routing<T>(),
        create: <T>(data: Partial<T>) => new ApiRoute("journals/", "", "POST").routing<T>(data),
        update: <T>(id: number, data: T) => new ApiRoute("journals", `${id}/`, "PATCH").routing<T>(data),
        delete: (id: number) => new ApiRoute("journals", `${id}/`, "DELETE").routing<void>()
    };

    static whiteboards = {
        getAll: <T>() =>
            new ApiRoute("whiteboards", "", "GET").routing<T>(),

        create: <T>(data: Partial<T>) =>
            new ApiRoute("whiteboards", "", "POST").routing<T>(data),

        update: <T>(id: number, data: Partial<T>) =>
            new ApiRoute("whiteboards", `${id}/`, "PATCH").routing<T>(data),
    };

    static analytics = {
        getActivityLog: <T>() =>
            new ApiRoute("analytics", "activity-logs/", "GET").routing<T[]>(),
        getProductivityMetrics: <T>() =>
            new ApiRoute("analytics", "productivity-metrics/", "GET").routing<T[]>(),
    };

    static users = { // /api/users/
        getUsers: <T>() => new ApiRoute("users", "", "GET").routing<T[]>(),
        getUserProfile: <T>() =>
            new ApiRoute("users", "profile/", "GET").routing<T>(), // email , timezone, profile_pic           profile/
        updateUser: <T>(data: T) =>
            new ApiRoute("users", "profile/", "PUT").routing<T>(data),
        savedPayments: <T>() =>
            new ApiRoute("users", "payment-methods/", "GET").routing<T>(),
        addPayments: <T>(data: T) =>
            new ApiRoute("users", "payment-methods/", "POST").routing<T>(data),
        updatePayments: <T>(id: string, data: T) =>
            new ApiRoute("users", `payment-methods/${id}/`, "PUT").routing<T>(data), // paymentmethods
        subscriptions: <T>(data: { phone_number: string }) =>
            new ApiRoute("users", "subscriptions/", "POST").routing<T>(data), // subscriptions has filling points like plan, status and renews on, and it is post
        upgradePremium: <T>(id: string) =>
            new ApiRoute("users", `admin/upgrade-premium/${id}/`, "POST").routing<T>(), //admin/upgrade-premium
        initiatePremium: <T>() =>
            new ApiRoute("users", "subscriptions/premium/", "PATCH").routing<T>(), /// OF TYPE PATCH
    };
}
