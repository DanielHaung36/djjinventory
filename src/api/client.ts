import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
console.log(import.meta.env.VITE_API_URL);
export default axios ;
