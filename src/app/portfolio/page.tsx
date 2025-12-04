'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Presentation, Github, ExternalLink, Cpu, Download } from 'lucide-react';

const projects = [
  {
    title: 'Career Technical Presentation',
    description: 'Comprehensive overview of my career journey, technical skills, and key projects in manufacturing and aerospace engineering.',
    icon: Presentation,
    tags: ['Manufacturing', 'Aerospace', 'Engineering'],
    link: '/files/Career Technical Presentation - On-Going.pptx',
    linkText: 'Download Presentation',
    isDownload: true,
  },
  {
    title: 'GitHub Portfolio',
    description: 'Collection of my coding projects, including web development, automation scripts, and engineering tools.',
    icon: Github,
    tags: ['Python', 'JavaScript', 'Automation'],
    link: 'https://github.com/chaceclaborn',
    linkText: 'View GitHub',
    isExternal: true,
  },
  {
    title: 'Bonsai Assistant Project',
    description: 'Arduino-based automated irrigation system for bonsai trees. Features soil moisture monitoring, automated watering, and data logging.',
    icon: Cpu,
    tags: ['Arduino', 'IoT', 'Automation'],
    link: '/bonsai-assistant',
    linkText: 'View Project',
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PortfolioPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Portfolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Technical projects and contributions to aerospace engineering.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div key={project.title} variants={item}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <project.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    {project.isDownload ? (
                      <a href={project.link} download>
                        <Download className="mr-2 h-4 w-4" />
                        {project.linkText}
                      </a>
                    ) : project.isExternal ? (
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {project.linkText}
                      </a>
                    ) : (
                      <Link href={project.link}>
                        {project.linkText}
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
