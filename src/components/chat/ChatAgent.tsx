'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Knowledge base with weighted keywords and contextual responses
interface KnowledgeEntry {
  keywords: string[];
  response: string;
  weight: number; // Higher weight = more specific match
}

const knowledge: KnowledgeEntry[] = [
  // Greetings
  { keywords: ['hello', 'hi', 'hey', 'greetings'], response: "Hello! I can help you learn about Chace's work and experience. What would you like to know?", weight: 1 },
  { keywords: ['how are you', 'whats up', "what's up"], response: "I'm doing great! Ready to help you explore Chace's portfolio. Ask me about his experience, skills, or projects.", weight: 2 },
  { keywords: ['thanks', 'thank you', 'thx'], response: "You're welcome! Let me know if you have any other questions.", weight: 1 },
  { keywords: ['bye', 'goodbye', 'see you'], response: "Goodbye! Feel free to come back if you have more questions.", weight: 1 },

  // Current Role
  { keywords: ['current', 'job', 'work', 'doing now', 'position'], response: "Chace is currently a Propulsion Design Engineer at Blue Origin in Huntsville, AL. He designs and analyzes rocket engine components, applying GD&T expertise for design-for-manufacturability.", weight: 3 },
  { keywords: ['propulsion', 'design engineer'], response: "As a Propulsion Design Engineer, Chace works on rocket engine component design, CAD/CAM solutions for fixtures and tooling, and leads NPI (New Product Introduction) process refinement.", weight: 4 },
  { keywords: ['blue origin'], response: "At Blue Origin, Chace works on propulsion systems design. He previously worked there as a Manufacturing Process Engineer on the BE-4 and BE-3U rocket engines before transitioning to his current design role.", weight: 4 },

  // Previous Experience
  { keywords: ['previous', 'before', 'past', 'history', 'background'], response: "Before his current role, Chace was a Manufacturing Process Engineer at Blue Origin (2022-2024) working on BE-4 and BE-3U engines. He also interned at Aerojet Rocketdyne and Precision Grinding Inc.", weight: 3 },
  { keywords: ['manufacturing', 'process engineer'], response: "As a Manufacturing Process Engineer at Blue Origin (2022-2024), Chace developed tooling for the BE-4 engine, created Python automation tools, and led Lean Manufacturing initiatives.", weight: 4 },
  { keywords: ['intern', 'internship'], response: "Chace completed internships at Aerojet Rocketdyne (Propulsion Design, 2022) and Precision Grinding Inc. (Quality Engineering, 2021), gaining hands-on experience in aerospace manufacturing.", weight: 3 },
  { keywords: ['aerojet', 'rocketdyne'], response: "At Aerojet Rocketdyne, Chace interned as a Propulsion Design Engineer in 2022, working on propulsion system analysis and design.", weight: 4 },
  { keywords: ['be-4', 'be4'], response: "The BE-4 is Blue Origin's methane-fueled rocket engine. Chace worked on manufacturing processes and tooling for the BE-4 during his time as a Process Engineer.", weight: 4 },
  { keywords: ['be-3', 'be3', 'be-3u'], response: "The BE-3U is Blue Origin's upper-stage hydrogen engine. Chace contributed to manufacturing processes for this engine as a Process Engineer.", weight: 4 },

  // Education
  { keywords: ['education', 'degree', 'university', 'college', 'school', 'studied'], response: "Chace graduated from Auburn University in 2022 with a BS in Mechanical Engineering and a 3.79 GPA. War Eagle!", weight: 3 },
  { keywords: ['auburn'], response: "Chace is an Auburn University graduate (Class of 2022) with a BS in Mechanical Engineering. He achieved a 3.79 GPA and was active in engineering organizations.", weight: 4 },
  { keywords: ['gpa', 'grades'], response: "Chace graduated from Auburn University with a 3.79 GPA in Mechanical Engineering.", weight: 3 },
  { keywords: ['mechanical engineering'], response: "Chace holds a BS in Mechanical Engineering from Auburn University. His coursework focused on thermodynamics, fluid mechanics, and machine design.", weight: 3 },

  // Skills - Technical
  { keywords: ['skills', 'technical', 'abilities', 'capable'], response: "Chace's skills include: CAD/CAM (Creo, NX, SolidWorks), Programming (Python, SQL, MATLAB), Manufacturing (GD&T, CNC, 3D Printing), and Data Analysis (Redash, Databricks, Tableau).", weight: 2 },
  { keywords: ['cad', 'solidworks', 'creo', 'nx', '3d modeling'], response: "Chace is proficient in multiple CAD systems including Creo, NX, and SolidWorks. He uses these for component design, fixture development, and manufacturing documentation.", weight: 4 },
  { keywords: ['programming', 'coding', 'python', 'sql'], response: "Chace programs in Python and SQL, primarily for automation and data analysis. He's also experienced with MATLAB and G-Code for manufacturing applications.", weight: 3 },
  { keywords: ['gd&t', 'geometric', 'tolerancing', 'dimensioning'], response: "Chace has strong GD&T (Geometric Dimensioning & Tolerancing) expertise, which he applies to ensure designs are manufacturable and meet tight aerospace specifications.", weight: 4 },
  { keywords: ['manufacturing', 'cnc', 'machining', '3d print'], response: "Chace has hands-on manufacturing experience including CNC machining, 3D printing, and Lean Manufacturing methodologies from his time as a Process Engineer.", weight: 3 },
  { keywords: ['data', 'analysis', 'analytics', 'tableau', 'databricks'], response: "Chace uses data analysis tools like Redash, Databricks, and Tableau for manufacturing metrics, process optimization, and decision-making.", weight: 3 },

  // Projects
  { keywords: ['project', 'portfolio', 'work samples'], response: "Check out the Portfolio page to see Chace's projects, including engineering presentations, GitHub repositories, and the Bonsai Assistant - an Arduino-based automated irrigation system.", weight: 2 },
  { keywords: ['bonsai', 'arduino', 'irrigation'], response: "The Bonsai Assistant is Chace's personal project - an Arduino-based automated irrigation system for plant care. It demonstrates his skills in electronics and programming outside of work.", weight: 4 },
  { keywords: ['github', 'code', 'repository', 'open source'], response: "Chace maintains GitHub repositories showcasing his personal projects and code. You can find links on the Portfolio page.", weight: 3 },

  // Contact
  { keywords: ['contact', 'email', 'reach', 'message', 'get in touch'], response: "You can reach Chace at chaceclaborn@gmail.com or connect on LinkedIn at linkedin.com/in/chaceclaborn", weight: 3 },
  { keywords: ['linkedin', 'social', 'profile'], response: "Connect with Chace on LinkedIn: linkedin.com/in/chaceclaborn", weight: 3 },
  { keywords: ['phone', 'call'], response: "For professional inquiries, please reach out via email at chaceclaborn@gmail.com or LinkedIn.", weight: 2 },
  { keywords: ['hire', 'hiring', 'available', 'job opportunities'], response: "For career opportunities, please reach out to Chace directly via email at chaceclaborn@gmail.com or on LinkedIn.", weight: 3 },

  // Resume
  { keywords: ['resume', 'cv', 'curriculum'], response: "You can view Chace's full resume on the Resume page, which includes detailed work experience, skills, achievements, and certifications.", weight: 3 },
  { keywords: ['certification', 'certified', 'credentials'], response: "Check the Resume page for Chace's professional certifications and credentials in engineering and manufacturing.", weight: 3 },

  // Site Navigation
  { keywords: ['page', 'navigate', 'find', 'where', 'section'], response: "This site has several pages: Home (overview), Portfolio (projects), Resume (experience), and you can also explore the interactive Solar System and Earth satellite visualizations!", weight: 2 },
  { keywords: ['solar system', 'planets', 'space'], response: "Try the Solar System Explorer! Click 'Explore' on the home page or navigate to /solar-system. You can also click on Earth to see real satellite orbits.", weight: 3 },
  { keywords: ['satellite', 'earth', 'orbit'], response: "Check out the Earth & Satellites page (/earth) to see real satellites orbiting Earth, including the ISS, Hubble, GPS satellites, and more!", weight: 3 },

  // Rocket/Aerospace
  { keywords: ['rocket', 'engine', 'aerospace', 'space'], response: "Chace works in aerospace propulsion at Blue Origin, contributing to rocket engine development. He's passionate about space exploration and the future of spaceflight.", weight: 3 },
  { keywords: ['huntsville', 'alabama', 'location'], response: "Chace is based in Huntsville, Alabama - a major hub for aerospace and defense with NASA's Marshall Space Flight Center and numerous aerospace companies.", weight: 3 },

  // About the chatbot
  { keywords: ['who are you', 'what are you', 'chatbot', 'bot', 'assistant'], response: "I'm a simple assistant for Chace's portfolio website. I can answer questions about his experience, skills, education, and projects. For complex questions, feel free to reach out directly!", weight: 2 },
  { keywords: ['help', 'can you', 'what can'], response: "I can tell you about Chace's work experience, education, technical skills, projects, and how to contact him. Just ask!", weight: 2 },
];

