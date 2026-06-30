import axios from 'axios';

// Use environment variable for production backend URL
// In development, proxy in package.json handles routing
const baseURL = process.env.REACT_APP_API_URL || '';

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

export default axios;
