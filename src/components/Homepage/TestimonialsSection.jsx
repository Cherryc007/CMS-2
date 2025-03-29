"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    quote: "This platform has transformed how we organize our annual conference. The submission and review process is seamless, and we've seen a 40% increase in participation.",
    author: "Dr. Sarah Chen",
    role: "Conference Chair, International Symposium on AI",
    avatar: "👩‍🔬"
  },
  {
    id: 2,
    quote: "The scheduling features saved us countless hours of manual work. We were able to create a conflict-free program in minutes instead of days.",
    author: "Prof. Michael Johnson",
    role: "Program Committee, European Conference on Computer Science",
    avatar: "👨‍🏫"
  },
  {
    id: 3,
    quote: "Our authors appreciated the transparent submission process, and reviewers found the evaluation tools intuitive and comprehensive.",
    author: "Dr. Emily Rodriguez",
    role: "Journal Editor, Advanced Materials Research",
    avatar: "👩‍💼"
  },
  {
    id: 4,
    quote: "As a first-time conference organizer, this platform provided all the guidance and tools I needed. The support team was exceptional.",
    author: "Dr. James Wilson",
    role: "Assistant Professor, Stanford University",
    avatar: "👨‍🎓"
  }
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [active, setActive] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setActive(prev => (prev + 1) % testimonials.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isInView]);
  
  return (
    <section ref={ref} className="py-20 bg-gray-50 dark:bg-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Hear from conference organizers and researchers who use our platform
          </p>
        </motion.div>
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full max-w-4xl h-64 md:h-56">
            <AnimatePresence mode="wait">
              {testimonials.map((testimonial, index) => (
                index === active && (
                  <motion.div
                    key={testimonial.id}
                    className="absolute inset-0 bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-8 flex flex-col justify-center"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mb-4 text-indigo-500 dark:text-indigo-400 text-2xl">
                      "
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 italic">
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center mt-auto">
                      <div className="text-3xl mr-4">{testimonial.avatar}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.author}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === active 
                    ? "bg-indigo-600 dark:bg-indigo-400 w-6" 
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 