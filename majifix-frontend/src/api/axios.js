// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// ==========================
// REQUEST
// ==========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ALWAYS trigger loader
    window.dispatchEvent(new Event("loading:start"));

    return config;
  },
  (error) => {
    window.dispatchEvent(new Event("loading:end"));
    return Promise.reject(error);
  }
);

// ==========================
// RESPONSE
// ==========================
api.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new Event("loading:end"));
    return response;
  },
  (error) => {
    window.dispatchEvent(new Event("loading:end"));
    return Promise.reject(error);
  }
);

export default api;