import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoffee,
  faMagicWandSparkles,
  faHeart,
  faBriefcase,
  faStar,
  faArrowRight,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './LandingPage.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="landing-page">
        {/* Navbar */}
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
          <div className="navbar-container">
            <Link to="/" className="navbar-logo">
              <img src="/coffee-logo.png" alt="AI Kahve Falı Logo" />
              <span>AI Kahve Falı</span>
            </Link>

            <button className="menu-button" onClick={toggleMenu}>
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>

            <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" className="navbar-link">Ana Sayfa</Link>
              <Link to="/about" className="navbar-link">Hakkımızda</Link>
              <Link to="/pricing" className="navbar-link">Fiyatlar</Link>
              <Link to="/contact" className="navbar-link">İletişim</Link>
            </div>

            <div className={`navbar-buttons ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/login" className="secondary-button">Giriş Yap</Link>
              <Link to="/register" className="primary-button">
                Üye Ol
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">AI Kahve Falı</h1>
            <p className="hero-subtitle">Yapay zeka destekli kahve falı ile geleceğinizi keşfedin</p>
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Hemen Başla
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/login" className="secondary-button">
                Giriş Yap
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/coffee-splash.png" alt="Dinamik Kahve Fincanı" className="coffee-cup-image" />
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2>Özelliklerimiz</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FontAwesomeIcon icon={faMagicWandSparkles} className="feature-icon" />
              <h3>AI Teknolojisi</h3>
              <p>En gelişmiş yapay zeka teknolojisi ile falınızı yorumluyoruz</p>
            </div>
            <div className="feature-card">
              <FontAwesomeIcon icon={faHeart} className="feature-icon" />
              <h3>Aşk Falı</h3>
              <p>Aşk hayatınız hakkında detaylı yorumlar alın</p>
            </div>
            <div className="feature-card">
              <FontAwesomeIcon icon={faBriefcase} className="feature-icon" />
              <h3>Kariyer Falı</h3>
              <p>İş ve kariyer hayatınızdaki fırsatları öğrenin</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <h2>Nasıl Çalışır?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <FontAwesomeIcon icon={faCoffee} className="step-icon" />
              <h3>Kahvenizi İçin</h3>
              <p>Türk kahvenizi içip fincanınızı ters çevirin</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <FontAwesomeIcon icon={faMagicWandSparkles} className="step-icon" />
              <h3>Fotoğraf Çekin</h3>
              <p>Fincanınızın fotoğrafını yükleyin</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <FontAwesomeIcon icon={faStar} className="step-icon" />
              <h3>Sonucu Alın</h3>
              <p>AI destekli detaylı fal yorumunuzu okuyun</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2>Kullanıcı Yorumları</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
              <p>"Çok detaylı ve isabetli yorumlar. Kesinlikle tavsiye ederim!"</p>
              <div className="testimonial-author">- Ayşe Y.</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
              <p>"AI teknolojisi ile falcılık bambaşka bir boyuta taşınmış."</p>
              <div className="testimonial-author">- Mehmet K.</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
                <FontAwesomeIcon icon={faStar} />
              </div>
              <p>"Kullanımı çok kolay ve sonuçlar gerçekten etkileyici!"</p>
              <div className="testimonial-author">- Zeynep A.</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Hemen Falınıza Baktırın</h2>
          <p>Ücretsiz üye olun ve ilk falınız hemen öğrenin</p>
          <Link to="/register" className="primary-button">
            Ücretsiz Üye Ol
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </section>
      </div>
      
      {/* Footer Copyright - Sayfanın dışında */}
      <div className="footer-copyright">
        © {new Date().getFullYear()} AI Kahve Falı. Tüm hakları saklıdır.
      </div>
    </>
  );
};

export default LandingPage; 