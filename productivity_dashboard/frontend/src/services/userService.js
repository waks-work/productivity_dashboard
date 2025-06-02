import { fetchAPI } from "./api";

export const getUsers = async () => {
    return fetchAPI('/api/users/')
}

export const getUserProfile = async (userId) => {
    return fetchAPI(`/api/users/${userId}/`);
};

export const updateUser = async (userId, data) => {
    return fetchAPI(`/api/users/${userId}/`,{
        method: 'PATCH',
        body:JSON.stringify(data)
    });
};