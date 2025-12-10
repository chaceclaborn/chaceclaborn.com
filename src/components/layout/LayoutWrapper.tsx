'use client';

import { useState } from 'react';
import { Footer } from './Footer';
import { ChatAgent } from '@/components/chat/ChatAgent';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(prev => !prev);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer onChatToggle={handleChatToggle} isChatOpen={isChatOpen} />
      <ChatAgent isOpen={isChatOpen} onClose={handleChatClose} />
    </>
  );
}
