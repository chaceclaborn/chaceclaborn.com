// js/chatbot-botui.js - FIXED Chatbot with Full Functionality
// This version includes all the functionality and works on all pages

document.addEventListener('DOMContentLoaded', function() {
    // Detect if we're in a subfolder
    const isInSubfolder = window.location.pathname.includes('/pages/');
    const pathPrefix = isInSubfolder ? '../' : '';
    
    // Load BotUI CSS files
    const botuiCSS = document.createElement('link');
    botuiCSS.rel = 'stylesheet';
    botuiCSS.href = 'https://cdn.jsdelivr.net/npm/botui@0.3.9/build/botui.min.css';
    document.head.appendChild(botuiCSS);
    
    const botuiThemeCSS = document.createElement('link');
    botuiThemeCSS.rel = 'stylesheet';
    botuiThemeCSS.href = 'https://cdn.jsdelivr.net/npm/botui@0.3.9/build/botui-theme-default.css';
    document.head.appendChild(botuiThemeCSS);
    
    // Load custom chatbot CSS with correct path
    const customCSS = document.createElement('link');
    customCSS.rel = 'stylesheet';
    customCSS.href = `${pathPrefix}css/chatbot.css`;
    document.head.appendChild(customCSS);
    
    // Create HTML elements
    const launcherHTML = `
        <button class="chat-launcher" aria-label="Open chat">
            <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6l3.87 1.16c.67.2 1.32-.34 1.12-1.01l-1.16-3.87c.39-1.07.6-2.22.6-3.41 0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="8" cy="12" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="16" cy="12" r="1.5"/>
            </svg>
        </button>
    `;
    
    const containerHTML = `
        <div class="chatbot-container" id="chatbot-container">
            <div class="chatbot-header">
                <span>Portfolio Assistant</span>
                <button class="chatbot-close">&times;</button>
            </div>
            <div id="botui-app">
                <bot-ui></bot-ui>
            </div>
        </div>
    `;
    
    // Add elements to page
    document.body.insertAdjacentHTML('beforeend', launcherHTML);
    document.body.insertAdjacentHTML('beforeend', containerHTML);
    
    // Set up click handlers AFTER elements are added
    setTimeout(() => {
        const launcher = document.querySelector('.chat-launcher');
        const closeBtn = document.querySelector('.chatbot-close');
        const container = document.getElementById('chatbot-container');
        
        if (launcher) {
            launcher.addEventListener('click', function() {
                toggleChat();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                toggleChat();
            });
        }
    }, 100);
    
    // Load Vue and BotUI scripts
    const vueScript = document.createElement('script');
    vueScript.src = 'https://cdn.jsdelivr.net/vue/2/vue.min.js';
    vueScript.onload = function() {
        const botuiScript = document.createElement('script');
        botuiScript.src = 'https://cdn.jsdelivr.net/npm/botui@0.3.9/build/botui.min.js';
        botuiScript.onload = function() {
            // Initialize BotUI
            window.botui = new BotUI('botui-app');
            
            // Mark as ready
            window.botuiReady = true;
        };
        document.head.appendChild(botuiScript);
    };
    document.head.appendChild(vueScript);
});

// Toggle chat function - FIXED
function toggleChat() {
    const container = document.getElementById('chatbot-container');
    const launcher = document.querySelector('.chat-launcher');
    
    if (!container || !launcher) {
        console.error('Chatbot elements not found');
        return;
    }
    
    // Check for both 'active' and 'open' classes for compatibility
    const isOpen = container.classList.contains('active') || container.classList.contains('open');
    
    if (isOpen) {
        // Close chat
        container.classList.remove('active', 'open');
        launcher.classList.remove('active', 'hidden');
    } else {
        // Hide AI Assistant if open
        const aiContainer = document.getElementById('ai-assistant-container');
        if (aiContainer && aiContainer.classList.contains('open')) {
            window.toggleAIAssistant();
        }
        
        // Open chat - use both classes for compatibility
        container.classList.add('active', 'open');
        launcher.classList.add('active');
        
        // Start chat if not started
        if (window.botuiReady && !window.chatStarted) {
            startChat();
            window.chatStarted = true;
        } else if (!window.botuiReady) {
            // Wait for BotUI to be ready
            const checkInterval = setInterval(() => {
                if (window.botuiReady) {
                    clearInterval(checkInterval);
                    if (!window.chatStarted) {
                        startChat();
                        window.chatStarted = true;
                    }
                }
            }, 100);
        }
    }
}

// Make toggleChat global
window.toggleChat = toggleChat;

// Main chat flow
function startChat() {
    if (!window.botui) {
        console.error('BotUI not initialized');
        return;
    }
    
    botui.message.add({
        delay: 500,
        loading: true,
        content: 'Hi! I\'m Chace\'s portfolio assistant 👋'
    }).then(function() {
        return botui.message.add({
            delay: 1000,
            loading: true,
            content: 'I can help you learn more about his background, skills, and projects!'
        });
    }).then(function() {
        return showMainMenuWithInput();
    });
}

