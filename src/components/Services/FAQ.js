"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Memoized FAQ Item component
const FAQItem = ({ faq, isOpen, toggleFAQ, isInView, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="border-b border-gray-200 dark:border-gray-700"
    >
      <button
        className="flex justify-between items-center w-full py-5 text-left"
        onClick={() => toggleFAQ(faq.id)}
      >
        <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
      </div>
    </motion.div>
  );
};

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);
  
  // Use IntersectionObserver to trigger animations only when in view
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

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      question: "What types of conferences does your platform support?",
      answer: "Our platform is designed to support a wide range of academic and professional conferences, including scientific symposiums, medical conferences, technology summits, and more. The system is highly customizable to accommodate different formats, sizes, and requirements."
    },
    {
      id: 2,
      question: "How does the paper submission and review process work?",
      answer: "Authors submit papers through our intuitive submission portal. Organizers can define custom submission forms with specific fields and file requirements. Papers then enter our double-blind review system where reviewers are assigned based on expertise matching. Reviewers evaluate papers using customizable scoring criteria, and authors receive consolidated feedback."
    },
    {
      id: 3,
      question: "Can your platform handle both in-person and virtual conferences?",
      answer: "Absolutely! Our platform fully supports in-person, virtual, and hybrid conference formats. For virtual conferences, we offer integrated video streaming, interactive session rooms, networking lounges, and digital poster halls. For hybrid events, we ensure seamless integration between the physical and virtual components."
    },
    {
      id: 4,
      question: "How secure is the payment processing for registrations?",
      answer: "We prioritize security in all aspects of our platform. Our payment processing system is PCI DSS compliant and uses industry-standard encryption. We support major payment gateways and offer various payment methods including credit cards, bank transfers, and PayPal. All financial data is securely handled and protected."
    },
    {
      id: 5,
      question: "Do you offer custom branding for our conference?",
      answer: "Yes, our platform allows for extensive customization to match your conference branding. You can customize the colors, logos, email templates, certificates, badges, and more. Premium plans include custom domain options and white-labeling capabilities for a completely branded experience."
    },
    {
      id: 6,
      question: "What kind of technical support is included?",
      answer: "All plans include basic email support. Our Professional plan includes priority email and chat support with faster response times. Enterprise customers enjoy 24/7 dedicated support with a named account manager, phone support, and optional on-site technical assistance for your event day."
    }
  ];

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/30">
      {isInView && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Find answers to common questions about our conference management platform.
            </p>
          </motion.div>
          
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={faq.id}
                faq={faq}
                isOpen={openFAQ === faq.id}
                toggleFAQ={toggleFAQ}
                isInView={isInView}
                index={index}
              />
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Have more questions? <button className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Contact us</button>
            </p>
          </motion.div>
        </div>
      )}
    </section>
  );
} 