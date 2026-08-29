import axios from "axios";

const AdminApi = axios.create({
  baseURL: "http://localhost:5002/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically to every protected request
AdminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mealbridge-admin-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AdminApi;