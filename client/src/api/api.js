import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });
export default api;

async function refreshAccessToken() {
    try {
        const response = await api.post(
            '/users/refreshToken',
            {},
            {
                withCredentials: true,
            }
        );

        const accessToken = response.data.accessToken;
        console.log(accessToken);
        return accessToken;
    } catch (error) {
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
        ) {
            console.error('Refresh token has expired or is invalid.');
            localStorage.clear();
            window.location.href = '/login';
        } else {
            console.error('Failed to refresh access token:', error);
        }
        throw error;
    }
}

//Send request with authorization
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//take response and handle
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newAccessToken = await refreshAccessToken();
            localStorage.setItem('token', newAccessToken);
            originalRequest.headers[
                'Authorization'
            ] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
        }
        if (error.response.status === 403) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const createUser = (data) =>
    api.post('/users/create', {
        data,
    });

export const logout = () => api.get('/users/logout', { withCredentials: true });

export const login = (data) =>
    api.post('/users/login', { data }, { withCredentials: true });

export const getUser = () => api.get('/users/getUser');
export const updateProfile = (data) =>
    api.put('/users/updateProfile', { data });

//Room personal
export const createRoom = (data) => api.post('/rooms/createRoom', { data });
export const getRoomsPersonal = () => api.get('/rooms/getRoomListPerson');
