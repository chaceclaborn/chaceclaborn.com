// src/App.jsx - Main React Application
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import all components
import Navigation from './components/Navigation';
import ImageCarousel from './components/ImageCarousel';
import QuotesCarousel from './components/QuotesCarousel';
import ChatbotAssistant from './components/ChatbotAssistant';
import AuthButton from './components/AuthButton';
import FeedbackWidget from './components/FeedbackWidget';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD5y-GRlPXuLVpNrXVVvDpqS_8lKl5Fj5M",
  authDomain: "chaceclabornwebsite.firebaseapp.com",
  projectId: "chaceclabornwebsite",
  storageBucket: "chaceclabornwebsite.appspot.com",
  messagingSenderId: "761180552656",
  appId: "1:761180552656:web:d8d6c3f9e8f8c9d0e1f2a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other components
export { app, auth, db };

function App() {
  const [pageType, setPageType] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Detect page type from URL
    const path = window.location.pathname;
    if (path === '/' || path.includes('index')) {
      setPageType('home');
    } else if (path.includes('portfolio')) {
      setPageType('portfolio');
    } else if (path.includes('resume')) {
      setPageType('resume');
    } else if (path.includes('admin')) {
      setPageType('admin');
    }

    // Auth listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="app">
      {/* Navigation - always present */}
      <Navigation user={user} />

      {/* Page-specific content */}
      {pageType === 'home' && (
        <HomePage user={user} />
      )}

      {/* Global components */}
      <ChatbotAssistant />
      {pageType === 'home' && <FeedbackWidget />}
    </div>
  );
}

// Home Page Component
function HomePage({ user }) {
  return (
    <>
      <main className="main-content">
        <div className="content-wrapper">
          {/* Profile Section */}
          <div className="info-panel">
            <div className="profile-section">
              <img 
                src="/images/profile-circle.png" 
                alt="Chace Claborn" 
                className="profile-image"
              />
              <h1>Chace Claborn</h1>
              <p className="title">Mechanical Engineer</p>
              
              <div className="social-links">
                <a href="https://www.linkedin.com/in/chace-claborn" target="_blank">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://github.com/chaceclaborn" target="_blank">
                  <i className="fab fa-github"></i>
                </a>
                <a href="mailto:chaceclaborn@gmail.com">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>

            <div className="about-section">
              <h2>About Me</h2>
              <p>
                Welcome to my portfolio! I graduated from Auburn University with 
                a Bachelor of Science in Mechanical Engineering. This is a portfolio 
                website to show what I enjoy doing and what I have learned along the way.
              </p>
            </div>

            <div className="cta-buttons">
              <a href="/pages/portfolio.html" className="btn-modern">View Portfolio</a>
              <a href="/pages/resume.html" className="btn-modern">Resume</a>
            </div>
          </div>

          {/* Image Carousel */}
          <div className="image-panel">
            <ImageCarousel />
          </div>
        </div>
      </main>

      {/* Footer with Quotes */}
      <footer className="site-footer-home">
        <QuotesCarousel />
        
        <div className="footer-bottom-section">
          <div className="footer-container">
            <p className="copyright">© 2025 Chace Claborn. All rights reserved.</p>
            <div className="footer-right">
              <AuthButton user={user} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;