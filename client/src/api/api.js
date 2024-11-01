import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });
export default api;

export const createUser = (data) =>
    api.post('/users/create', {
        data,
    });

export const login = (data) => api.post('/users/login', { data });
