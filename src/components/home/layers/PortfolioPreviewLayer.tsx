'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Rocket, Cog, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

const portfolioHighlights = [
  {
    icon: Rocket,
    title: 'Propulsion Systems',
    description: 'Design and analysis of turbomachinery components for rocket engines.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Cog,
    title: 'Mechanical Design',
    description: 'CAD modeling, FEA analysis, and manufacturing process development.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Code,
    title: 'Software Projects',
    description: 'Full-stack development, data analysis, and engineering tools.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
];

export function PortfolioPreviewLayer() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-full py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Featured Work
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A glimpse into my engineering projects and technical expertise.
          From rocket propulsion to software development.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 w-full mb-12">
        {portfolioHighlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
          >
            <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button asChild size="lg" className="group">
          <Link href="/portfolio">
            Explore Full Portfolio
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
