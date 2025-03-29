"use client";

import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import TabNavigation from "@/components/About/TabNavigation";
import MissionTab from "@/components/About/MissionTab";
import TeamTab from "@/components/About/TeamTab";
import JourneyTab from "@/components/About/JourneyTab";
import SectionLoading from '@/components/common/SectionLoading';

// Lazy load sections
const ValuesSection = lazy(() => import("@/components/About/ValuesSection"));
const PartnersSection = lazy(() => import("@/components/About/PartnersSection"));
const AwardsSection = lazy(() => import("@/components/About/AwardsSection"));
const ContactSection = lazy(() => import("@/components/About/ContactSection"));

export default function About() {
  const [activeTab, setActiveTab] = useState("mission");
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.main 
      className="min-h-screen bg-white dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <section className="py-12 px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto mb-12 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About <span className="text-blue-600 dark:text-blue-400">CMS</span>
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Revolutionizing academic conferences with technology and user-centered design.
          </p>
        </motion.div>
        
        {/* Tabs Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Content Sections */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "mission" && <MissionTab />}
            {activeTab === "team" && <TeamTab />}
            {activeTab === "journey" && <JourneyTab />}
          </motion.div>
        </div>
      </section>
      
      {isClient && (
        <>
          {/* Values Section */}
          <Suspense fallback={<SectionLoading />}>
            <ValuesSection />
          </Suspense>
          
          {/* Awards Section */}
          <Suspense fallback={<SectionLoading />}>
            <AwardsSection />
          </Suspense>
          
          {/* Partners Section */}
          <Suspense fallback={<SectionLoading />}>
            <PartnersSection />
          </Suspense>
          
          {/* Contact Section */}
          <Suspense fallback={<SectionLoading />}>
            <ContactSection />
          </Suspense>
        </>
      )}
    </motion.main>
  );
} 