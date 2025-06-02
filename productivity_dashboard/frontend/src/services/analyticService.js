import { fetchAPI } from "./api";

export const getActivityAnalytics = async (params ={}) =>{
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/analytics/activity/?${query}`);
}

export const getProductivityMetrics = async (dateRange) => {
    return fetchAPI(`/api/analytics/productivity/?start=${dateRange.start}&end=${dateRange.end}`);
};

export const getRecentActivity = async (limit = 20) => {
    return fetchAPI(`/api/analytics/recent-activity/?limit=${limit}`);
};
