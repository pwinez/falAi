import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

class AuthService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async login(email, password) {
    try {
      const response = await this.client.post('/login', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Giriş Hatası:', error);
      throw new Error(error.response?.data?.error || 'Giriş yapılamadı');
    }
  }

  async register(email, password) {
    try {
      const response = await this.client.post('/register', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      console.error('Kayıt Hatası:', error);
      throw new Error(error.response?.data?.error || 'Kayıt yapılamadı');
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user?.token;
  }
}

export default new AuthService(); 