"use client";

import { motion } from "framer-motion";

const teamMembers = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Founder & CEO",
    bio: "Ph.D. in Computer Science with 15+ years experience in academic conference management systems.",
    imageFallback: "👩‍💼"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "CTO",
    bio: "Former lead developer at ResearchGate with expertise in scalable academic platforms.",
    imageFallback: "👨‍💻"
  },
  {
    id: 3,
    name: "Dr. Aisha Patel",
    role: "Head of Research",
    bio: "Computational linguist specializing in NLP applications for academic content.",
    imageFallback: "👩‍🔬"
  },
  {
    id: 4,
    name: "James Wilson",
    role: "UX Director",
    bio: "Award-winning designer focused on creating intuitive interfaces for complex systems.",
    imageFallback: "👨‍🎨"
  }
];

export default function TeamTab() {
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
        Our Team
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-300 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        Our team combines academic knowledge with technical expertise to 
        build effective conference management software.
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden flex flex-col sm:flex-row items-center sm:items-start p-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <motion.div 
              className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {member.imageFallback}
            </motion.div>
            
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">{member.role}</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{member.bio}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 