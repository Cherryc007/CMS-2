"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Memoized testimonial content to prevent re-renders
const TestimonialContent = memo(({ testimonial, imgError, handleImageError }) => (
  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-full overflow-hidden relative">
      {!imgError ? (
        <Image
          src={testimonial.image}
          alt={testimonial.author}
          fill
          loading="lazy"
          className="object-cover"
          onError={handleImageError}
        />
      ) : (
        <svg
          className="w-full h-full text-gray-300 dark:text-gray-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
    
    <div className="flex-1 text-center md:text-left">
      <svg className="w-10 h-10 text-blue-500 mb-4 mx-auto md:mx-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z"/>
      </svg>
      
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 italic">
        {testimonial.quote}
      </p>
      
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
          {testimonial.author}
        </h4>
        <p className="text-gray-500 dark:text-gray-400">
          {testimonial.title}
        </p>
      </div>
    </div>
  </div>
));

TestimonialContent.displayName = "TestimonialContent";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayTimeoutRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const testimonials = [
    {
      quote: "This platform completely transformed how we manage our annual conference. The paper submission and review process is now seamless, and we've seen a 40% increase in submissions since switching.",
      author: "Dr. Emily Chen",
      title: "Conference Chair, International AI Symposium",
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      quote: "The analytics dashboard gives us incredible insights that we never had before. We can now make data-driven decisions about our conference programming that have significantly improved attendee satisfaction.",
      author: "Prof. James Wilson",
      title: "Director, Global Computer Science Conference",
      image: "https://randomuser.me/api/portraits/men/42.jpg"
    },
    {
      quote: "When we had to pivot to virtual conferences during the pandemic, this platform made the transition nearly effortless. The virtual tools are so intuitive that our attendance actually increased compared to previous in-person events.",
      author: "Dr. Sarah Johnson",
      title: "Program Committee Chair, BioMed Summit",
      image: "https://randomuser.me/api/portraits/women/64.jpg"
    },
    {
      quote: "As a frequent presenter at academic conferences, I've experienced many platforms, and this one stands out for its user-friendly interface and comprehensive features. Submitting papers and navigating the program is a breeze.",
      author: "Prof. Michael Rodriguez",
      title: "Distinguished Researcher, MIT",
      image: "https://randomuser.me/api/portraits/men/15.jpg"
    }
  ];

  // Observer to start animations only when the section is in view
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (autoplay && isVisible) {
      autoplayTimeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 5000);
    }

    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [currentIndex, autoplay, testimonials.length, isVisible]);

  const handleDotClick = (index) => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    setCurrentIndex(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 8000);
  };

  const handleImageError = () => {
    setImgError(true);
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join thousands of satisfied conference organizers around the world.
            </p>
          </motion.div>
        )}

        <div className="relative min-h-[300px] md:min-h-[350px]">
          {isVisible && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-gray-700 p-6 md:p-10 rounded-xl shadow-lg"
              >
                <TestimonialContent 
                  testimonial={testimonials[currentIndex]} 
                  imgError={imgError} 
                  handleImageError={handleImageError} 
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {isVisible && (
          <>
            <div className="flex justify-center space-x-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentIndex
                      ? "bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center mt-10"
            >
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                Read More Success Stories
              </button>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
} 