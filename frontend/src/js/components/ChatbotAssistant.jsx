// js/components/ChatbotAssistant.jsx
import React, { useState, useEffect } from 'react';
import '../../css/chatbot.css'; // Import CSS directly in component!

const ChatbotAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! I\'m Chace\'s AI assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Quick responses
    const quickResponses = [
        'Tell me about Chace',
        'What projects has he worked on?',
        'How can I contact him?',
        'What are his skills?'
    ];

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsTyping(true);

        // Simulate bot response (replace with actual AI integration later)
        setTimeout(() => {
            const botResponse = getBotResponse(userMessage);
            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1000);
    };

    const getBotResponse = (message) => {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('contact')) {
            return 'You can reach Chace at chaceclaborn@gmail.com or connect with him on LinkedIn!';
        } else if (lowerMessage.includes('skills')) {
            return 'Chace is skilled in mechanical engineering, CNC programming, CAD (SolidWorks, CATIA, NX), and web development with React, JavaScript, and Python.';
        } else if (lowerMessage.includes('projects')) {
            return 'Chace has worked on rocket engine manufacturing at Blue Origin, developed an automated bonsai irrigation system, and built this portfolio website!';
        } else if (lowerMessage.includes('about') || lowerMessage.includes('chace')) {
            return 'Chace is a Manufacturing Engineer at Blue Origin, graduated from Auburn University with a degree in Mechanical Engineering. He\'s passionate about aerospace, automation, and continuous learning!';
        } else {
            return 'That\'s an interesting question! Feel free to email Chace at chaceclaborn@gmail.com for more detailed information.';
        }
    };

    const handleQuickResponse = (response) => {
        setInputValue(response);
        handleSend();
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button 
                className="ai-assistant-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat with AI Assistant"
            >
                {isOpen ? (
                    <i className="fas fa-times"></i>
                ) : (
                    <i className="fas fa-comment-dots"></i>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                    </div>

                    <div className="chatbot-quick-responses">
                        {quickResponses.map((response, index) => (
                            <button 
                                key={index}
                                onClick={() => handleQuickResponse(response)}
                                className="quick-response-btn"
                            >
                                {response}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your message..."
                        />
                        <button onClick={handleSend}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotAssistant;