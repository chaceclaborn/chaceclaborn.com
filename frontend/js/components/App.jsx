// js/components/App.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import ImageCarousel from './ImageCarousel';
import QuotesCarousel from './QuotesCarousel';
import ChatbotAssistant from './ChatbotAssistant';

// Main App component that coordinates all React components
const App = () => {
    const pageType = document.body.dataset.page || 'default';
    
    return (
        <>
            {/* Chatbot appears on all pages */}
            <ChatbotAssistant />
            
            {/* Page-specific components will be mounted in their containers */}
        </>
    );
};

// Mount function to be called from main.js
export const mountReactComponents = () => {
    const pageType = document.body.dataset.page || 'default';
    
    // Mount chatbot on all pages
    const chatbotContainer = document.getElementById('react-chatbot');
    if (!chatbotContainer) {
        const container = document.createElement('div');
        container.id = 'react-chatbot';
        document.body.appendChild(container);
        const root = ReactDOM.createRoot(container);
        root.render(<ChatbotAssistant />);
    }
    
    // Mount home page components
    if (pageType === 'home') {
        // Mount Image Carousel
        const carouselContainer = document.querySelector('.image-panel');
        if (carouselContainer) {
            const root = ReactDOM.createRoot(carouselContainer);
            root.render(<ImageCarousel />);
        }
        
        // Mount Quotes Carousel
        const quotesSection = document.querySelector('.quotes-section');
        if (quotesSection) {
            // Clear existing content
            quotesSection.innerHTML = '';
            const quotesContainer = document.createElement('div');
            quotesSection.appendChild(quotesContainer);
            const root = ReactDOM.createRoot(quotesContainer);
            root.render(<QuotesCarousel />);
        }
    }
};

export default App;