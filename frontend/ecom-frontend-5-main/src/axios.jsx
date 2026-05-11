import axios from "axios";

const API = axios.create({
  baseURL: "https://ecom-web-knao.onrender.com/api",
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