import axios from 'axios';

//Create an axios instance with a base URL
const api = axios.create({
  baseURL: '/api',
});

export default api;