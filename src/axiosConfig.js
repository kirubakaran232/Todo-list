import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("Axios Request:", {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      token: token ? token.substring(0, 20) + "..." : "no token",
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Axios Response Success:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Axios Response Error:", {
      url: error.config?.url,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers,
    });

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
