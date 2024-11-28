import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_SERVER_URL });
const api_map = axios.create({ baseURL: 'https://provinces.open-api.vn/api' });
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

//All User
export const getAllUsers = () => api.get('/users/getAllUsers');
export const updateUser = (userId, data) =>
    api.put(`/users/updatedUser/${userId}`, { data });

//Room personal
export const createRoom = (data) => api.post('/rooms/createRoom', { data });
export const getRoomsPersonal = () => api.get('/rooms/getRoomListPerson');
export const deleteRoomPersonal = (roomId) =>
    api.delete(`/rooms/deleteRoomPersonal/${roomId}`);
export const getDeleteRoomPersonal = () => api.get('/rooms/getDeleteRoom');
export const restoreRoomPersonal = (roomId) =>
    api.patch(`rooms/restoreRoomPersonal/${roomId}`);
export const forceDeleteRoom = (roomId) =>
    api.delete(`/rooms/forceDeleteRoomPersonal/${roomId}`);
export const updateRoomPersonal = (data) =>
    api.put('/rooms/updateRoomPersonal', { data });

//News personal
export const createNews = (data) => api.post('/news/createNews', { data });
export const getNewsPersonal = () => api.get('/news/getNewsPersonal');
export const updateNews = (data) => api.put('/news/updateNews', { data });
export const deleteNews = (data) => api.delete(`/news/deleteNews/${data}`);
export const getDeletedNews = () => api.get('news/getDeletedNews');
export const restoreNews = (newsId) => api.patch(`/news/restore/${newsId}`);
export const forceDeletedNews = (newsId) =>
    api.delete(`/news/forceDelete/${newsId}`);

//Map
export const getProvince = () => api_map.get('/p/');
export const getDistrict = (code) => api_map.get(`/p/${code}?depth=3`);
