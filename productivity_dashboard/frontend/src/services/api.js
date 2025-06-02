const BASE_URL = 'http://localhost:8000/api'

export const fetchAPI = async (endpoint, method = 'GET', data = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token')
    if (token) {
        headers['Authorization'] = `Token ${token}`
    }

    const config = {
        method,
        headers,
        credentials: 'include',
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try{
        const response = await fetch(`${BASE_URL}${endpoint}`,config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Request failed');
        }
        return response.json();
    }catch (error) {
        console.error('API Error:',error)
        throw error
    }

}



