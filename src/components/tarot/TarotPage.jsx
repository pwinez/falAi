import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faMagic, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './TarotPage.css';

const TAROT_CARDS = [
  { id: 1, name: 'Büyük Arkana I - Sihirbaz', image: '/tarot/placeholder.jpg' },
  { id: 2, name: 'Büyük Arkana II - Yüksek Rahibe', image: '/tarot/placeholder.jpg' },
  { id: 3, name: 'Büyük Arkana III - İmparatoriçe', image: '/tarot/placeholder.jpg' },
  { id: 4, name: 'Büyük Arkana IV - İmparator', image: '/tarot/placeholder.jpg' },
  { id: 5, name: 'Büyük Arkana V - Hierofant', image: '/tarot/placeholder.jpg' },
  { id: 6, name: 'Büyük Arkana VI - Aşıklar', image: '/tarot/placeholder.jpg' },
  { id: 7, name: 'Büyük Arkana VII - Savaş Arabası', image: '/tarot/placeholder.jpg' },
  { id: 8, name: 'Büyük Arkana VIII - Güç', image: '/tarot/placeholder.jpg' },
  { id: 9, name: 'Büyük Arkana IX - Ermiş', image: '/tarot/placeholder.jpg' },
  { id: 10, name: 'Büyük Arkana X - Kader Çarkı', image: '/tarot/placeholder.jpg' },
  { id: 11, name: 'Büyük Arkana XI - Adalet', image: '/tarot/placeholder.jpg' },
  { id: 12, name: 'Büyük Arkana XII - Asılı Adam', image: '/tarot/placeholder.jpg' },
  { id: 13, name: 'Büyük Arkana XIII - Ölüm', image: '/tarot/placeholder.jpg' },
  { id: 14, name: 'Büyük Arkana XIV - Denge', image: '/tarot/placeholder.jpg' },
  { id: 15, name: 'Büyük Arkana XV - Şeytan', image: '/tarot/placeholder.jpg' },
  { id: 16, name: 'Büyük Arkana XVI - Yıkılan Kule', image: '/tarot/placeholder.jpg' },
  { id: 17, name: 'Büyük Arkana XVII - Yıldız', image: '/tarot/placeholder.jpg' },
  { id: 18, name: 'Büyük Arkana XVIII - Ay', image: '/tarot/placeholder.jpg' }
];

const TarotPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kartları karıştır
    const shuffledCards = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, []);

  const handleCardSelect = (card) => {
    if (selectedCards.length < 3 && !selectedCards.includes(card)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleReset = () => {
    setSelectedCards([]);
    setReading(null);
    setIsReading(false);
    // Kartları tekrar karıştır
    const shuffledCards = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const getReading = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/tarot/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cards: selectedCards.map(card => card.name)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setReading(data.reading);
        setIsReading(true);
      } else {
        console.error('Fal yorumu alınamadı:', await response.text());
      }
    } catch (error) {
      console.error('Fal yorumu alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tarot-container">
      <button onClick={() => navigate('/dashboard')} className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Geri Dön
      </button>

      <div className="tarot-header">
        <h1>Tarot Falı</h1>
        <p>Üç kart seçerek geleceğinizi keşfedin</p>
      </div>

      {!isReading ? (
        <>
          <div className="cards-container">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`card ${selectedCards.includes(card) ? 'selected' : ''}`}
                onClick={() => handleCardSelect(card)}
              >
                <div className="card-inner">
                  <div className="card-back">
                    <div className="card-design">
                      <div className="card-border">
                        <div className="card-symbol"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="selected-cards">
            <h3>Seçilen Kartlar ({selectedCards.length}/3)</h3>
            <div className="selected-cards-container">
              {[0, 1, 2].map((index) => (
                <div key={index} className="selected-card-slot">
                  {selectedCards[index] ? (
                    <div className="selected-card-design">
                      <div className="card-number">{selectedCards[index].id}</div>
                      <div className="card-title">{selectedCards[index].name}</div>
                    </div>
                  ) : (
                    <div className="empty-slot">?</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="reset-button"
              onClick={handleReset}
              disabled={selectedCards.length === 0}
            >
              <FontAwesomeIcon icon={faSync} /> Kartları Sıfırla
            </button>
            <button
              className="reading-button"
              onClick={getReading}
              disabled={selectedCards.length !== 3 || loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMagic} /> Falı Yorumla
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="reading-container">
          <div className="selected-cards-reading">
            {selectedCards.map((card, index) => (
              <div key={index} className="reading-card">
                <img src={card.image} alt={card.name} />
                <h4>{card.name}</h4>
              </div>
            ))}
          </div>
          <div className="reading-text">
            <h2>Tarot Yorumu</h2>
            <p>{reading}</p>
          </div>
          <button className="new-reading-button" onClick={handleReset}>
            <FontAwesomeIcon icon={faSync} /> Yeni Fal Bak
          </button>
        </div>
      )}
    </div>
  );
};

export default TarotPage; 