// Smart response matching with scoring
function getResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  // Handle empty or very short input
  if (lower.length < 2) {
    return "Could you tell me more about what you'd like to know?";
  }

  // Score each knowledge entry
  const scores: { entry: KnowledgeEntry; score: number }[] = [];

  for (const entry of knowledge) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        // Exact word match gets higher score
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(lower)) {
          score += entry.weight * 2;
        } else {
          score += entry.weight;
        }
      }
    }
    if (score > 0) {
      scores.push({ entry, score });
    }
  }

  // Sort by score (highest first)
  scores.sort((a, b) => b.score - a.score);

  // Return best match if score is significant
  if (scores.length > 0 && scores[0].score >= 2) {
    return scores[0].entry.response;
  }

  // Contextual fallbacks based on question type
  if (lower.includes('what') || lower.includes('who') || lower.includes('which')) {
    return "I'm not sure about that specific detail. Try asking about Chace's experience at Blue Origin, his education at Auburn University, or his technical skills.";
  }
  if (lower.includes('how') || lower.includes('why')) {
    return "That's an interesting question! For detailed answers, you might want to reach out to Chace directly at chaceclaborn@gmail.com.";
  }
  if (lower.includes('when') || lower.includes('where')) {
    return "Chace has been at Blue Origin in Huntsville, AL since 2022. For specific timeline details, check out the Resume page.";
  }
  if (lower.includes('?')) {
    return "I'm not sure about that. I can help with questions about Chace's experience, skills, education, or projects. What would you like to know?";
  }

  // Default response
  return "I can tell you about Chace's work at Blue Origin, his Auburn education, technical skills, or projects. What interests you?";
}

export function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I can help you learn about Chace's experience and skills. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Variable typing delay based on response length
    const response = getResponse(userMsg.content);
    const delay = Math.min(400 + response.length * 5, 1200);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
      setIsTyping(false);
    }, delay);
  };

  const quickActions = [
    { label: 'Experience', query: 'What is your current job?' },
    { label: 'Skills', query: 'What are your technical skills?' },
    { label: 'Education', query: 'Where did you go to school?' },
    { label: 'Contact', query: 'How can I contact you?' },
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-5 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] bg-background border border-border rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-medium text-sm">Assistant</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                >
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-72 overflow-y-auto p-3 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted px-3 py-2 rounded-lg">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                  <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => {
                          setInput(action.query);
                          setTimeout(handleSend, 50);
                        }}
                        className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask a question..."
                      className="flex-1 px-3 py-2 text-sm rounded-md bg-muted border-0 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      size="icon"
                      className="h-9 w-9 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
