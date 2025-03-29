"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServiceCard({ service }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const expandVariants = {
    collapsed: { height: 0, opacity: 0 },
    expanded: { 
      height: "auto", 
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 rounded-full ${service.color} text-white flex items-center justify-center text-2xl mr-4`}>
            {service.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {service.title}
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {service.description}
        </p>
        
        <button 
          className={`text-sm font-medium ${service.color.replace('bg-', 'text-')} flex items-center`}
        >
          Learn more
          <svg 
            className={`ml-1 w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="px-6 pb-6"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Features:</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Advanced tools for {service.title.toLowerCase()} management</li>
                <li>Real-time updates and notifications</li>
                <li>Collaborative editing and feedback</li>
                <li>Comprehensive analytics and reporting</li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button 
                  className={`px-4 py-2 rounded-md ${service.color} text-white font-medium text-sm transition-transform transform hover:scale-105`}
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 