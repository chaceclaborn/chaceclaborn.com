// js/components/ImageCarousel.jsx
import React, { useState, useEffect } from 'react';

const ImageCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = [
        { src: '/images/manufacturing.png', alt: 'Manufacturing' },
        { src: '/images/hotfire_modified.jpg', alt: 'Hot Fire Test' },
        { src: '/images/graduation.jpeg', alt: 'Graduation' }
    ];

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="image-panel">
            <div className="image-slider">
                {slides.map((slide, index) => (
                    <div 
                        key={index}
                        className={`slide ${index === currentSlide ? 'active' : ''}`}
                    >
                        <img src={slide.src} alt={slide.alt} />
                    </div>
                ))}
            </div>

            {/* Slide Indicators */}
            <div className="slide-indicators">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        data-slide={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;