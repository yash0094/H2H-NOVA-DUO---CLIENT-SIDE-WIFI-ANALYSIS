"import axios from \"axios\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const getDashboard = () => api.get(\"/dashboard\").then(r => r.data);
export const getTips = () => api.get(\"/optimization-tips\").then(r => r.data);
export const getDevices = () => api.get(\"/devices\").then(r => r.data);
export const addDevice = (payload) => api.post(\"/devices\", payload).then(r => r.data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`).then(r => r.data);
export const toggleDevice = (id) => api.post(`/devices/${id}/toggle`).then(r => r.data);
export const runScan = () => api.post(\"/scan\").then(r => r.data);
export const getScans = () => api.get(\"/scans\").then(r => r.data);
export const securityScan = () => api.post(\"/security/scan\").then(r => r.data);
export const getSecurityLatest = () => api.get(\"/security/latest\").then(r => r.data);
export const getNotifications = () => api.get(\"/notifications\").then(r => r.data);
export const markNotifRead = (id) => api.post(`/notifications/${id}/read`).then(r => r.data);
export const readAllNotifs = () => api.post(\"/notifications/read-all\").then(r => r.data);
export const getSettings = () => api.get(\"/settings\").then(r => r.data);
export const updateSettings = (payload) => api.put(\"/settings\", payload).then(r => r.data);
"
