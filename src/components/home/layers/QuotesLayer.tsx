'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

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

export function QuotesLayer() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextQuote = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length);
  }, []);

  const prevQuote = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextQuote, 6000);
    return () => clearInterval(interval);
  }, [nextQuote]);

  return (
    <div
      className="w-full h-full max-w-2xl mx-auto flex flex-col items-center justify-center px-3 sm:px-4 pb-14 sm:pb-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-3 sm:mb-4"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
          Words of Inspiration
        </h2>
        <p className="text-muted-foreground text-[11px] sm:text-xs md:text-sm">
          Quotes that drive my passion for excellence.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full relative p-6 md:p-10 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
      >
        {/* Quote icon - hidden on mobile */}
        <Quote className="hidden sm:block absolute top-4 left-4 h-6 w-6 text-primary/20" />

        {/* Navigation buttons - larger touch targets with high z-index */}
        <button
          onClick={prevQuote}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/80 active:bg-muted transition-all cursor-pointer select-none"
          style={{ zIndex: 100, touchAction: 'manipulation' }}
          aria-label="Previous quote"
          type="button"
        >
          <ChevronLeft className="h-6 w-6 md:h-7 md:w-7 pointer-events-none" />
        </button>
        <button
          onClick={nextQuote}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/80 active:bg-muted transition-all cursor-pointer select-none"
          style={{ zIndex: 100, touchAction: 'manipulation' }}
          aria-label="Next quote"
          type="button"
        >
          <ChevronRight className="h-6 w-6 md:h-7 md:w-7 pointer-events-none" />
        </button>

        <div className="relative min-h-[120px] md:min-h-[150px] flex items-center justify-center px-10 md:px-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-center"
            >
              <blockquote className="text-base sm:text-lg md:text-xl text-foreground italic leading-relaxed mb-3">
                &ldquo;{quotes[currentIndex].text}&rdquo;
              </blockquote>
              <cite className="text-primary font-medium text-sm md:text-base not-italic">
                &mdash; {quotes[currentIndex].author}
              </cite>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators - clickable dots */}
        <div className="flex justify-center gap-2 md:gap-3 mt-4 md:mt-6">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 md:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'w-6 md:w-8 bg-primary'
                  : 'w-2 md:w-2.5 bg-primary/30 hover:bg-primary/50'
              }`}
              style={{ touchAction: 'manipulation' }}
              aria-label={`Go to quote ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
