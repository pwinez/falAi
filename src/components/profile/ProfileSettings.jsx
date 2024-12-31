import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faArrowLeft,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Yeni şifreler eşleşmiyor');
        }
        await updatePassword(formData.currentPassword, formData.newPassword);
      }

      if (formData.name !== user.name || formData.email !== user.email) {
        await updateProfile(formData.name, formData.email);
      }

      setMessage({
        type: 'success',
        text: 'Profil bilgileri başarıyla güncellendi'
      });

      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Güncelleme sırasında bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
        Geri Dön
      </button>

      <div className="profile-card">
        <h1 className="profile-title">Profil Ayarları</h1>
        <p className="profile-subtitle">Hesap bilgilerinizi buradan güncelleyebilirsiniz</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            <FontAwesomeIcon 
              icon={message.type === 'success' ? faCheck : faExclamationTriangle} 
            />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2 className="section-title">Kişisel Bilgiler</h2>
            
            <div className="form-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faUser} />
                <input
                  type="text"
                  name="name"
                  placeholder="Ad Soyad"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
                <input
                  type="email"
                  name="email"
                  placeholder="E-posta"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Şifre Değiştirme</h2>
            
            <div className="form-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Mevcut Şifre"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Yeni Şifre"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Yeni Şifre (Tekrar)"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="subscription-info">
            <h2 className="section-title">Üyelik Bilgileri</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Üyelik Tipi:</span>
                <span className={`info-value ${user?.subscription?.plan}`}>
                  {user?.subscription?.plan === 'premium' ? 'Premium' : 'Ücretsiz'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Kalan Fal Hakkı:</span>
                <span className="info-value">{user?.credits || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bakılan Fal:</span>
                <span className="info-value">{user?.readingsCount || 0}</span>
              </div>
            </div>
          </div>

          <button type="submit" className="save-button" disabled={loading}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings; 