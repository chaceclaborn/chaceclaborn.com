// quotes.js - Quotes Carousel Component

// Quotes data
const quotesData = [
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const quotesSlider = document.querySelector('.quotes-slider');
  const indicatorsContainer = document.querySelector('.quote-indicators');
  
  if (!quotesSlider || !indicatorsContainer) {
    console.error('Quotes containers not found');
    return;
  }

  let currentQuote = 0;
  let autoRotateInterval;

  // Build quotes HTML
  quotesData.forEach((quote, index) => {
    // Create quote slide
    const slideDiv = document.createElement('div');
    slideDiv.className = index === 0 ? 'quote-slide active' : 'quote-slide';
    slideDiv.innerHTML = `
      <p class="quote-text">"${quote.text}"</p>
      <p class="quote-author">- ${quote.author}</p>
    `;
    quotesSlider.appendChild(slideDiv);

    // Create indicator
    const indicator = document.createElement('span');
    indicator.className = index === 0 ? 'quote-indicator active' : 'quote-indicator';
    indicator.setAttribute('data-quote', index);
    indicatorsContainer.appendChild(indicator);
  });

  const slides = document.querySelectorAll('.quote-slide');
  const indicators = document.querySelectorAll('.quote-indicator');

  // Show specific quote
  function showQuote(n) {
    currentQuote = (n + quotesData.length) % quotesData.length;
    
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      indicators[i].classList.remove('active');
    });
    
    slides[currentQuote].classList.add('active');
    indicators[currentQuote].classList.add('active');
  }

  // Start auto-rotation
  function startAutoRotate() {
    autoRotateInterval = setInterval(() => {
      showQuote(currentQuote + 1);
    }, 5000);
  }

  // Click indicators to change quotes
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      clearInterval(autoRotateInterval);
      showQuote(index);
      // Restart auto-rotation after 8 seconds
      setTimeout(startAutoRotate, 8000);
    });
  });

  // Start the carousel
  startAutoRotate();
});