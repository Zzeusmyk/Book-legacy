import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For physical devices, use your machine's local network IP
// For emulators: Android uses 10.0.2.2, iOS uses localhost
const LOCAL_IP = '192.168.100.4';

const BASE_URL = Platform.select({
  android: __DEV__ ? `http://${LOCAL_IP}:5000` : `http://${LOCAL_IP}:5000`,
  ios: __DEV__ ? `http://${LOCAL_IP}:5000` : `http://${LOCAL_IP}:5000`,
  default: 'http://localhost:5000',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }
    return Promise.reject(error);
  }
);

export const getBaseUrl = () => BASE_URL;

export default api;
