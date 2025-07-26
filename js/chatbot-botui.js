// chatbot-botui-enhanced.js - Save this as js/chatbot-botui.js (replace the old one)

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Add BotUI CSS to head
    const botuiCSS = document.createElement('link');
    botuiCSS.rel = 'stylesheet';
    botuiCSS.href = 'https://cdn.jsdelivr.net/npm/botui@0.3.9/build/botui.min.css';
    document.head.appendChild(botuiCSS);
    
    const botuiThemeCSS = document.createElement('link');
    botuiThemeCSS.rel = 'stylesheet';
    botuiThemeCSS.href = 'https://cdn.jsdelivr.net/npm/botui@0.3.9/build/botui-theme-default.css';
    document.head.appendChild(botuiThemeCSS);
    
    // Add custom styles
    const customStyles = document.createElement('style');
    customStyles.innerHTML = `
        /* Chatbot Container */
        .chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            height: 500px;
            z-index: 9999;
            display: none;
            flex-direction: column;
            box-shadow: 0 5px 40px rgba(0,0,0,.16);
            border-radius: 12px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .chatbot-container.open {
            display: flex;
        }
        
        /* Header */
        .chatbot-header {
            background: #617140;
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            font-size: 16px;
        }
        
        .chatbot-close {
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
        
        .chatbot-close:hover {
            background: rgba(255,255,255,0.1);
        }
        
        /* BotUI Container */
        #botui-app {
            flex: 1;
            background: white;
            overflow: hidden;
        }
        
        /* Launch Button */
        .chat-launcher {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #617140;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            z-index: 9998;
            border: none;
        }
        
        .chat-launcher:hover {
            transform: scale(1.1);
            background: #536036;
        }
        
        .chat-launcher.hidden {
            display: none;
        }
        
        .chat-launcher svg {
            width: 30px;
            height: 30px;
            fill: white;
        }
        
        /* Custom BotUI Styling */
        .botui-app-container {
            height: 100%;
            background: #fff;
        }
        
        .botui-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            background: #fff;
            font-family: inherit !important;
        }
        
        .botui-messages-container {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
        }
        
        .botui-actions-container {
            padding: 15px;
            background: #fafafa;
            border-top: 1px solid #e0e0e0;
        }
        
        /* Messages */
        .botui-message {
            margin-bottom: 10px;
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .botui-message-content {
            padding: 10px 15px;
            background: #f5f7f2;
            border-radius: 18px;
            display: inline-block;
            max-width: 80%;
            color: #2c3e50;
            font-size: 15px;
            line-height: 1.4;
            white-space: pre-wrap;
        }
        
        .botui-message-content.human {
            background: #617140;
            color: white;
            float: right;
            border-bottom-right-radius: 4px;
        }
        
        .botui-message-content.text {
            border-bottom-left-radius: 4px;
        }
        
        /* Loading dots */
        .botui-message-content.loading {
            background: #f5f7f2;
            padding: 15px 20px;
        }
        
        /* Buttons */
        .botui-actions-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .botui-actions-buttons-button {
            background: white !important;
            color: #617140 !important;
            border: 2px solid #617140 !important;
            border-radius: 22px !important;
            padding: 8px 20px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer;
            transition: all 0.2s ease !important;
            font-family: inherit !important;
            margin: 0 !important;
        }
        
        .botui-actions-buttons-button:hover {
            background: #617140 !important;
            color: white !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        /* Text Input Styling */
        .botui-actions-text-input {
            border: 2px solid #e0e0e0 !important;
            border-radius: 22px !important;
            padding: 10px 16px !important;
            font-size: 15px !important;
            width: 100% !important;
            outline: none !important;
            transition: border-color 0.2s !important;
            font-family: inherit !important;
        }
        
        .botui-actions-text-input:focus {
            border-color: #617140 !important;
        }
        
        .botui-actions-text-submit {
            background: #617140 !important;
            color: white !important;
            border: none !important;
            border-radius: 22px !important;
            padding: 10px 24px !important;
            margin-left: 10px !important;
            cursor: pointer;
            transition: all 0.2s !important;
            font-weight: 500 !important;
        }
        
        .botui-actions-text-submit:hover {
            background: #536036 !important;
        }
        
        /* Mobile responsive */
        @media (max-width: 480px) {
            .chatbot-container {
                width: 100%;
                height: 100%;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
            
            .chatbot-header {
                border-radius: 0;
            }
        }
    `;
    document.head.appendChild(customStyles);
    
    // Create HTML elements
    const launcherHTML = `
        <button class="chat-launcher" onclick="window.toggleChat()" aria-label="Open chat">
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
                <button class="chatbot-close" onclick="window.toggleChat()">&times;</button>
            </div>
            <div id="botui-app">
                <bot-ui></bot-ui>
            </div>
        </div>
    `;
    
    // Add elements to page
    document.body.insertAdjacentHTML('beforeend', launcherHTML);
    document.body.insertAdjacentHTML('beforeend', containerHTML);
    
    // Load Vue and BotUI scripts
    const vueScript = document.createElement('script');
    vueScript.src = 'https://cdn.jsdelivr.net/vue/2/vue.min.js';
    vueScript.onload = function() {
        const botuiScript = document.createElement('script');
        botuiScript.src = 'https://cdn.jsdelivr.net/npm/botui@0.3.9/build/botui.min.js';
        botuiScript.onload = function() {
            // Initialize chatbot after scripts load
            initializeChatbot();
        };
        document.body.appendChild(botuiScript);
    };
    document.body.appendChild(vueScript);
});

