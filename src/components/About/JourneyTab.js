"use client";

import { motion } from "framer-motion";

const journeyMilestones = [
  {
    year: "2018",
    title: "Foundation",
    description: "CMS was founded with a vision to revolutionize academic conference management."
  },
  {
    year: "2019",
    title: "First Major Partnership",
    description: "Partnered with the International Association of Computer Science to power their annual conference."
  },
  {
    year: "2020",
    title: "Virtual Conference Solutions",
    description: "Rapidly developed and deployed virtual conference tools in response to global changes."
  },
  {
    year: "2022",
    title: "Global Expansion",
    description: "Expanded services to support conferences in over 50 countries and 25 languages."
  },
  {
    year: "2023",
    title: "AI Integration",
    description: "Introduced AI-powered features for paper matching, plagiarism detection, and scheduling."
  }
];

export default function JourneyTab() {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h3 
        className="text-xl font-bold text-gray-900 dark:text-white mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Our Journey
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-300 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        From a small startup to a leading conference management platform, our journey has been 
        driven by innovation and academic excellence.
      </motion.p>
      
      <div className="relative border-l-2 border-blue-500 dark:border-blue-400 pl-6 ml-2 space-y-8">
        {journeyMilestones.map((milestone, index) => (
          <motion.div 
            key={index} 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
          >
            {/* Timeline dot */}
            <motion.div 
              className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.15 }}
            ></motion.div>
            
            {/* Year badge */}
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded mb-2">
              {milestone.year}
            </div>
            
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              {milestone.title}
            </h4>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              {milestone.description}
            </p>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        whileHover={{ scale: 1.02 }}
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">The Future</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          We continue to innovate and improve our platform, with exciting developments in AI, 
          blockchain for verification, and enhanced collaboration tools.
        </p>
      </motion.div>
    </motion.div>
  );
} 