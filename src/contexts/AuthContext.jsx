import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token süresi dolmuşsa yenilemeyi dene
        const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        if (refreshResponse.ok) {
          const { newToken } = await refreshResponse.json();
          localStorage.setItem('token', newToken);
          await checkAuth(); // Yeni token ile tekrar kontrol et
          return;
        }

        console.log('Token yenilenemedi, çıkış yapılıyor...');
        await logout();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        console.log('Token geçersiz, çıkış yapılıyor...');
        await logout();
      }
    } catch (error) {
      console.error('Oturum kontrolü hatası:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.status === 'blocked') {
          return {
            success: false,
            error: 'Hesabınız askıya alınmıştır. Daha fazla bilgi için support@falci.com adresinden bizimle iletişime geçebilirsiniz.',
            isBlocked: true
          };
        }

        localStorage.setItem('token', data.token);
        setUser(data.user);
        return { success: true };
      } else {
        if (response.status === 403 && data.isBlocked) {
          return { success: false, error: data.message, isBlocked: true };
        }
        throw new Error(data.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  // Admin fonksiyonları
  const getAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kullanıcılar alınamadı');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      throw error;
    }
  };

  const updateUserCredits = async (userId, credits) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/update-credits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, credits })
      });

      if (!response.ok) {
        throw new Error('Krediler güncellenemedi');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kredi güncelleme hatası:', error);
      throw error;
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kullanıcı detayları alınamadı');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kullanıcı detayları hatası:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }

      return true;
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      throw error;
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Kullanıcı durumu güncellenemedi');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kullanıcı durumu güncelleme hatası:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        throw new Error('Kullanıcı rolü güncellenemedi');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Kullanıcı rolü güncelleme hatası:', error);
      throw error;
    }
  };

  const getAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('İstatistikler alınamadı');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('İstatistik hatası:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    getAllUsers,
    updateUserCredits,
    getUserDetails,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    getAdminStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 