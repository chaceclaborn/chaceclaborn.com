// ai-assistant.js - AI Assistant functionality
// CSS has been moved to css/ai-assistant.css

document.addEventListener('DOMContentLoaded', function() {
    // Load AI Assistant CSS
    const aiCSS = document.createElement('link');
    aiCSS.rel = 'stylesheet';
    aiCSS.href = 'css/ai-assistant.css';
    document.head.appendChild(aiCSS);
    
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