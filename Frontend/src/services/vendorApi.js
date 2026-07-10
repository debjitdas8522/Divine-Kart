import useVendorStore from "@/store/vendorStore";
import axios from "axios";

const vendorApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

vendorApi.interceptors.request.use(
    (config) => {
        const token = useVendorStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

vendorApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            error.response?.data?.vendorTokenExpired
        ) {
            useVendorStore.getState().logout();
            window.location.href = "/vendor/login";
        }

        return Promise.reject(error);
    }
);

export default vendorApi;