"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import ServiceCard from "@/components/ui/ServiceCard";
import ServicesCTA from "@/components/Services/ServicesCTA";
import { servicesData } from "@/components/Services/servicesData";
import Hero from '@/components/Hero';
import SectionLoading from '@/components/common/SectionLoading';

// Lazy load components
const ServiceFeatures = lazy(() => import('@/components/Services/ServiceFeatures'));
const Testimonials = lazy(() => import('@/components/Services/Testimonials'));
const PricingSection = lazy(() => import('@/components/Services/PricingSection'));
const ContactSection = lazy(() => import('@/components/Contact/ContactSection'));
const FAQSection = lazy(() => import('@/components/Services/FAQ'));

export default function Services() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    setIsClient(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Hero 
        title="Conference Management Solutions"
        subtitle="Streamline your academic and professional conferences with our comprehensive platform."
        imageUrl="/images/hero-services.jpg"
        overlayColor="from-blue-800/70 to-purple-900/70"
      />

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore our comprehensive suite of services designed to support the entire academic conference lifecycle.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-2"
        >
          {servicesData.map((service) => (
            <motion.div key={service.id} variants={itemVariants}>
              <ServiceCard service={service} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {isClient && (
        <>
          <Suspense fallback={<SectionLoading />}>
            <ServiceFeatures />
          </Suspense>
          
          <Suspense fallback={<SectionLoading />}>
            <Testimonials />
          </Suspense>
          
          <Suspense fallback={<SectionLoading />}>
            <PricingSection />
          </Suspense>
          
          <Suspense fallback={<SectionLoading />}>
            <FAQSection />
          </Suspense>
          
          <Suspense fallback={<SectionLoading />}>
            <ContactSection />
          </Suspense>
        </>
      )}
      
      {/* CTA Section */}
      <ServicesCTA />
    </main>
  );
} 