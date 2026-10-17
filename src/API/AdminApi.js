import axios from "axios";

const AdminApi = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically to every protected request
AdminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mealbridge-admin-token");

    console.log("JWT TOKEN:", token);
    console.log("REQUEST:", config.method?.toUpperCase(), config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      console.log("AUTH HEADER:", config.headers.Authorization);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default AdminApi;