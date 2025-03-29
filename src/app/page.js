import Hero from "@/components/Hero/Hero";
import FeaturesSection from "@/components/Homepage/FeaturesSection";
import StatisticsSection from "@/components/Homepage/StatisticsSection";
import TestimonialsSection from "@/components/Homepage/TestimonialsSection";
import CtaSection from "@/components/Homepage/CtaSection";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-all duration-300">
      <Hero />
      <FeaturesSection />
      <StatisticsSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
