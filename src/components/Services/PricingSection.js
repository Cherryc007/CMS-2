"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Pricing plan component to be rendered for each plan
const PricingPlan = ({ plan, isAnnual, index, isInView }) => (
  <motion.div
    key={plan.name}
    initial={{ opacity: 0, y: 30 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
    transition={{ duration: 0.4, delay: 0.1 * index }}
    className={`${plan.color} rounded-xl p-6 sm:p-8 relative ${plan.isPopular ? 'ring-2 ring-blue-500 md:scale-105' : ''}`}
  >
    {plan.isPopular && (
      <span className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full">
        Most Popular
      </span>
    )}
    
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
    
    <div className="mb-6">
      <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
      </span>
      <span className="text-gray-500 dark:text-gray-400 ml-2">
        {isAnnual ? '/year' : '/month'}
      </span>
    </div>
    
    <ul className="space-y-2 mb-8">
      {plan.features.map((feature, i) => (
        <li key={i} className="flex items-start">
          <svg
            className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
    
    <button
      className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${plan.buttonClass}`}
    >
      Choose {plan.name}
    </button>
  </motion.div>
);

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  
  // Observer to only trigger animations when section is in view
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);
  
  const plans = [
    {
      name: "Starter",
      monthlyPrice: 49,
      annualPrice: 499,
      features: [
        "Up to 1 conference per year",
        "100 paper submissions",
        "10 reviewers",
        "Basic analytics",
        "Email support"
      ],
      isPopular: false,
      color: "bg-gray-100 dark:bg-gray-700",
      buttonClass: "bg-gray-800 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
    },
    {
      name: "Professional",
      monthlyPrice: 99,
      annualPrice: 999,
      features: [
        "Up to 3 conferences per year",
        "500 paper submissions",
        "50 reviewers",
        "Advanced analytics",
        "Priority email & chat support",
        "Custom branding"
      ],
      isPopular: true,
      color: "bg-blue-50 dark:bg-blue-900/30",
      buttonClass: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
    },
    {
      name: "Enterprise",
      monthlyPrice: 249,
      annualPrice: 2499,
      features: [
        "Unlimited conferences",
        "Unlimited paper submissions",
        "Unlimited reviewers",
        "Advanced analytics & reporting",
        "24/7 dedicated support",
        "Custom branding & API access",
        "On-premises deployment option"
      ],
      isPopular: false,
      color: "bg-gray-100 dark:bg-gray-700",
      buttonClass: "bg-gray-800 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isInView && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 sm:mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Transparent Pricing
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                Choose the plan that works best for your conference needs.
              </p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center">
                <span className={`mr-3 text-base font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Monthly</span>
                <button 
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none"
                  onClick={() => setIsAnnual(!isAnnual)}
                  aria-pressed={isAnnual}
                  aria-label="Toggle billing period"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`ml-3 text-base font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Annual <span className="text-green-500 text-xs font-bold ml-1">Save 15%</span>
                </span>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {plans.map((plan, index) => (
                <PricingPlan 
                  key={plan.name} 
                  plan={plan} 
                  isAnnual={isAnnual} 
                  index={index} 
                  isInView={isInView} 
                />
              ))}
            </div>
            
            <div className="text-center mt-10 text-gray-500 dark:text-gray-400">
              <p>Need a custom plan? <button className="text-blue-600 dark:text-blue-400 font-medium">Contact us</button></p>
            </div>
          </>
        )}
      </div>
    </section>
  );
} 