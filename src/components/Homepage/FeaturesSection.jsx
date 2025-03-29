"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    id: 1,
    icon: "📊",
    title: "Conference Management",
    description: "Create and manage academic conferences with comprehensive tools for paper submissions, reviews, and scheduling.",
    color: "blue"
  },
  {
    id: 2,
    icon: "📝",
    title: "Paper Submissions",
    description: "Streamlined submission process with automatic validation, version control, and format checking.",
    color: "purple"
  },
  {
    id: 3,
    icon: "🔍",
    title: "Peer Review",
    description: "Double-blind peer review system with customizable evaluation criteria and reviewer assignment.",
    color: "green" 
  },
  {
    id: 4,
    icon: "🗓️",
    title: "Scheduling",
    description: "Intelligent scheduling tools to organize sessions, avoid conflicts, and create perfect conference agendas.",
    color: "yellow"
  },
  {
    id: 5,
    icon: "📱",
    title: "Mobile Friendly",
    description: "Responsive design allows participants to access conference information from any device.",
    color: "red"
  },
  {
    id: 6,
    icon: "🔒",
    title: "Secure Platform",
    description: "Enterprise-grade security to protect sensitive research data and personal information.",
    color: "indigo"
  }
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <section ref={ref} className="py-16 bg-gray-50 dark:bg-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Conference Management
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to create, manage, and deliver exceptional academic conferences
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className={`bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-b-4 border-${feature.color}-500 h-full`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={`w-12 h-12 text-2xl flex items-center justify-center rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 