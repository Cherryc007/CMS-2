"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const awards = [
  {
    year: "2023",
    title: "Best Academic Software",
    organization: "Tech for Education Summit",
    description: "Recognized for innovation in academic conference management"
  },
  {
    year: "2022",
    title: "Academic Technology Excellence",
    organization: "Global EdTech Alliance",
    description: "Award for our commitment to improving academic workflows"
  },
  {
    year: "2021",
    title: "Innovation in Research Tools",
    organization: "Research Technology Association",
    description: "Honored for our revolutionary approach to paper submissions"
  }
];

export default function AwardsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Awards & Recognition
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our commitment to excellence has been recognized by leading organizations.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {awards.map((award, index) => (
            <motion.div
              key={award.title}
              className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              {/* Trophy icon that appears on hover */}
              <motion.div
                className="absolute top-3 right-3 text-yellow-500"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                🏆
              </motion.div>
              
              {/* Year badge */}
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {award.year}
              </div>
              
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {award.title}
              </h3>
              
              <div className="text-blue-600 dark:text-blue-400 text-sm mb-2">
                {award.organization}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {award.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
        >
          <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-4 py-2 rounded-md">
            Trusted by researchers at 500+ institutions worldwide
          </div>
        </motion.div>
      </div>
    </section>
  );
} 