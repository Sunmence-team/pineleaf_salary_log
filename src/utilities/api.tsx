import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupInterceptors = (logout: () => void) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.toLowerCase().includes("unauthenticated")
      ) {
        toast.error("Session expired. Please log in again.");
        logout();
      }
      return Promise.reject(error);
    }
  );
};

export default api;
