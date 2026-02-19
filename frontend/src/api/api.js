import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

/**
 * SMART API URL DETECTION
 */
const getBaseURL = () => {
  // Production mode
  if (!__DEV__) {
    return 'https://your-production-api.com/api';
  }

  // Development mode
  try {
    const { manifest, manifest2 } = Constants;
    const debuggerHost = manifest2?.extra?.expoGo?.debuggerHost ||
                        manifest?.debuggerHost;

    if (debuggerHost) {
      const host = debuggerHost.split(':')[0];

      // ✅ TUNNEL MODE DETECTED (at college)
      if (host.includes('.exp.direct')) {
        console.log('🏫 TUNNEL MODE - Using college IP');
        const COLLEGE_IP = '192.168.1.92';
        const url = `http://${COLLEGE_IP}:4000/api`; // ✅ /api is here
        console.log('🎯 Using college IP:', url);
        return url;
      }

      // ✅ NORMAL MODE (at home)
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        const url = `http://${host}:4000/api`; // ✅ /api is here
        console.log('🏠 HOME MODE - Auto-detected IP:', url);
        return url;
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not auto-detect IP:', error);
  }

  // Fallback for Android emulator
  if (Platform.OS === 'android') {
    console.log('📱 Using Android emulator IP');
    return 'http://10.0.2.2:4000/api'; // ✅ /api is here
  }

  console.warn('⚠️ Using localhost fallback');
  return 'http://localhost:4000/api'; // ✅ /api is here
};

const BASE_URL = getBaseURL();

console.log('=====================================');
console.log('🌐 FINAL API BASE URL:', BASE_URL);
console.log('=====================================');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - automatically attach token
api.interceptors.request.use(
  async (config) => {
    // ✅ DETAILED LOGGING - See the exact URL being called
    const fullURL = `${config.baseURL}${config.url}`;
    console.log(`📤 ${config.method.toUpperCase()} ${fullURL}`);

    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Token attached");
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
    console.log(`✅ ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("❌ Network Error - Cannot reach backend");
      console.error("Backend URL:", BASE_URL);
      console.error("\n💡 TROUBLESHOOTING:");
      console.error("1. Is backend running? Run: npm start (in backend folder)");
      console.error("2. Backend must listen on 0.0.0.0 (already configured)");
      console.error("3. Check Windows Firewall - backend port 4000 must be allowed");

      const networkError = new Error(
        'Cannot connect to server.\n\n' +
        'Please check:\n' +
        '• Backend is running (npm start in backend)\n' +
        '• Windows Firewall allows port 4000\n' +
        '• Computer and phone on same network'
      );
      return Promise.reject(networkError);
    }

    if (error.response) {
      console.error("❌ Response error:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Full URL attempted:", `${error.config.baseURL}${error.config.url}`);
    } else if (error.request) {
      console.error("❌ No response received");
    } else {
      console.error("❌ Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;