import axios from "axios";

// Shared axios instance for all API calls.
// withCredentials keeps the auth cookie attached on every request.
const api = axios.create({
  baseURL: "https://nexcontact-mern.onrender.com/api",
  withCredentials: true,
});

export default api;