// Global variables
let chatOpen = false;
let firstTime = true;
let botui = null;

// Toggle chat window
window.toggleChat = function() {
    const container = document.getElementById('chatbot-container');
    const launcher = document.querySelector('.chat-launcher');
    
    if (!chatOpen) {
        container.classList.add('open');
        launcher.classList.add('hidden');
        chatOpen = true;
        
        // Initialize bot on first open
        if (firstTime) {
            firstTime = false;
            initBot();
        }
    } else {
        container.classList.remove('open');
        launcher.classList.remove('hidden');
        chatOpen = false;
    }
}

// Initialize the chatbot
function initializeChatbot() {
    // Bot is ready to be initialized when opened
    console.log('BotUI Chatbot loaded and ready!');
}

// Initialize BotUI
function initBot() {
    botui = new BotUI('botui-app');
    startConversation();
}

// Main conversation flow
function startConversation() {
    botui.message.add({
        delay: 300,
        loading: true,
        content: 'Hi! Welcome to my portfolio 👋'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: "I'm here to help you learn about Chace's engineering experience at Blue Origin."
        });
    }).then(function() {
        return botui.message.add({
            delay: 500,
            loading: true,
            content: 'You can click the buttons below or type your own questions!'
        });
    }).then(function() {
        return showMainMenuWithInput();
    });
}

// Main menu with text input option
function showMainMenuWithInput() {
    return botui.action.button({
        delay: 300,
        action: [
            { text: '👤 About Chace', value: 'about' },
            { text: '💼 Work Experience', value: 'experience' },
            { text: '🛠️ Technical Skills', value: 'skills' },
            { text: '🚀 Projects', value: 'projects' },
            { text: '📧 Contact Info', value: 'contact' },
            { text: '💬 Type a Question', value: 'type_question' }
        ]
    }).then(function(res) {
        if (res.value === 'type_question') {
            return askUserQuestion();
        } else {
            return handleMenuSelection(res.value);
        }
    });
}

// Handle typed questions
function askUserQuestion() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Great! What would you like to know? You can ask about:'
    }).then(function() {
        return botui.message.add({
            delay: 500,
            content: '• My experience at Blue Origin\n• Technical skills and software\n• Education and background\n• Projects I\'ve worked on\n• How to contact me'
        });
    }).then(function() {
        return botui.action.text({
            delay: 300,
            action: {
                placeholder: 'Type your question here...'
            }
        });
    }).then(function(res) {
        return handleUserInput(res.value);
    });
}

