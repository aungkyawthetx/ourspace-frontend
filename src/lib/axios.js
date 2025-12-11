import axios from 'axios';

const client = axios.create({
    // laravel backend url
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',

    // required for Laravel Sanctum's session-based auth
    withCredentials: true,

    // 3. Standard Headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Request Interceptor: Read XSRF-TOKEN cookie and set it as X-XSRF-TOKEN header
// This is required for Laravel Sanctum CSRF protection
client.interceptors.request.use(
    (config) => {
        // get cookie value
        const xsrfToken = getCookie('XSRF-TOKEN');
        if (xsrfToken) {
            // Set it as a header for Laravel Sanctum
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// helper function to read cookies by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Response Interceptor (optional)
// catches errors globally. server says 401 Unauthorized,
client.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;

        if (response && response.status === 401) {
            // clear local storage and redirect to login
            localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        throw error;
    }
);

export default client;