import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoffee,
  faUser,
  faCrown,
  faSignOutAlt,
  faArrowRight,
  faCoins,
  faHistory,
  faUsers,
  faChartLine,
  faUserShield,
  faLock,
  faChartBar,
  faCalendarDay,
  faUserCheck,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    fetchUserStats();
    if (user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUserStats({
          credits: data.credits,
          readingsCount: data.fortuneCount,
          subscription: {
            plan: 'free'
          }
        });
      } else {
        console.error('Kullanıcı bilgileri alınamadı:', await response.text());
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminStats({
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          blockedUsers: data.blockedUsers,
          premiumUsers: data.premiumUsers,
          totalReadings: data.totalReadings,
          dailyReadings: data.dailyReadings,
          weeklyReadings: data.weeklyReadings,
          averageDailyReadings: data.averageDailyReadings
        });
      } else {
        console.error('Admin istatistikleri alınamadı:', await response.text());
      }
    } catch (error) {
      console.error('Admin istatistikleri alınamadı:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="welcome-title">
          Hoş Geldiniz, {user?.email?.split('@')[0] || 'Kullanıcı'}
        </h1>
        <button onClick={handleLogout} className="logout-button">
          <FontAwesomeIcon icon={faSignOutAlt} />
          Çıkış Yap
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCoins} />
          </div>
          <div className="stat-content">
            <h3>Kalan Kredi</h3>
            <div className="stat-value">{userStats?.credits || 0}</div>
            <p className="stat-description">Kalan fal hakkınız</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCoffee} />
          </div>
          <div className="stat-content">
            <h3>Fal Geçmişi</h3>
            <div className="stat-value">{userStats?.readingsCount || 0}</div>
            <p className="stat-description">Toplam bakılan fal sayısı</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCrown} />
          </div>
          <div className="stat-content">
            <h3>Üyelik Tipi</h3>
            <div className="stat-value subscription-badge">
              {userStats?.subscription?.plan === 'premium' ? 'Premium' : 'Ücretsiz'}
            </div>
          </div>
        </div>

        <Link to="/fortune-history" className="stat-card interactive">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div className="stat-content">
            <h3>Geçmiş Fallar</h3>
            <p className="stat-description">Geçmiş fallarınızı görüntüleyin ve tekrar okuyun</p>
          </div>
        </Link>
      </div>

      <div className="action-cards">
        <Link to="/fortune" className="action-card">
          <div className="action-icon">
            <FontAwesomeIcon icon={faCoffee} />
          </div>
          <div className="action-content">
            <h3>Yeni Fal Baktır</h3>
            <p>Kahve fincanınızın fotoğrafını yükleyin ve AI destekli falınızı öğrenin</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
        </Link>

        <Link to="/profile" className="action-card">
          <div className="action-icon">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="action-content">
            <h3>Profil Ayarları</h3>
            <p>Hesap bilgilerinizi güncelleyin ve abonelik durumunuzu kontrol edin</p>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className="action-card admin-card wide-card">
            <div className="admin-card-content">
              <div className="admin-card-header">
                <div className="admin-icon-group">
                  <div className="admin-main-icon">
                    <FontAwesomeIcon icon={faUserShield} />
                  </div>
                  <h3>Admin Paneli</h3>
                </div>
                <div className="admin-stats-preview">
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>{adminStats?.totalUsers || '...'} Toplam</span>
                  </div>
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faUserCheck} />
                    <span>{adminStats?.activeUsers || '...'} Aktif</span>
                  </div>
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faLock} />
                    <span>{adminStats?.blockedUsers || '...'} Engelli</span>
                  </div>
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faStar} />
                    <span>{adminStats?.premiumUsers || '...'} Premium</span>
                  </div>
                </div>
              </div>
              <div className="admin-stats-detail">
                <div className="admin-stat-group">
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faChartBar} />
                    <span>{adminStats?.totalReadings || '...'} Toplam Fal</span>
                  </div>
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faCalendarDay} />
                    <span>{adminStats?.dailyReadings || '...'} Bugün</span>
                  </div>
                  <div className="admin-stat">
                    <FontAwesomeIcon icon={faChartLine} />
                    <span>Haftalık Ort: {adminStats?.averageDailyReadings || '...'}</span>
                  </div>
                </div>
              </div>
              <div className="admin-card-description">
                <p>Sistem yönetimi, kullanıcı kontrolü ve detaylı istatistikler için admin paneline erişin</p>
                <div className="admin-quick-actions">
                  <span className="quick-action-label">Hızlı İşlemler:</span>
                  <div className="quick-actions">
                    <span>Kullanıcı Yönetimi</span>
                    <span>•</span>
                    <span>İstatistikler</span>
                    <span>•</span>
                    <span>Sistem Logları</span>
                  </div>
                </div>
              </div>
              <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 