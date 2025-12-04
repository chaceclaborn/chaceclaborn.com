// src/components/QuotesCarousel.jsx
import React, { useState, useEffect } from 'react';

const QuotesCarousel = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  
  const quotes = [
    {
      text: "Great things come from hard work and perseverance. No excuses.",
      author: "Kobe Bryant"
    },
    {
      text: "I've failed over and over and over again in my life. And that is why I succeed.",
      author: "Michael Jordan"
    },
    {
      text: "Don't count the days; make the days count.",
      author: "Muhammad Ali"
    },
    {
      text: "Success is not an accident. Success is a choice.",
      author: "Stephen Curry"
    },
    {
      text: "Compare yourself to who you were yesterday, not to who someone else is today.",
      author: "Jordan Peterson"
    },
    {
      text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'",
      author: "Muhammad Ali"
    },
    {
      text: "The most important thing is to try and inspire people so that they can be great in whatever they want to do.",
      author: "Kobe Bryant"
    }
  ];

  // Auto-rotate quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [quotes.length]);

  const handleIndicatorClick = (index) => {
    setCurrentQuote(index);
  };

  return (
    <div className="quotes-section">
      <div className="quotes-slider">
        {quotes.map((quote, index) => (
          <div 
            key={index}
            className={`quote-slide ${index === currentQuote ? 'active' : ''}`}
          >
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
          </div>
        ))}
      </div>
      
      <div className="quote-indicators">
        {quotes.map((_, index) => (
          <span
            key={index}
            className={`quote-indicator ${index === currentQuote ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuotesCarousel;