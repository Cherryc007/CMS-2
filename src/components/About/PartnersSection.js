"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const partners = [
  { name: "University Research Alliance", logo: "🏛️" },
  { name: "GlobalScience Foundation", logo: "🔬" },
  { name: "TechConf Solutions", logo: "💻" },
  { name: "Academic Publishers International", logo: "📚" },
  { name: "Innovation Labs", logo: "🧪" },
  { name: "Research Connect", logo: "🔍" }
];

export default function PartnersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Our Partners
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We collaborate with leading organizations in academia and technology.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <motion.div 
                className="text-4xl mb-3"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {partner.logo}
              </motion.div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                {partner.name}
              </h3>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
            Interested in partnering with us? We are always looking for new collaborations.
          </p>
          <motion.button 
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Become a Partner
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
} 