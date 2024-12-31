import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForms.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      
      if (result.error) {
        if (result.isBlocked) {
          setShowBlockedModal(true);
        } else {
          setError(result.error);
        }
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Giriş Yap</h1>
          <p className="auth-subtitle">Hesabınıza giriş yaparak falınızı öğrenin</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faEnvelope} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon">
              <FontAwesomeIcon icon={faLock} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div className="auth-switch">
          Hesabınız yok mu?
          <Link to="/register" className="auth-link">Kayıt Ol</Link>
        </div>
      </div>

      {showBlockedModal && (
        <div className="modal-overlay">
          <div className="blocked-modal">
            <div className="modal-header">
              <h3>Hesap Askıya Alındı</h3>
              <button className="close-button" onClick={() => setShowBlockedModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <p>Hesabınız askıya alınmıştır. Daha fazla bilgi için <a href="mailto:support@falci.com">support@falci.com</a> adresinden bizimle iletişime geçebilirsiniz.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowBlockedModal(false)}>
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm; 