'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function HeroLayer() {
  return (
    <div className="w-full h-full max-w-5xl mx-auto flex items-center justify-center px-4 sm:px-6">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-14 items-center w-full">
        {/* Left Column - Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-5 md:space-y-6"
        >
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative group"
            >
              <div className="h-32 w-32 sm:h-36 sm:w-36 md:h-44 md:w-44 lg:h-48 lg:w-48 rounded-full border-4 border-primary/40 p-1 shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 bg-background">
                <Avatar className="h-full w-full">
                  <AvatarImage src="/images/profile.jpg" alt="Chace Claborn" className="!h-[110%] !w-[110%] object-cover object-top -translate-y-[4%]" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl md:text-4xl lg:text-5xl font-bold">
                    CC
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </motion.div>
          </div>

          {/* Name & Title */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-1 md:mb-2">
              Chace Claborn
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-primary font-semibold">
              Mechanical Engineer
            </p>
          </div>

          {/* Bio */}
          <p className="text-muted-foreground text-center md:text-left text-sm sm:text-base md:text-lg max-w-lg leading-relaxed">
            Auburn University graduate and propulsion design engineer, passionate about rocket propulsion
            systems and space exploration.
          </p>

          {/* Social Links */}
          <div className="flex justify-center md:justify-start gap-3 md:gap-4">
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
                className="p-3 md:p-3.5 rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label={label}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 md:gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="group text-sm sm:text-base md:text-lg h-10 sm:h-11 md:h-12 px-5 md:px-6">
              <Link href="/portfolio">
                Portfolio
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group text-sm sm:text-base md:text-lg h-10 sm:h-11 md:h-12 px-5 md:px-6">
              <Link href="/resume">
                Resume
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Right Column - Rocket Engine Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative hidden sm:block"
        >
          <div className="aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden bg-card relative shadow-2xl border border-border/50">
            <Image
              src="/images/carousel/rocket_engine.jpg"
              alt="Rocket Propulsion"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
