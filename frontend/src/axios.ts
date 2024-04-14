import axios from 'axios';

// Create an Axios instance with the base URL and other default settings
const instance = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  // You can add more default settings here
});

export default instance;