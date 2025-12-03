// frontend/js/components/ImageCarousel.jsx - Complete with all functionality
import React, { useState, useEffect, useRef } from 'react'

const ImageCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const intervalRef = useRef(null)
    
    const slides = [
        { src: '/images/manufacturing.png', alt: 'Manufacturing' },
        { src: '/images/hotfire_modified.jpg', alt: 'Hot Fire Test' },
        { src: '/images/graduation.jpeg', alt: 'Graduation' }
    ]

    // Auto-advance slides every 5 seconds
    useEffect(() => {
        startAutoAdvance()
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const startAutoAdvance = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        
        intervalRef.current = setInterval(() => {
            goToNextSlide()
        }, 5000)
    }

    const goToNextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
    }

    const goToSlide = (index) => {
        if (isTransitioning || index === currentSlide) return
        
        setIsTransitioning(true)
        
        // Clear and restart auto-advance
        if (intervalRef.current) clearInterval(intervalRef.current)
        
        setCurrentSlide(index)
        
        // Reset transitioning state
        setTimeout(() => {
            setIsTransitioning(false)
            startAutoAdvance() // Restart auto-advance after manual selection
        }, 1000)
    }

    return (
        <>
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
        </>
    )
}

export default ImageCarousel