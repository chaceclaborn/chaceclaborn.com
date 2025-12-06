'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamic import to avoid SSR issues with Three.js
const SolarSystem = dynamic(
  () => import('@/components/three/SolarSystem').then((mod) => mod.SolarSystem),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] md:h-[500px] w-full bg-black/90 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading Solar System...</p>
        </div>
      </div>
    )
  }
);

export function SolarSystemSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            Solar System Simulation
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl overflow-hidden bg-black/90 shadow-2xl"
        >
          <SolarSystem
            className="h-[400px] md:h-[500px] w-full"
            showExpandButton={true}
            showLabels={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
