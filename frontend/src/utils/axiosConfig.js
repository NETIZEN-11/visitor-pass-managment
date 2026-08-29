import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || '';

if (baseURL) {
  axios.defaults.baseURL = baseURL;
}

export default axios;
