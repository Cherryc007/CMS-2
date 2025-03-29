"use client";

import { motion } from "framer-motion";

export default function MissionTab() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="space-y-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 dark:text-white"
          variants={item}
        >
          Our Mission
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          variants={item}
        >
          At CMS, our mission is to revolutionize academic conferences by providing a comprehensive, 
          user-friendly platform that streamlines the entire conference management process from 
          submission to publication.
        </motion.p>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
          variants={item}
        >
          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Empowering Researchers</h4>
            <p className="text-gray-700 dark:text-gray-300">
              We aim to empower researchers worldwide by providing tools that simplify the submission, 
              review, and publication processes.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Connecting Communities</h4>
            <p className="text-gray-700 dark:text-gray-300">
              Our platform facilitates seamless communication and collaboration between researchers, 
              reviewers, and organizers.
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="pt-4"
          variants={item}
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Our Core Values</h4>
          <ul className="space-y-2">
            {[
              "Innovation in academic technology",
              "Transparency in the review process",
              "Accessibility for researchers worldwide",
              "Excellence in user experience"
            ].map((value, index) => (
              <motion.li 
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              >
                <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">{value}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
} 