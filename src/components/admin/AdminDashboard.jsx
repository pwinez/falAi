import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCoffee,
  faCrown,
  faPlus,
  faTrash,
  faBan,
  faUserShield,
  faChartLine,
  faHistory,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { 
    user, 
    getAllUsers, 
    updateUserCredits, 
    deleteUser, 
    updateUserStatus, 
    updateUserRole,
    getAdminStats 
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState({});
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats()
      ]);

      setUsers(usersData);
      setStats(statsData);
      
      const initialCredits = {};
      usersData.forEach(user => {
        initialCredits[user._id] = "1";
      });
      setCredits(initialCredits);
      setError('');
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditChange = (userId, value) => {
    setCredits(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const handleAddCredits = async (userId) => {
    try {
      if (!credits[userId] || credits[userId] < 1) {
        setError('Lütfen geçerli bir kredi miktarı giriniz');
        return;
      }

      await updateUserCredits(userId, parseInt(credits[userId]));
      await loadData();
      setError('');
    } catch (err) {
      console.error('Kredi ekleme hatası:', err);
      setError(err.message || 'Kredi eklenirken bir hata oluştu');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteUser(userId);
        await loadData();
        setError('');
      } catch (err) {
        setError('Kullanıcı silinirken bir hata oluştu');
      }
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await updateUserStatus(userId, newStatus);
      await loadData();
      setError('');
    } catch (err) {
      setError('Kullanıcı durumu güncellenirken bir hata oluştu');
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    if (window.confirm(`Kullanıcı rolünü ${currentRole === 'admin' ? 'user' : 'admin'} olarak değiştirmek istediğinizden emin misiniz?`)) {
      try {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await updateUserRole(userId, newRole);
        await loadData();
        setError('');
      } catch (err) {
        setError('Kullanıcı rolü güncellenirken bir hata oluştu');
      }
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Admin Paneli</h1>
        <p className="admin-welcome">Hoş geldiniz, {user?.name || 'Admin'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="stat-content">
            <h3>Toplam Kullanıcı</h3>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCoffee} />
          </div>
          <div className="stat-content">
            <h3>Toplam Fal Bakımı</h3>
            <div className="stat-value">{stats?.totalReadings || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faCrown} />
          </div>
          <div className="stat-content">
            <h3>Premium Üyeler</h3>
            <div className="stat-value">{stats?.premiumUsers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="stat-content">
            <h3>Günlük Fal Ortalaması</h3>
            <div className="stat-value">
              {stats?.dailyStats?.length > 0
                ? Math.round(stats.dailyStats.reduce((acc, curr) => acc + curr.count, 0) / stats.dailyStats.length)
                : 0}
            </div>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        <h2 className="section-title">Kullanıcı Listesi</h2>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>E-posta</th>
                <th>Üyelik</th>
                <th>Durum</th>
                <th>Rol</th>
                <th>Kalan Hak</th>
                <th>Kullanılan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} onClick={() => handleUserClick(user)}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`subscription-badge ${user.subscription?.plan || 'free'}`}>
                      {user.subscription?.plan === 'premium' ? 'Premium' : 'Ücretsiz'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? 'Aktif' : 'Engelli'}
                    </span>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                    </span>
                  </td>
                  <td>{user.credits || 0}</td>
                  <td>{user.fortuneCount || 0}</td>
                  <td>
                    <div className="user-actions">
                      <input
                        type="number"
                        min="1"
                        className="credits-input"
                        value={credits[user._id]}
                        onChange={(e) => handleCreditChange(user._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className="action-button add-credits"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCredits(user._id);
                        }}
                        title="Kredi Ekle"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                      <button
                        className={`action-button ${user.status === 'active' ? 'block' : 'unblock'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(user._id, user.status);
                        }}
                        title={user.status === 'active' ? 'Engelle' : 'Engeli Kaldır'}
                      >
                        <FontAwesomeIcon icon={user.status === 'active' ? faBan : faCheck} />
                      </button>
                      <button
                        className="action-button role"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleChange(user._id, user.role);
                        }}
                        title="Rol Değiştir"
                      >
                        <FontAwesomeIcon icon={faUserShield} />
                      </button>
                      <button
                        className="action-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user._id);
                        }}
                        title="Sil"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showUserDetails && selectedUser && (
        <div className="user-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Kullanıcı Detayları</h2>
              <button className="close-button" onClick={() => setShowUserDetails(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-info">
                <h3>Genel Bilgiler</h3>
                <p><strong>Ad Soyad:</strong> {selectedUser.name}</p>
                <p><strong>E-posta:</strong> {selectedUser.email}</p>
                <p><strong>Üyelik:</strong> {selectedUser.subscription?.plan === 'premium' ? 'Premium' : 'Ücretsiz'}</p>
                <p><strong>Durum:</strong> {selectedUser.status === 'active' ? 'Aktif' : 'Engelli'}</p>
                <p><strong>Rol:</strong> {selectedUser.role === 'admin' ? 'Admin' : 'Kullanıcı'}</p>
                <p><strong>Kalan Kredi:</strong> {selectedUser.credits || 0}</p>
                <p><strong>Toplam Fal:</strong> {selectedUser.fortuneCount || 0}</p>
                <p><strong>Kayıt Tarihi:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('tr-TR')}</p>
                <p><strong>Son Giriş:</strong> {new Date(selectedUser.lastLoginDate).toLocaleDateString('tr-TR')}</p>
              </div>

              {selectedUser.fortuneHistory && selectedUser.fortuneHistory.length > 0 && (
                <div className="fortune-history">
                  <h3>Fal Geçmişi</h3>
                  <div className="history-list">
                    {selectedUser.fortuneHistory.map((fortune, index) => (
                      <div key={index} className="history-item">
                        <p><strong>Tarih:</strong> {new Date(fortune.date).toLocaleDateString('tr-TR')}</p>
                        <p><strong>Tür:</strong> {fortune.type === 'coffee' ? 'Kahve Falı' : 'Tarot Falı'}</p>
                        {fortune.imageUrl && (
                          <img src={fortune.imageUrl} alt="Fal Görseli" className="fortune-image" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.paymentHistory && selectedUser.paymentHistory.length > 0 && (
                <div className="payment-history">
                  <h3>Ödeme Geçmişi</h3>
                  <div className="history-list">
                    {selectedUser.paymentHistory.map((payment, index) => (
                      <div key={index} className="history-item">
                        <p><strong>Tarih:</strong> {new Date(payment.date).toLocaleDateString('tr-TR')}</p>
                        <p><strong>Tutar:</strong> {payment.amount} TL</p>
                        <p><strong>Tür:</strong> {payment.type === 'credit' ? 'Kredi Yükleme' : 'Abonelik'}</p>
                        <p><strong>Durum:</strong> {payment.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 