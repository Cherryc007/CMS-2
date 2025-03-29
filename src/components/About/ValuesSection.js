"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const values = [
  {
    title: "Innovation",
    description: "We continuously seek new ways to improve conference management through cutting-edge technology.",
    icon: "💡"
  },
  {
    title: "Reliability",
    description: "Our platform is built for stability and performance, ensuring your conference runs smoothly.",
    icon: "🛡️"
  },
  {
    title: "Accessibility",
    description: "We design inclusive solutions that work for researchers around the world.",
    icon: "🌍"
  },
  {
    title: "Community",
    description: "We believe in fostering meaningful connections within the academic community.",
    icon: "🤝"
  }
];

export default function ValuesSection() {
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
            Our Core Values
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            These principles guide our work and shape how we develop our platform.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start">
                <motion.div 
                  className="text-3xl mr-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {value.icon}
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 