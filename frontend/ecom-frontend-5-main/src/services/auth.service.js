import API from "../axios";

const API_URL = "/auth/";

const register = (username, email, password) => {
  return axios.post(API_URL + "signup", {
    username,
    email,
    password,
  });
};

// services/auth.service.js
const login = (username, password) => {
  return API
    .post(API_URL + "signin", { username, password })
    .then((response) => {
      // 1. Check if the response actually exists
      if (response.data) {
        const user = response.data;
        
        // 2. Identify the token (Supports 'accessToken' or 'token')
        const token = user.accessToken || user.token;

        if (token) {
          // 3. Force the key to be 'accessToken' so axios.jsx can find it
          const userToSave = {
            ...user,
            accessToken: token 
          };
          
          localStorage.setItem("user", JSON.stringify(userToSave));
          console.log("STORAGE SUCCESS: User data is now in LocalStorage.");
          return userToSave;
        } else {
          console.error("TOKEN MISSING: Backend sent data, but no token field was found.", user);
        }
      }
      return response.data;
    })
    .catch(err => {
      console.error("NETWORK ERROR: Could not reach the signin endpoint.", err);
      throw err;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;
