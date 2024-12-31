import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSpinner, faImage, faMagicWandSparkles, faTimes, faComments, faArrowLeft, faCreditCard, faInfoCircle, faHistory } from '@fortawesome/free-solid-svg-icons';
import geminiAIService from '../../services/geminiAI';
import { useAuth } from '../../contexts/AuthContext';
import './FortuneTelling.css';

const FortuneTelling = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [credits, setCredits] = useState(null);
  const [fortuneCount, setFortuneCount] = useState(0);
  const [showAnalyzePopup, setShowAnalyzePopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [fortuneHistory, setFortuneHistory] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      if (!auth.user) {
        navigate('/login');
        return;
      }

      await fetchUserInfo();
      await fetchFortuneHistory();
    };

    checkUserAndFetchData();
  }, [auth.user, navigate]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        auth.logout();
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/info', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        auth.logout();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setCredits(data.credits);
        setFortuneCount(data.fortuneCount);
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error);
      setError('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
      auth.logout();
    }
  };

  const fetchFortuneHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        auth.logout();
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/fortune-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        auth.logout();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setFortuneHistory(data.fortuneHistory);
      }
    } catch (error) {
      console.error('Fal geçmişi alınamadı:', error);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Fotoğraf boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Lütfen geçerli bir fotoğraf dosyası seçin.');
        return;
      }

      setImage(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Lütfen bir fotoğraf yükleyin.');
      return;
    }

    if (credits <= 0) {
      setError('Fal baktırmak için yeterli krediniz bulunmuyor. Lütfen kredi yükleyin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowResult(true);
      setAnalyzing(true);
      setShowAnalyzePopup(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        setShowResult(false);
        setShowAnalyzePopup(false);
        setTimeout(() => {
          auth.logout();
        }, 2000);
        return;
      }

      // Gemini AI ile fal yorumu al
      console.log('Gemini AI servisi çağrılıyor...');
      const response = await fetch('http://localhost:3001/api/fortune/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: preview })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message);
        setShowResult(false);
        setShowAnalyzePopup(false);
        return;
      }
      
      setResult(data.reading);
      setAnalyzing(false);
      setShowAnalyzePopup(false);
      
      // Fal geçmişini ve kullanıcı bilgilerini güncelle
      await Promise.all([
        fetchFortuneHistory(),
        fetchUserInfo()
      ]);
      
    } catch (err) {
      console.error('Fal analizi hatası:', err);
      setShowResult(false);
      setShowAnalyzePopup(false);
      setError('Fal analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fortune-telling-container">
      {/* Geri dönüş butonu */}
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Geri Dön
      </button>

      <h1 className="fortune-title">
        <FontAwesomeIcon icon={faCoffee} className="coffee-icon" />
        AI Kahve Falı
        <div className="credits-badge">
          <FontAwesomeIcon icon={faCreditCard} className="credit-icon" />
          {credits !== null ? credits : '...'} Kredi
        </div>
      </h1>

      <div className="fortune-content">
        <div className="fortune-intro">
          <p>Kahve fincanınızı tersine çevirip, fincanın fotoğrafını yükleyin.</p>
          <p>Yapay zeka teknolojisi ile desteklenen falcımız, fincanınızdaki şekilleri analiz ederek size özel yorumlar yapacaktır.</p>
          <p className="credit-info">* Her fal bakımı 1 kredi düşmektedir.</p>
        </div>

        <div className="upload-section">
          <form onSubmit={handleSubmit}>
            <div 
              className={`image-upload-area ${error ? 'error' : ''}`} 
              onClick={triggerFileInput}
            >
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Yüklenen fincan" className="preview-image" />
                  <div className="preview-overlay">
                    <FontAwesomeIcon icon={faImage} />
                    <span>Fotoğrafı Değiştir</span>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FontAwesomeIcon icon={faImage} className="upload-icon" />
                  <p>Fincan fotoğrafını yükleyin</p>
                  <span className="upload-hint">veya buraya sürükleyin</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                id="image-upload"
                ref={fileInputRef}
              />
            </div>

            <button 
              type="submit" 
              className="analyze-button"
              disabled={loading || !image || credits <= 0}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  {analyzing ? 'Fincan Analiz Ediliyor...' : 'Fal Yorumlanıyor...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMagicWandSparkles} />
                  {credits > 0 ? 'Falıma Bak' : 'Kredi Yükleyin'}
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            {error}
            {error.includes('kredi') && (
              <button 
                className="credit-button"
                onClick={() => navigate('/payment')}
              >
                <FontAwesomeIcon icon={faCreditCard} /> Kredi Yükle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sağ taraftaki fal sonuç penceresi */}
      {showResult && (
        <div className="fortune-result-sidebar">
          <div className="fortune-result-header">
            <h2>
              <FontAwesomeIcon icon={faComments} className="result-icon" />
              Falınız
            </h2>
            <button 
              className="close-button"
              onClick={() => setShowResult(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="fortune-result-content">
            {loading ? (
              <div className="loading-container">
                <FontAwesomeIcon icon={faSpinner} spin />
                <p>{analyzing ? 'Fincanınız Analiz Ediliyor...' : 'Falınız Yorumlanıyor...'}</p>
                <p className="loading-hint">
                  {analyzing 
                    ? 'Yapay zeka fincanınızdaki şekilleri tespit ediyor...'
                    : 'Tespit edilen şekiller yorumlanıyor...'}
                </p>
              </div>
            ) : (
              <div className="fortune-interpretation">
                {result && (
                  <>
                    <div className="fortune-sections">
                      {result.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="fortune-paragraph">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="fortune-disclaimer">
                      <p>* Bu fal yorumu yapay zeka tarafından üretilmiştir ve sadece eğlence amaçlıdır.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analiz Popup'ı */}
      {showAnalyzePopup && (
        <div className="analyze-popup">
          <div className="analyze-popup-content">
            <FontAwesomeIcon icon={faSpinner} spin className="analyze-spinner" />
            <h3>Falınız Analiz Ediliyor</h3>
            <p>Kalan Krediniz: {credits > 0 ? credits - 1 : 0}</p>
            <p className="analyze-status">
              {analyzing ? (
                <>
                  <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
                  Yapay zeka fincanınızdaki şekilleri analiz ediyor...
                </>
              ) : (
                'Falınız hazırlanıyor...'
              )}
            </p>
            <div className="analyze-progress">
              <div className="analyze-progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Fal Geçmişi Modal */}
      {showHistory && (
        <div className="fortune-history-modal">
          <div className="fortune-history-content">
            <div className="fortune-history-header">
              <h2>
                <FontAwesomeIcon icon={faHistory} className="history-icon" />
                Geçmiş Fallarım
              </h2>
              <button 
                className="close-button"
                onClick={() => setShowHistory(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="fortune-history-list">
              {fortuneHistory.length > 0 ? (
                fortuneHistory.map((fortune, index) => (
                  <div key={index} className="fortune-history-item">
                    <div className="fortune-history-date">
                      {new Date(fortune.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="fortune-history-preview">
                      <img 
                        src={fortune.imageUrl} 
                        alt={`Fal ${index + 1}`}
                        className="fortune-history-image"
                      />
                      <div className="fortune-history-content">
                        {fortune.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="fortune-history-empty">
                  <p>Henüz fal baktırmamışsınız.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FortuneTelling; 