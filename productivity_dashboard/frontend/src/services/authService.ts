import { fetchAPI } from "./api";
import { getCookie } from './admin'

export const login = async (credentials) => {
    const response = await fetchAPI('auth/login/', 'POST', credentials);
    localStorage.setItem('token', response.token);
    return response
}

export const register = async (userData) => {
    return fetchAPI('/auth/register/', 'POST', userData);
}

export const logout = () => {
    localStorage.removeItem('token');
};

export const loginUser = async (credentials) => {
    return fetchAPI('/api-auth/login/', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
        'X-CSRFToken': getCookie('csrftoken')
        }
    });
};

export const logoutUser = async () => {
    return fetchAPI('/api-auth/logout/', {
        method: 'POST',
        headers: {
        'X-CSRFToken': getCookie('csrftoken')
        }
    });
};

export const checkAuth = async () => {
    try {
        await fetchAPI('/auth/user/');
        return true
    }catch{
        return false
    }
};



