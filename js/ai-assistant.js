// ai-assistant.js - AI Assistant functionality with dynamic styles

document.addEventListener('DOMContentLoaded', function() {
    // Inject styles dynamically (like chatbot does)
    const aiStyles = document.createElement('style');
    aiStyles.innerHTML = `
        /* AI Assistant Launch Button */
        .ai-assistant-button {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #617140 0%, #4a5930 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            z-index: 9997;
            border: none;
            overflow: hidden;
        }

        .ai-assistant-button::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transform: rotate(45deg);
            transition: all 0.5s;
            opacity: 0;
        }

        .ai-assistant-button:hover::before {
            animation: shimmer 0.5s ease-out;
        }

        @keyframes shimmer {
            0% {
                transform: translateX(-100%) translateY(-100%) rotate(45deg);
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: translateX(100%) translateY(100%) rotate(45deg);
                opacity: 0;
            }
        }

        .ai-assistant-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(97, 113, 64, 0.3);
        }

        .ai-assistant-button.hidden {
            display: none;
        }

        .ai-assistant-button .ai-icon {
            font-size: 28px;
            color: white;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
        }

        /* AI Assistant Container - FIXED POPUP */
        .ai-assistant-container {
            position: fixed !important;
            bottom: 20px;
            right: 20px;
            width: 380px;
            height: 500px;
            z-index: 9998;
            display: none;
            flex-direction: column;
            box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
            border-radius: 16px;
            overflow: hidden;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .ai-assistant-container.open {
            display: flex;
            animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* AI Assistant Header */
        .ai-assistant-header {
            background: linear-gradient(135deg, #617140 0%, #4a5930 100%);
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .ai-assistant-header .header-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ai-assistant-header .ai-icon-small {
            font-size: 20px;
            animation: pulse 2s infinite;
        }

        .ai-assistant-close {
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .ai-assistant-close:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        /* AI Assistant Body */
        .ai-assistant-body {
            flex: 1;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start; /* Changed from center */
            text-align: center;
            background: linear-gradient(to bottom, #fafbf9, #f5f6f2);
            overflow-y: auto; /* Enable scrolling */
            overflow-x: hidden;
        }

        /* Coming Soon Content */
        .ai-coming-soon {
            max-width: 300px;
        }

        .ai-coming-soon-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            box-shadow: 0 4px 12px rgba(97, 113, 64, 0.2);
            position: relative;
        }

        .ai-coming-soon-icon::after {
            content: '';
            position: absolute;
            width: 120px;
            height: 120px;
            border: 2px solid rgba(97, 113, 64, 0.1);
            border-radius: 50%;
            animation: ripple 2s infinite;
        }

        @keyframes ripple {
            0% {
                transform: scale(0.8);
                opacity: 1;
            }
            100% {
                transform: scale(1.2);
                opacity: 0;
            }
        }

        .ai-coming-soon-icon i {
            font-size: 48px;
            color: #617140;
        }

        /* Animated Robot Face */
        .robot-face {
            width: 60px;
            height: 60px;
            position: relative;
        }

        .robot-eyes {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding: 0 15px;
            margin-top: 15px;
        }

        .robot-eye {
            width: 10px;
            height: 10px;
            background: #617140;
            border-radius: 50%;
            animation: blink 4s infinite;
        }

        @keyframes blink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
        }

        .robot-mouth {
            width: 30px;
            height: 8px;
            background: #617140;
            margin: 15px auto 0;
            border-radius: 0 0 15px 15px;
            animation: talk 2s infinite;
            transform-origin: center top;
        }

        @keyframes talk {
            0%, 100% { 
                transform: scaleY(1);
                border-radius: 0 0 15px 15px;
            }
            25% { 
                transform: scaleY(1.5);
                border-radius: 0 0 20px 20px;
            }
            50% { 
                transform: scaleY(0.5);
                border-radius: 0 0 10px 10px;
            }
            75% { 
                transform: scaleY(1.2);
                border-radius: 0 0 18px 18px;
            }
        }

        .ai-coming-soon h2 {
            color: #4a5930;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .ai-coming-soon p {
            color: #6c757d;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        /* Features Preview */
        .ai-features-preview {
            background: white;
            padding: 1.25rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 1.5rem;
        }

        .ai-features-preview h3 {
            color: #617140;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
        }

        .ai-features-preview ul {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: left;
        }

        .ai-features-preview li {
            font-size: 0.85rem;
            color: #6c757d;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ai-features-preview li i {
            color: #617140;
            font-size: 0.9rem;
        }

        /* Status Badge */
        .ai-status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(97, 113, 64, 0.1);
            color: #617140;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .ai-status-badge i {
            font-size: 0.9rem;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
            .ai-assistant-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            
            .ai-assistant-header {
                border-radius: 0;
            }
            
            .ai-assistant-button {
                bottom: 80px;
                right: 15px;
                width: 50px;
                height: 50px;
            }
            
            .ai-assistant-button .ai-icon {
                font-size: 24px;
            }
        }
    `;
    document.head.appendChild(aiStyles);
    
    // Create AI Assistant button
    const aiButtonHTML = `
        <button class="ai-assistant-button" id="ai-assistant-toggle" aria-label="Open AI Assistant">
            <i class="fas fa-robot ai-icon"></i>
        </button>
    `;
    
    // Create AI Assistant container
    const aiContainerHTML = `
        <div class="ai-assistant-container" id="ai-assistant-container">
            <div class="ai-assistant-header">
                <div class="header-content">
                    <i class="fas fa-robot ai-icon-small"></i>
                    <span>AI Assistant</span>
                </div>
                <button class="ai-assistant-close" onclick="toggleAIAssistant()">&times;</button>
            </div>
            <div class="ai-assistant-body">
                <div class="ai-coming-soon">
                    <!-- Status Badge -->
                    <div class="ai-status-badge">
                        <i class="fas fa-cog"></i>
                        <span>Under Development</span>
                    </div>
                    
                    <!-- Icon -->
                    <div class="ai-coming-soon-icon">
                        <div class="robot-face">
                            <div class="robot-eyes">
                                <div class="robot-eye"></div>
                                <div class="robot-eye"></div>
                            </div>
                            <div class="robot-mouth"></div>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <h2>AI Assistant Coming Soon!</h2>
                    <p>I'm building an intelligent assistant to help you explore my portfolio and answer questions about my experience.</p>
                    
                    <!-- Features Preview -->
                    <div class="ai-features-preview">
                        <h3>Planned Features:</h3>
                        <ul>
                            <li>
                                <i class="fas fa-comments"></i>
                                <span>Interactive Q&A about projects</span>
                            </li>
                            <li>
                                <i class="fas fa-search"></i>
                                <span>Smart portfolio navigation</span>
                            </li>
                            <li>
                                <i class="fas fa-chart-line"></i>
                                <span>Experience insights</span>
                            </li>
                            <li>
                                <i class="fas fa-lightbulb"></i>
                                <span>Personalized recommendations</span>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Close Button -->
                    <button class="btn-modern" onclick="toggleAIAssistant()" style="width: 100%;">
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add elements to page
    document.body.insertAdjacentHTML('beforeend', aiButtonHTML);
    document.body.insertAdjacentHTML('beforeend', aiContainerHTML);
    
    // Add click event to AI button
    const aiButton = document.getElementById('ai-assistant-toggle');
    aiButton.addEventListener('click', toggleAIAssistant);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const container = document.getElementById('ai-assistant-container');
            if (container.classList.contains('open')) {
                toggleAIAssistant();
            }
        }
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        const container = document.getElementById('ai-assistant-container');
        const button = document.getElementById('ai-assistant-toggle');
        
        if (container.classList.contains('open') && 
            !container.contains(e.target) && 
            !button.contains(e.target)) {
            toggleAIAssistant();
        }
    });
});

// Global function to toggle AI Assistant
let aiAssistantOpen = false;

function toggleAIAssistant() {
    const container = document.getElementById('ai-assistant-container');
    const button = document.getElementById('ai-assistant-toggle');
    
    if (!aiAssistantOpen) {
        // Hide chatbot if open
        const chatbotContainer = document.getElementById('chatbot-container');
        if (chatbotContainer && chatbotContainer.classList.contains('open')) {
            window.toggleChat();
        }
        
        container.classList.add('open');
        button.classList.add('hidden');
        aiAssistantOpen = true;
        
        // Track analytics event (if you have analytics)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ai_assistant_opened', {
                'event_category': 'engagement',
                'event_label': 'AI Assistant'
            });
        }
    } else {
        container.classList.remove('open');
        button.classList.remove('hidden');
        aiAssistantOpen = false;
    }
}