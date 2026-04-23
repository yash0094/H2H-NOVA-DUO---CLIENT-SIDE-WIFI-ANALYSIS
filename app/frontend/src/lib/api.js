"import axios from \"axios\";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const http = axios.create({ baseURL: API, timeout: 45000 });

export const getStatus = () => http.get(\"/network/status\").then(r => r.data);
export const getIssues = () => http.get(\"/network/issues\").then(r => r.data);
export const getDevices = () => http.get(\"/network/devices\").then(r => r.data);
export const getTimeline = () => http.get(\"/network/timeline\").then(r => r.data);
export const getHeatmap = () => http.get(\"/network/heatmap\").then(r => r.data);
export const getPrediction = () => http.get(\"/network/prediction\").then(r => r.data);
export const getRecommendations = () => http.post(\"/network/recommendations\").then(r => r.data);
export const startDiagnose = () => http.post(\"/network/diagnose\").then(r => r.data);
export const getDiagnose = (id) => http.get(`/network/diagnose/${id}`).then(r => r.data);
export const toggleBand = (band) => http.post(\"/network/band\", { band }).then(r => r.data);
export const restartRouter = () => http.post(\"/network/restart-router\").then(r => r.data);
"
