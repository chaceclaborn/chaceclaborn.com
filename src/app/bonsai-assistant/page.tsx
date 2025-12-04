'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  Thermometer,
  Sun,
  Wifi,
  CheckCircle2,
  Clock,
  Wrench,
  Leaf,
  Cpu,
  BarChart3
} from 'lucide-react';

const projectStatus = [
  { label: 'Initial Build & Testing', status: 'complete', icon: CheckCircle2 },
  { label: 'Sensor Integration', status: 'complete', icon: CheckCircle2 },
  { label: 'Full Deployment', status: 'in-progress', icon: Clock },
  { label: 'Mobile App', status: 'planned', icon: Wrench },
];

const features = [
  {
    icon: Droplets,
    title: 'Smart Irrigation',
    description: 'Automated watering based on soil moisture levels and plant needs.',
  },
  {
    icon: Thermometer,
    title: 'Climate Monitoring',
    description: 'Real-time temperature and humidity tracking for optimal growing conditions.',
  },
  {
    icon: Sun,
    title: 'Light Sensing',
    description: 'Monitors light exposure to ensure proper photosynthesis cycles.',
  },
  {
    icon: Wifi,
    title: 'IoT Connected',
    description: 'Remote monitoring and control via WiFi-enabled microcontroller.',
  },
];

const techStack = [
  'ESP32 Microcontroller',
  'Capacitive Soil Sensors',
  'DHT22 Temp/Humidity',
  'Relay Module',
  'Python',
  'Firebase',
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
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function BonsaiAssistantPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Leaf className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Bonsai Assistant
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An automated irrigation and monitoring system for bonsai trees -
            combining IoT technology with the ancient art of bonsai cultivation.
          </p>
        </motion.div>

        {/* Project Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Card className="border-2 border-primary/20 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projectStatus.map((phase, index) => (
                  <div
                    key={index}
                    className={`text-center p-4 rounded-lg ${
                      phase.status === 'complete'
                        ? 'bg-green-500/10'
                        : phase.status === 'in-progress'
                        ? 'bg-yellow-500/10'
                        : 'bg-muted'
                    }`}
                  >
                    <phase.icon
                      className={`h-6 w-6 mx-auto mb-2 ${
                        phase.status === 'complete'
                          ? 'text-green-600'
                          : phase.status === 'in-progress'
                          ? 'text-yellow-600'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <p className="text-sm font-medium">{phase.label}</p>
                    <Badge
                      variant="outline"
                      className={`mt-2 text-xs ${
                        phase.status === 'complete'
                          ? 'border-green-500 text-green-600'
                          : phase.status === 'in-progress'
                          ? 'border-yellow-500 text-yellow-600'
                          : ''
                      }`}
                    >
                      {phase.status === 'complete'
                        ? 'Complete'
                        : phase.status === 'in-progress'
                        ? 'In Progress'
                        : 'Planned'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            Features
          </h2>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={item}>
                <Card className="h-full shadow-soft card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Technology Stack
          </h2>

          <div className="flex flex-wrap gap-3">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Badge className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-4 py-2 text-sm">
                  {tech}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Coming Soon */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">More Details Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                This project is actively being developed. Check back for updates,
                build logs, and a live dashboard showing real-time sensor data.
              </p>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
