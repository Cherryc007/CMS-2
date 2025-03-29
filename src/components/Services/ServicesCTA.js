"use client";

import { motion } from "framer-motion";
import MotionButton from "../ui/MotionButton";

export default function ServicesCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Ready to transform your conference experience?
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of conference organizers who have streamlined their events with our platform.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <MotionButton primary>
            Request Demo
          </MotionButton>
          
          <MotionButton>
            Contact Sales
          </MotionButton>
        </div>
      </motion.div>
    </section>
  );
} 