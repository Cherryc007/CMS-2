"use client";

import { motion } from "framer-motion";

export default function MotionButton({ children, className, onClick, primary = false }) {
  const baseClasses = "px-6 py-3 font-medium text-sm sm:text-base rounded-lg w-full sm:w-auto";
  const primaryClasses = "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600";
  const secondaryClasses = "border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30";
  
  const combinedClasses = `${baseClasses} ${primary ? primaryClasses : secondaryClasses} ${className || ''}`;
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={combinedClasses}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
} 