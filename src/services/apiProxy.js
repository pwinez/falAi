import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

class ApiProxy {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 saniye
    });
  }

  async sendToOpenAI(endpoint, data) {
    try {
      const response = await axios.post(`${API_URL}/openai/${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('API İsteği Hatası:', error);
      throw new Error(error.response?.data?.error || 'Sunucu hatası oluştu');
    }
  }

  async checkStatus() {
    try {
      const response = await axios.get(`${API_URL}/status`);
      return response.data;
    } catch (error) {
      console.error('API Durum Kontrolü Hatası:', error);
      throw new Error('API sunucusuna ulaşılamıyor');
    }
  }
}

export default new ApiProxy(); 