// Process user typed input
function handleUserInput(userInput) {
    const input = userInput.toLowerCase();
    
    // Check for keywords and respond accordingly
    if (input.includes('blue origin') || input.includes('work') || input.includes('job')) {
        return workExperience();
    } else if (input.includes('skill') || input.includes('software') || input.includes('programming')) {
        return technicalSkills();
    } else if (input.includes('education') || input.includes('school') || input.includes('auburn')) {
        return education();
    } else if (input.includes('project') || input.includes('github') || input.includes('bonsai')) {
        return projects();
    } else if (input.includes('contact') || input.includes('email') || input.includes('linkedin')) {
        return contactInfo();
    } else if (input.includes('experience') || input.includes('background')) {
        return aboutChace();
    } else if (input.includes('rocket') || input.includes('engine') || input.includes('be-4')) {
        return rocketEngineDetails();
    } else if (input.includes('cnc') || input.includes('manufacturing') || input.includes('machining')) {
        return manufacturingDetails();
    } else {
        // If no keywords match, show a helpful response
        return botui.message.add({
            delay: 300,
            loading: true,
            content: "I'm not sure about that specific topic, but I can tell you about:"
        }).then(function() {
            return showMainMenuWithInput();
        });
    }
}

// Handle menu selections
function handleMenuSelection(value) {
    switch(value) {
        case 'about':
            return aboutChace();
        case 'experience':
            return workExperience();
        case 'skills':
            return technicalSkills();
        case 'projects':
            return projects();
        case 'contact':
            return contactInfo();
    }
}

// About Chace
function aboutChace() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Great! Let me tell you about Chace...'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: 'Chace Claborn is a Manufacturing Engineer II at Blue Origin 🚀'
        });
    }).then(function() {
        return botui.message.add({
            delay: 1000,
            loading: true,
            content: 'He graduated from Auburn University with a B.S. in Mechanical Engineering (GPA: 3.79)'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: 'He specializes in rocket engine component manufacturing for the BE-4 and BE-3U engines.'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Work Experience
function workExperience() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: "Let me walk you through Chace's professional journey..."
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🚀 Blue Origin (July 2022 - Present)\nManufacturing Engineer I-II'
        });
    }).then(function() {
        return botui.message.add({
            delay: 1000,
            loading: true,
            content: 'Key responsibilities:\n• CNC programming & optimization\n• GD&T application\n• Process development for turbomachinery\n• Hydroforming exotic materials'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: 'Previous internships:\n• Aerojet Rocketdyne (2021)\n• Precision Grinding Inc. (2020-2021)\n• WhiteFab Inc. (2017-2020)'
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
        content: "Great! Here's how you can reach Chace:"
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '📧 Email:\nchaceclaborn@gmail.com'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '💼 LinkedIn:\nlinkedin.com/in/chace-claborn-3b4b1017b'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '💻 GitHub:\ngithub.com/chaceclaborn'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: "He's always interested in discussing engineering challenges and aerospace innovations! 🚀"
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Additional detail functions
function education() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: '🎓 Auburn University (2018-2022)'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: 'Bachelor of Science in Mechanical Engineering\nGPA: 3.79/4.0'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: 'Key coursework:\n• Mechanical Design\n• Thermodynamics\n• Manufacturing Processes\n• Materials Science'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

function rocketEngineDetails() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'At Blue Origin, Chace works on cutting-edge rocket engines:'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🚀 BE-4 Engine:\n• Powers New Glenn & ULA\'s Vulcan\n• Liquid oxygen/liquid natural gas\n• 550,000 lbf thrust'
        });
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '🚀 BE-3U Engine:\n• Upper stage engine\n• Liquid hydrogen fuel\n• Deep throttling capability'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

function manufacturingDetails() {
    return botui.message.add({
        delay: 300,
        loading: true,
        content: 'Manufacturing expertise includes:'
    }).then(function() {
        return botui.message.add({
            delay: 800,
            loading: true,
            content: '• CNC Programming: Custom macros & probing routines\n• Hydroforming: Exotic materials for aerospace\n• Quality: GD&T application & CMM programming\n• Process optimization using LEAN principles'
        });
    }).then(function() {
        return askFollowUpQuestion();
    });
}

// Follow-up question function
function askFollowUpQuestion() {
    return botui.message.add({
        delay: 500,
        loading: true,
        content: 'What else would you like to know?'
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