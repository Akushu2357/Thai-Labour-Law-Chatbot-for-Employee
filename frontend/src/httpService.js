import axios from 'axios';

const httpService = axios.create({
    baseURL: process.env.REACT_APP_BASE_API_URL || 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default httpService;