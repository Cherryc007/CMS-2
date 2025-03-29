"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { id: 1, value: 500, label: "Conferences", suffix: "+", color: "blue" },
  { id: 2, value: 12500, label: "Papers Submitted", suffix: "+", color: "purple" },
  { id: 3, value: 35000, label: "Researchers", suffix: "+", color: "green" },
  { id: 4, value: 98, label: "Satisfaction Rate", suffix: "%", color: "yellow" }
];

export default function StatisticsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [counts, setCounts] = useState(stats.map(() => 0));
  
  useEffect(() => {
    if (isInView) {
      const intervals = stats.map((stat, index) => {
        const duration = 2000; // Animation duration in ms
        const steps = 20; // Number of steps in the count animation
        const stepValue = stat.value / steps;
        const stepDuration = duration / steps;
        
        let count = 0;
        return setInterval(() => {
          if (count < steps) {
            setCounts(prevCounts => {
              const newCounts = [...prevCounts];
              newCounts[index] = Math.min(Math.round(stepValue * (count + 1)), stat.value);
              return newCounts;
            });
            count++;
          } else {
            clearInterval(intervals[index]);
          }
        }, stepDuration);
      });
      
      return () => intervals.forEach(interval => clearInterval(interval));
    }
  }, [isInView]);
  
  return (
    <section ref={ref} className="py-20 bg-white dark:bg-gray-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Growing Academic Community
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Join thousands of researchers and conference organizers on our platform
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/10 rounded-xl p-8 text-center transition-all duration-300`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <h3 className={`text-4xl md:text-5xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}>
                {counts[index].toLocaleString()}{stat.suffix}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 