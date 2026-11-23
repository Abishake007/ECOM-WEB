import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.DEV
      ? "http://localhost:8080/api"
      : "https://ecom-web-knao.onrender.com/api"
  ),
});

API.interceptors.request.use((config) => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    // Use 'accessToken' as the key since your backend likely sends it this way
    const token = user.accessToken || user.token || user.jwt; 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;
