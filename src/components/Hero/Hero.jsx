"use client"
import { useState } from 'react';

const Hero = () => {
  const [hovered, setHovered] = useState(null);
  
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-block mb-6 transform hover:scale-105 transition-transform duration-300">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase">
            Conference Management System
          </span>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Manage Your Events <br className="hidden md:block" />
          <span className="text-blue-600 dark:text-blue-400">with Elegance</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          A sophisticated platform for organizing, tracking, and delivering exceptional conference experiences.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onMouseEnter={() => setHovered('create')}
            onMouseLeave={() => setHovered(null)}
          >
            Create Conference
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ml-2 inline-block transition-transform duration-300 ${hovered === 'create' ? 'transform translate-x-1' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg border border-gray-300 dark:border-gray-700 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-opacity-50"
            onMouseEnter={() => setHovered('explore')}
            onMouseLeave={() => setHovered(null)}
          >
            Explore Events
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ml-2 inline-block transition-transform duration-300 ${hovered === 'explore' ? 'transform translate-x-1' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Decorative Elements */}
        <div className="relative mt-16 hidden md:block">
          <div className="absolute top-0 -right-20 w-72 h-72 bg-blue-50 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 -left-20 w-72 h-72 bg-purple-50 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-8 left-40 w-72 h-72 bg-yellow-50 dark:bg-yellow-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 