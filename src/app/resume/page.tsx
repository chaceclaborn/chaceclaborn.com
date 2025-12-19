'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Mail, MapPin, Linkedin, GraduationCap, Briefcase, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

const experience = [
  {
    title: 'Propulsion Design Engineer II - BE-3U Turbomachinery',
    company: 'Blue Origin',
    period: '2025 - Present',
    highlights: [
      'Coming Soon'
    ],
  },
  
  {
    title: 'Hardware Manufacturing Engineer II - BE-3U Turbomachinery',
    company: 'Blue Origin',
    period: '2025',
    highlights: [
      'Develop and update manufacturing work instructions and support the shop floor for BE-4 and BE-3U rocket engine components such as turbomachinery, valves, and various other components',
      'Perform comprehensive engineering analysis and dispositions of non-conformances, applying advanced problemsolving techniques to ensure compliance with design specifications and production standards',
      'Defines, develops, implements, and optimizes Hydroformed parts and equipment consisting of exotic materials, dies, and other supporting tooling; operates, troubleshoots, and programs recipes for new hardware',
      'Utilize Python and SQL for data analysis, creating queries and scripts to identify trends, track non-conformances, and support manufacturing improvements (e.g., building dashboards and visualizations on Redash and Databricks)',
      'Apply Lean manufacturing principles to streamline workflows and drive continuous improvement, utilizing ITS JIRA to track team progress, manage tasks, and align objectives with operational goals',
      'Track project milestones and collaborate with cross-functional teams to ensure on-time delivery of insourced components, driving vertical integration and enhancing production workflow',
      'Created AI Agents, AI workflows, and leveraged Artificial Intelligence for querying, data analysis, and troubleshooting',
      'Started development on full-stack web-based applications like Turbo Build Book for subassembly processes'
    ],
  },
  {
    title: 'Manufacturing Process Engineer II - Turbomachinery, Valves, Combustion Devices, Thrust Chamber Assembly',
    company: 'Blue Origin',
    period: '2022 – 2024',
    highlights: [
      'Lead GD&T application and design-for-manufacturability feedback for turbomachinery, valves, and other engine components - reducing cycle time, minimizing non-conformances, and improving part Cpk values',
      'Leverage CAD/CAM software to design custom fixtures and tooling, analyze CNC programs, redline engineering drawings, generate exploded assembly views—supporting efficient machining and enhanced part manufacturability',
      'Drive machining process development and standardization for CNC operations in support of rocket engine hardware',
      'Designed and implemented CNC probing routines and macros to streamline and automate setup processes, reduce manual intervention, and eliminate variation in critical dimensions',
      'Led iterative NPI process refinement, utilizing root cause analysis and continuous feedback loops to optimize machining techniques and drive successful production outcomes',
      'Collaborate with external vendors to implement cutting tool trials and enhance software (e.g., Vericut for CNC simulation, PLC programming for Hydroforming press) to improve machining precision and process efficiency',
      'Organize best practices, conduct RCCAs, and facilitate knowledge transfer among machinists and programmers'
    ],
  },
  {
    title: 'Systems/Test Engineer Intern - RL10 Rocket Engines',
    company: 'Aerojet Rocketdyne',
    period: 'May 2021 – August 2021',
    highlights: [
      'Reviewed and updated Field Service Manuals for rocket engine systems',
      'Observed and documented engine testing and assembly procedures',
      'Assisted with inspection and quality assurance protocols',
      'Developed engine shock recorder handling documentation',
    ],
  },
  {
    title: 'Process Engineer/Quality Inspector Intern',
    company: 'Precision Grinding Inc.',
    period: 'May 2020 – January 2021',
    highlights: [
      'Inspected close-tolerance parts using precision measurement equipment',
      'Programmed CMM routines using PolyWorks software',
      'Created GD&T-compliant quality inspection reports',
      'Documented standard operating procedures for inspection processes',
    ],
  },
];

const skills = {
  'CAD/CAM': ['Creo Parametric', 'Siemens NX', 'SolidWorks'],
  'Programming': ['SQL', 'Python', 'MATLAB', 'G-Code', 'Siemens 840D'],
  'Manufacturing': ['GD&T', '3D Printing', 'CNC Programming', 'Hydroforming', 'Lean Manufacturing'],
  'Data Analysis': ['Redash', 'Databricks', 'Tableau', 'Microsoft Office'],
  'Advanced Tools': ['Vericut', 'PLC Programming', 'PolyWorks', 'CMM', 'Hexagon Romer Arm'],
};

const achievements = [
  'Graduated Magna Cum Laude with 3.79 GPA from Auburn University',
  'Led GD&T standardization reducing cycle time by 15%',
  'Implemented CNC probing routines',
  'Developed automated data analysis tools in Python/SQL',
  'Contributed to vertical integration for rocket engine production'
];

const certifications = [
  'Working on Space Systems Certification from Auburn',
  'Working on Artificial Intelligence Certification from Auburn. '
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

export default function ResumePage() {
  return (
    <div className="min-h-screen py-8 md:py-12 relative">
      {/* Futuristic background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--primary) 1px, transparent 1px),
                             linear-gradient(90deg, var(--primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-primary/40 shadow-lg">
            <AvatarImage src="/images/profile.jpg" alt="Chace Claborn" />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">CC</AvatarFallback>
          </Avatar>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Chace Taylor Claborn
          </h1>
          <p className="text-xl text-primary font-semibold mb-4">
            Propulsion Design Engineer
          </p>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground mb-6">
            <a href="mailto:chaceclaborn@gmail.com" className="hover:text-primary transition-colors flex items-center gap-1">
              <Mail className="h-4 w-4" />
              chaceclaborn@gmail.com
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="https://linkedin.com/in/chaceclaborn" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Huntsville, AL
            </span>
          </div>

          {/* Education */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Auburn University • BS Mechanical Engineering • 3.79 GPA • 2022</span>
          </div>

          {/* Download Button */}
          <Button asChild size="lg" className="group">
            <a href="/files/Chace Claborn Resume.pdf" download>
              <Download className="mr-2 h-4 w-4" />
              Download Resume PDF
            </a>
          </Button>
        </motion.div>

        {/* Experience Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Professional Experience</h2>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {experience.map((job, index) => (
              <motion.div key={index} variants={item}>
                <Card className="border-l-4 border-l-primary shadow-soft card-hover overflow-hidden group">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors">{job.title}</CardTitle>
                        <p className="text-primary font-semibold">{job.company}</p>
                      </div>
                      <Badge variant="secondary" className="w-fit text-sm px-3 py-1">{job.period}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {job.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <Separator className="my-12 opacity-50" />

        {/* Skills Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Technical Skills</h2>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {Object.entries(skills).map(([category, items]) => (
              <motion.div key={category} variants={item}>
                <Card className="h-full shadow-soft card-hover group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-primary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <Badge key={skill} variant="outline" className="skill-badge">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <Separator className="my-12 opacity-50" />

        {/* Achievements & Certifications */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Key Achievements</h2>
            </div>
            <Card className="shadow-soft">
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{achievement}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Certifications</h2>
            </div>
            <Card className="shadow-soft h-[calc(100%-3.5rem)]">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-3">
                  {certifications.map((cert, index) => (
                    <motion.div
                      key={cert}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 px-4 py-2 text-sm cursor-default">
                        {cert}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>

      </div>
    </div>
  );
}
