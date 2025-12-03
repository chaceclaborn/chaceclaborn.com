'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Rocket, Cog, Wrench, Building2 } from 'lucide-react';
import { Github, Linkedin, Mail, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Dev placeholder slides with gradient backgrounds and icons
const carouselSlides = [
  { color: 'from-primary/40 to-sage-500/20', label: 'Rocket Propulsion', Icon: Rocket },
  { color: 'from-sage-600/40 to-primary/20', label: 'Manufacturing', Icon: Cog },
  { color: 'from-sage-700/40 to-sage-400/20', label: 'Engineering', Icon: Wrench },
  { color: 'from-primary/30 to-sage-600/30', label: 'Blue Origin', Icon: Building2 },
];

export function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  const prevImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <section className="py-16 md:py-20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Profile Image */}
            <div className="flex justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative group"
              >
                <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-primary/40 shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary/20">
                  <AvatarImage src="/images/profile.jpg" alt="Chace Claborn" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                    CC
                  </AvatarFallback>
                </Avatar>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </motion.div>
            </div>

            {/* Name & Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                Chace Claborn
              </h1>
              <p className="text-xl md:text-2xl text-primary font-semibold">
                Propulsion Design Engineer
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Blue Origin
              </p>
            </div>

            {/* Bio */}
            <p className="text-muted-foreground text-center lg:text-left max-w-lg leading-relaxed">
              Auburn University graduate and Propulsion Design Engineer at Blue Origin.
              Passionate about aerospace engineering, rocket propulsion systems, and building
              innovative solutions for space exploration.
            </p>

            {/* Social Links */}
            <div className="flex justify-center lg:justify-start gap-3">
              {[
                { href: 'https://linkedin.com/in/chaceclaborn', icon: Linkedin, label: 'LinkedIn' },
                { href: 'https://github.com/chaceclaborn', icon: Github, label: 'GitHub' },
                { href: 'mailto:chaceclaborn@gmail.com', icon: Mail, label: 'Email' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-3 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="group">
                <Link href="/portfolio">
                  View Portfolio
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="group">
                <Link href="/resume">
                  View Resume
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative group shadow-lg">
              {/* Placeholder slides with gradients and icons */}
              {carouselSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-br ${slide.color} flex flex-col items-center justify-center ${
                    index === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <slide.Icon className="h-20 w-20 md:h-28 md:w-28 text-primary/60 mb-4" />
                  <span className="text-xl md:text-2xl font-semibold text-foreground/70">{slide.label}</span>
                  <span className="text-sm text-muted-foreground mt-2">Coming Soon</span>
                </div>
              ))}

              {/* Navigation */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {carouselSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImage
                        ? 'w-6 bg-primary'
                        : 'w-1.5 bg-background/60 hover:bg-background/80'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