// Show main menu with custom input option
function showMainMenuWithInput() {
    return botui.message.add({
        delay: 300,
        content: 'What would you like to know about?'
    }).then(function() {
        return botui.action.button({
            delay: 500,
            action: [
                { text: '💼 Background', value: 'background' },
                { text: '🛠️ Skills', value: 'skills' },
                { text: '📁 Projects', value: 'projects' },
                { text: '📞 Contact Info', value: 'contact' },
                { text: '💬 Type a Question', value: 'type_question' }
            ]
        });
    }).then(function(res) {
        switch(res.value) {
            case 'background':
                return backgroundInfo();
            case 'skills':
                return skillsInfo();
            case 'projects':
                return projectsInfo();
            case 'contact':
                return contactInfo();
            case 'type_question':
                return askUserQuestion();
            default:
                return showMainMenuWithInput();
        }
    });
}

// Let user type their own question
function askUserQuestion() {
    return botui.message.add({
        delay: 300,
        content: 'Go ahead and ask me anything about Chace!'
    }).then(function() {
        return botui.action.text({
            delay: 300,
            action: {
                placeholder: 'Type your question here...'
            }
        });
    }).then(function(res) {
        return handleUserQuestion(res.value);
    });
}

// Handle custom questions
function handleUserQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Check for keywords and respond accordingly
    if (lowerQuestion.includes('experience') || lowerQuestion.includes('work')) {
        return experienceResponse();
    } else if (lowerQuestion.includes('education') || lowerQuestion.includes('school')) {
        return educationResponse();
    } else if (lowerQuestion.includes('hire') || lowerQuestion.includes('available')) {
        return availabilityResponse();
    } else if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology')) {
        return skillsInfo();
    } else if (lowerQuestion.includes('project')) {
        return projectsInfo();
    } else if (lowerQuestion.includes('contact') || lowerQuestion.includes('email')) {
        return contactInfo();
    } else {
        return genericResponse();
    }
}

// Specific responses
function experienceResponse() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Chace has a diverse background in both technology and business...'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: '• Tech Leadership at startups\n• Software development experience\n• Business consulting\n• Project management'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

function educationResponse() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Chace has strong educational foundations in both technology and business.'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: 'He\'s continuously learning through online courses, certifications, and hands-on projects. Check out the Resume page for full details!'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

function availabilityResponse() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Yes! Chace is currently available for new opportunities.'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: 'He\'s interested in:\n• Full-time positions\n• Contract work\n• Consulting projects\n• Exciting startups\n\nFeel free to reach out at chaceclaborn@gmail.com!'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

function genericResponse() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'That\'s a great question! While I might not have the specific answer, I\'d recommend:'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: '• Checking out the Portfolio page for detailed project info\n• Visiting the Resume page for full background\n• Or reaching out directly at chaceclaborn@gmail.com'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Background Info
function backgroundInfo() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Chace has an interesting background! Let me tell you about it...'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: 'He combines technical expertise with business acumen, having worked in both startups and established companies.'
        });
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: 'His experience spans software development, project management, and strategic consulting.'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Skills Info
function skillsInfo() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Chace has a diverse skill set! Here are the highlights:'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: '**Technical Skills:**\n• JavaScript, Python, Java\n• React, Node.js, Firebase\n• AWS, Google Cloud\n• Git, CI/CD'
        });
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: '**Business Skills:**\n• Project Management\n• Strategic Planning\n• Team Leadership\n• Client Relations'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Projects Info
function projectsInfo() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Chace has worked on several exciting projects!'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: 'Recent highlights include:\n• This portfolio website (you\'re on it!)\n• E-commerce platforms\n• Data analytics dashboards\n• Mobile applications'
        });
    }).then(function() {
        return botui.message.add({
            delay: 300,
            content: 'Check out the Portfolio page for detailed case studies and live demos!'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Contact Info
function contactInfo() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: "Great! Here's how to reach Chace:"
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: '📧 Email: chaceclaborn@gmail.com\n💼 LinkedIn: linkedin.com/in/chace-claborn-3b4b1017b\n💻 GitHub: github.com/chaceclaborn'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Follow-up question
function askFollowUpQuestion() {
    return botui.message.add({
        delay: 500,
        content: 'Is there anything else you\'d like to know?'
    }).then(function() {
        return botui.action.button({
            delay: 300,
            action: [
                { text: '💬 Ask Another Question', value: 'type_question' },
                { text: '📋 Back to Menu', value: 'menu' },
                { text: '👋 That\'s All', value: 'goodbye' }
            ]
        });
    }).then(function(res) {
        if (res.value === 'type_question') {
            return askUserQuestion();
        } else if (res.value === 'menu') {
            return showMainMenuWithInput();
        } else {
            return sayGoodbye();
        }
    });
}

// Goodbye message
function sayGoodbye() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Thanks for chatting! Feel free to reach out if you have any questions. 😊'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            content: 'You can close this chat or ask another question anytime!'
        });
    }).then(function() {
        return botui.action.button({
            delay: 300,
            action: [
                { text: '🔄 Start Over', value: 'restart' }
            ]
        });
    }).then(function() {
        return showMainMenuWithInput();
    });
}