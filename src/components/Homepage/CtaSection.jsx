"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

export default function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  return (
    <section ref={ref} className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full opacity-10"
          initial={{ scale: 0, x: 100 }}
          animate={isInView ? { scale: 1, x: 50 } : { scale: 0, x: 100 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10"
          initial={{ scale: 0, x: -50 }}
          animate={isInView ? { scale: 1, x: -20 } : { scale: 0, x: -50 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
          <motion.div 
            className="text-center lg:text-left mb-10 lg:mb-0 lg:max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Host Your Next Academic Conference?
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              Join thousands of researchers and conference organizers who trust our platform for managing their academic events. Get started today with our easy-to-use tools.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Get Started For Free
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  Contact Sales
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-4">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Setup in less than 5 minutes</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-4">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Free plan available</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-4">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">24/7 Support</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 