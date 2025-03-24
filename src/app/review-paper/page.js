"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PaperDetails from "@/components/ui/PaperDetails";
import ReviewForm from "@/components/ui/ReviewForm";
import { mockPapers, statusOptions } from "@/components/ui/MockDataProvider";

export default function ReviewPaperPage() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("id") || "p001"; // Default to first paper if no ID
  
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);
  const [review, setReview] = useState({
    novelty: 0,
    technicalQuality: 0,
    clarity: 0,
    relevance: 0,
    overallRating: 0,
    comments: "",
    status: "pending"
  });

  // Fetch paper data with shorter loading time
  useEffect(() => {
    // Mock API call with very short delay
    setTimeout(() => {
      // Find paper by id or default to first paper
      const foundPaper = mockPapers.find(p => p.id === paperId) || mockPapers[0];
      if (foundPaper) {
        setPaper(foundPaper);
        setReview(prev => ({ ...prev, status: foundPaper.status }));
      }
      setLoading(false);
    }, 300);
  }, [paperId]);

  // Handle rating change
  const handleRatingChange = (category, value) => {
    setReview(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Handle comments change
  const handleCommentsChange = (e) => {
    setReview(prev => ({
      ...prev,
      comments: e.target.value
    }));
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setReview(prev => ({
      ...prev,
      status: e.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Calculate overall rating average
    const ratings = [review.novelty, review.technicalQuality, review.clarity, review.relevance];
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    
    const finalReview = {
      ...review,
      overallRating: avgRating,
      paperId: paper.id
    };
    
    console.log("Review submitted:", finalReview);
    alert("Review submitted successfully!");
    // In a real app, you would make an API call here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Force display of a paper even if none is found in the URL
  const paperToDisplay = paper || mockPapers[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/admin-dashboard" className="text-blue-500 hover:text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <PaperDetails paper={paperToDisplay} />
          
          <ReviewForm
            review={review}
            statusOptions={statusOptions}
            onRatingChange={handleRatingChange}
            onCommentsChange={handleCommentsChange}
            onStatusChange={handleStatusChange}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </div>
    </motion.div>
  );
} 