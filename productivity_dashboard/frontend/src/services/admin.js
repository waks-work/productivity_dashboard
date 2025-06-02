import { fetchAPI } from './api'

export const getAdminData = async () => {
    return fetchAPI('/admin/',{
        headers:{
            'X-CSRF Token': getCookie()
        }
    })
}

export const getCookie = (name) => {
    const value = `;${document.cookie}`;
    const parts = value.split(`; ${name}`)
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    };
};

