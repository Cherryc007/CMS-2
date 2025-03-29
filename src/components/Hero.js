"use client";

import { useState } from 'react';

export default function Hero({ title, subtitle, imageUrl, overlayColor = "from-blue-800/70 to-purple-900/70" }) {
  return (
    <section className="relative">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl || '/images/hero-default.jpg'})` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${overlayColor}`}></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative px-4 py-24 sm:px-6 sm:py-32 lg:py-40 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-xl text-white text-opacity-80 max-w-xl mx-auto">
            {subtitle}
          </p>
          
          <div className="mt-10 flex justify-center gap-4">
            <button className="px-6 py-3 bg-white text-blue-700 font-medium rounded-md hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 