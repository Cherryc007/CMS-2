"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PaperCard from "@/components/ui/PaperCard";
import { mockPapers as initialPapers, mockReviewers } from "@/components/ui/MockDataProvider";

export default function AdminDashboard() {
  // Mock data for pending papers
  const [pendingPapers, setPendingPapers] = useState(initialPapers);

  // Function to assign a reviewer to a paper
  const assignReviewer = (paperId, reviewerId) => {
    const reviewer = mockReviewers.find(r => r.id === reviewerId);
    if (!reviewer) return;

    setPendingPapers(papers => papers.map(paper => {
      if (paper.id === paperId) {
        // Check if reviewer is already assigned
        if (paper.reviewers && paper.reviewers.some(r => r.id === reviewerId)) {
          return paper;
        }
        return {
          ...paper,
          reviewers: [...(paper.reviewers || []), reviewer]
        };
      }
      return paper;
    }));
  };

  // Function to remove a reviewer from a paper
  const removeReviewer = (paperId, reviewerId) => {
    setPendingPapers(papers => papers.map(paper => {
      if (paper.id === paperId) {
        return {
          ...paper,
          reviewers: (paper.reviewers || []).filter(r => r.id !== reviewerId)
        };
      }
      return paper;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage pending papers and assign reviewers
            </p>
          </div>
          
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Papers</h2>
            
            {pendingPapers.length === 0 ? (
              <p className="text-gray-500 italic">No pending papers found.</p>
            ) : (
              <div className="space-y-6">
                {pendingPapers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    availableReviewers={mockReviewers}
                    onAssignReviewer={assignReviewer}
                    onRemoveReviewer={removeReviewer}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 