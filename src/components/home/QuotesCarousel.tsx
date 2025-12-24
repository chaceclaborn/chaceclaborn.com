'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuoteItem {
  text: string;
  author: string;
}

const quotes: QuoteItem[] = [
  {
    text: "The moment you give up is the moment you let someone else win.",
    author: "Kobe Bryant"
  },
  {
    text: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. Twenty-six times I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan"
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali"
  },
  {
    text: "Success is not an accident, success is a choice.",
    author: "Stephen Curry"
  },
  {
    text: "Compare yourself to who you were yesterday, not to who someone else is today.",
    author: "Jordan Peterson"
  },
  {
    text: "Hard work beats talent when talent doesn't work hard.",
    author: "Tim Notke"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  }
];

export function QuotesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextQuote = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  }, []);

  const prevQuote = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, []);

  const startAutoAdvance = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(nextQuote, 6000);
  }, [nextQuote]);

  const pauseAndNavigate = useCallback((direction: 'next' | 'prev') => {
    // Clear auto-advance interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clear any existing pause timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Navigate
    if (direction === 'next') {
      nextQuote();
    } else {
      prevQuote();
    }

    // Resume auto-advance after 5 seconds
    pauseTimeoutRef.current = setTimeout(() => {
      startAutoAdvance();
    }, 5000);
  }, [nextQuote, prevQuote, startAutoAdvance]);

  // Start auto-advance on mount
  useEffect(() => {
    startAutoAdvance();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [startAutoAdvance]);

  return (
    <section className="py-8 md:py-10 relative">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="relative p-6 md:p-8">
          {/* Navigation buttons */}
          <button
            onClick={() => pauseAndNavigate('prev')}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
            aria-label="Previous quote"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => pauseAndNavigate('next')}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
            aria-label="Next quote"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="relative min-h-[100px] flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-center"
              >
                <blockquote className="text-lg md:text-xl text-muted-foreground italic leading-relaxed">
                  &ldquo;{quotes[currentIndex].text}&rdquo;
                </blockquote>
                <cite className="text-primary/70 text-sm not-italic mt-2 block">
                  — {quotes[currentIndex].author}
                </cite>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {quotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-4 bg-primary/50'
                    : 'w-1.5 bg-primary/20 hover:bg-primary/30'
                }`}
                aria-label={`Go to quote ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
