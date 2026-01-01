import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Backend is running on port 4000
const BASE_URL = Platform.select({
  ios: "http://192.168.1.92:4000/api",
  android: "http://192.168.1.92:4000/api",
  default: "http://localhost:4000/api",
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - automatically attach token
api.interceptors.request.use(
  async (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);

    // ✅ FIXED: Use "authToken" instead of "token"
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token attached:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ No auth token found!");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("❌ Response error:", error.message);
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("❌ No response received");
    } else {
      console.error("❌ Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;