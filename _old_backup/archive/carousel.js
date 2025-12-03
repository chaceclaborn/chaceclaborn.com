// carousel.js - Image Carousel Component

document.addEventListener('DOMContentLoaded', function() {
  // Image slider functionality
  let currentSlide = 0;
  const slides = document.querySelectorAll(".slide");
  const indicators = document.querySelectorAll(".slide-indicators .indicator");
  const totalSlides = slides.length;
  let isTransitioning = false;

  function showSlide(n) {
    if (isTransitioning) return;
    isTransitioning = true;

    const prevSlide = currentSlide;
    currentSlide = (n + totalSlides) % totalSlides;

    // Don't transition if clicking the same slide
    if (prevSlide === currentSlide) {
      isTransitioning = false;
      return;
    }

    // Remove active from indicators
    indicators.forEach((indicator) => {
      indicator.classList.remove("active");
    });

    // Add classes for slide animation
    slides[prevSlide].classList.add("slide-out");
    slides[prevSlide].classList.remove("active");

    slides[currentSlide].classList.add("slide-in", "active");
    indicators[currentSlide].classList.add("active");

    // Clean up classes after animation
    setTimeout(() => {
      slides[prevSlide].classList.remove("slide-out");
      slides[currentSlide].classList.remove("slide-in");
      isTransitioning = false;
    }, 1000);
  }

  // Auto-advance slides every 5 seconds
  setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);

  // Click indicators to change slides
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
    });
  });

  // Initialize first slide
  if (slides.length > 0) {
    slides[0].classList.add("active");
  }
});