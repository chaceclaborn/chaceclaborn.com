'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Presentation, Github, ExternalLink, Cpu, Download, Rocket, Globe } from 'lucide-react';

const projects = [
  {
    title: 'Career Technical Presentation',
    description: 'Comprehensive overview of my career journey, technical skills, and key projects in manufacturing and aerospace engineering.',
    icon: Presentation,
    tags: ['Manufacturing', 'Aerospace', 'Engineering'],
    link: '/files/Career Technical Presentation - On-Going.pptx',
    linkText: 'Download Presentation',
    isDownload: true,
    gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    title: 'GitHub Portfolio',
    description: 'Collection of my coding projects. Trying to develop skills using Typescript, Python, Rust, Tauri, Node.js, etc.',
    icon: Github,
    tags: ['Python', 'JavaScript', 'Automation'],
    link: 'https://github.com/chaceclaborn',
    linkText: 'View GitHub',
    isExternal: true,
    gradient: 'from-green-500/20 to-teal-500/20',
  },
  {
    title: 'Bonsai Assistant Project',
    description: 'Raspberry Pi automated irrigation system for bonsai trees. Features soil moisture monitoring, automated watering, and data logging.',
    icon: Cpu,
    tags: ['Raspberry-Pi', 'IoT', 'Automation'],
    link: '/bonsai-assistant',
    linkText: 'View Project',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    title: 'Solar System Explorer',
    description: 'Interactive 3D visualization of our solar system built with Three.js. Explore planets, orbits, and astronomical data. See what is in space: man-made and naturally',
    icon: Globe,
    tags: ['Three.js', 'React', 'WebGL', 'Real-time'],
    link: '/solar-system',
    linkText: 'Explore',
    gradient: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    title: 'Earth & Satellites',
    description: 'Real-time visualization of Earth with live satellite tracking including ISS, Hubble, and GPS satellites. New features intend to include being able to plan your own space system!',
    icon: Rocket,
    tags: ['Three.js', 'API', 'Real-time'],
    link: '/solar-system/earth',
    linkText: 'View Earth',
    gradient: 'from-cyan-500/20 to-emerald-500/20',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen py-8 md:py-12 relative">
      {/* Futuristic background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                             linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/20 flex items-center justify-center">
              <Rocket className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Portfolio
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Complilation of my technical projects.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {projects.map((project, index) => (
            <motion.div key={project.title} variants={item}>
              <Card className={`group h-full relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 bg-gradient-to-br ${project.gradient}`}>
                {/* Futuristic corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                  <div className="absolute top-3 -right-8 w-24 h-0.5 bg-primary/20 rotate-45 group-hover:bg-primary/40 transition-colors" />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-background/80 backdrop-blur-sm text-primary border border-border/50 group-hover:border-primary/30 transition-colors">
                      <project.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base md:text-lg">{project.title}</CardTitle>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-background/60 backdrop-blur-sm border border-border/50 hover:border-primary/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full group/btn relative overflow-hidden">
                    {project.isDownload ? (
                      <a href={project.link} download className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4 transition-transform group-hover/btn:-translate-y-1" />
                        {project.linkText}
                      </a>
                    ) : project.isExternal ? (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        {project.linkText}
                      </a>
                    ) : (
                      <Link href={project.link} className="flex items-center justify-center gap-2">
                        <span className="transition-transform group-hover/btn:translate-x-1">{project.linkText}</span>
                      </Link>
                    )}
                  </Button>
                </CardContent>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-primary/5 to-transparent" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 md:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/60">
            <div className="w-8 h-px bg-border" />
            <span>More projects coming soon</span>
            <div className="w-8 h-px bg-border" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
