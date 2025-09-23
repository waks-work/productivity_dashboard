
```typescript
// types.ts or within the same file
export interface Credentials {
  username: string;
  password: string;
  // Add other fields if needed, e.g., email
}

export interface LoginResponse {
  token: string;
  // Add other response fields as needed (e.g., user info)
} 
```

```typescript
// apiClient.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Update with your Django backend URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export default apiClient;   
```

```typescript
// authAPI.ts
import apiClient from './apiClient';
import { Credentials, LoginResponse } from './types';

export const login = async (credentials: Credentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('auth/login/', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    } else {
      console.error('Unexpected error:', error);
      throw 'An unexpected error occurred';
    }
  }
};   
```

## Example usage
```typescript
login({ username: 'user', password: 'pass' })
  .then(user => console.log('Logged in:', user))
  .catch(err => console.error('Login failed:', err));   
```


