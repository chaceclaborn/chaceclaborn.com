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

// Toggle chat function
function toggleChat() {
    const container = document.getElementById('chatbot-container');
    const launcher = document.querySelector('.chat-launcher');
    
    if (!container || !launcher) return;
    
    if (container.classList.contains('active')) {
        // Close chat
        container.classList.remove('active');
        launcher.classList.remove('active');
    } else {
        // Open chat
        container.classList.add('active');
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
            delay: 300,
            action: [
                { text: '💼 Work Experience', value: 'experience' },
                { text: '💻 Technical Skills', value: 'skills' },
                { text: '🚀 Projects', value: 'projects' },
                { text: '📞 Contact Info', value: 'contact' },
                { text: '💬 Ask a Question', value: 'custom' }
            ]
        });
    }).then(function(res) {
        switch(res.value) {
            case 'experience':
                return workExperience();
            case 'skills':
                return technicalSkills();
            case 'projects':
                return projects();
            case 'contact':
                return contactInfo();
            case 'custom':
                return askUserQuestion();
            default:
                return showMainMenuWithInput();
        }
    });
}

// Custom question handler
function askUserQuestion() {
    return botui.message.add({
        delay: 300,
        content: 'What would you like to know? Type your question below:'
    }).then(function() {
        return botui.action.text({
            delay: 300,
            action: {
                placeholder: 'Type your question here...'
            }
        });
    }).then(function(res) {
        // Process the question
        const question = res.value.toLowerCase();
        
        // Simple keyword matching
        if (question.includes('education') || question.includes('school') || question.includes('degree')) {
            return botui.message.add({
                delay: 500,
                loading: true,
                content: 'Chace has a B.S. in Mechanical Engineering from the University of Alabama in Huntsville (2019). He also completed advanced manufacturing training at Calhoun Community College.'
            }).then(askFollowUpQuestion);
        } else if (question.includes('location') || question.includes('where') || question.includes('live')) {
            return botui.message.add({
                delay: 500,
                loading: true,
                content: 'Chace is based in Huntsville, Alabama - the Rocket City! 🚀'
            }).then(askFollowUpQuestion);
        } else if (question.includes('hire') || question.includes('available') || question.includes('job')) {
            return botui.message.add({
                delay: 500,
                loading: true,
                content: 'For employment opportunities, please reach out via email at chaceclaborn@gmail.com or connect on LinkedIn!'
            }).then(askFollowUpQuestion);
        } else {
            return botui.message.add({
                delay: 500,
                loading: true,
                content: 'Great question! For specific inquiries, I recommend reaching out directly at chaceclaborn@gmail.com. Meanwhile, feel free to explore the menu options for more information!'
            }).then(askFollowUpQuestion);
        }
    });
}

// Work Experience
function workExperience() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Chace has extensive experience in aerospace and manufacturing!'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🚀 Aerojet Rocketdyne (2021-Present)\nData Integration Specialist\n• Python automation & SQL analytics\n• Process optimization & reporting'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '✈️ Previous Roles:\n• Collins Aerospace (2020-2021)\n• WhiteFab Inc. (2017-2020)'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Technical Skills
function technicalSkills() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: "Chace has a diverse technical skill set..."
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '💻 CAD/CAM Software:\nCreo, Siemens NX, SolidWorks, Windchill PLM, Vericut'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '👨‍💻 Programming:\nPython, SQL, MATLAB, G-Code, Siemens 840D'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🏭 Manufacturing:\nCNC Programming, 3D Printing, CMM/PolyWorks, LEAN Manufacturing'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '📊 Data & Analytics:\nRedash, Databricks, Tableau, JIRA'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Projects
function projects() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Check out these cool projects on GitHub! 💻'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🌳 Bonsai Assistant\nAutomation system for bonsai tree care using Raspberry Pi & Python'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '📈 Stock App\nFinancial tracking and analysis tool'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🚀 Propulsion App\nEngineering calculations for propulsion systems'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '💻 This Website\nBuilt from scratch to showcase my work!'
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