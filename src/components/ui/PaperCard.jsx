"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function PaperCard({ paper, availableReviewers, onAssignReviewer, onRemoveReviewer }) {
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();
  
  // Check if the current user is the assigned reviewer for this paper
  const isAssignedReviewer = paper.reviewers && 
    paper.reviewers.some(reviewer => reviewer.id === session?.user?.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h3 className="font-semibold text-lg text-gray-800">{paper.title}</h3>
          <p className="text-sm text-gray-600">
            By {paper.author} • Submitted on {paper.submissionDate}
          </p>
          <p className="text-sm text-gray-600">
            Conference: {paper.conference}
          </p>
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
            {paper.abstract}
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
            {paper.status}
          </span>
          {/* Show Review Paper button for reviewers */}
          {session?.user.role === "reviewer" && (
            isAssignedReviewer || !onAssignReviewer) && (
            <div className="flex flex-col gap-2">
              <Link 
                href={`/review-paper?id=${paper.id}`} 
                className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Review Paper
              </Link>
              {paper.hasReview && (
                <Link 
                  href={`/review-history?paperId=${paper.id}`}
                  className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  View My Review
                </Link>
              )}
            </div>
          )}
          {/* Show View Details button only for non-reviewers */}
          {session?.user.role !== "reviewer" && (
            <Link
              href={`/paper-details?id=${paper.id}`}
              className="mt-2 inline-flex items-center px-4 py-2 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Reviewers:</h4>
        {(!paper.reviewers || paper.reviewers.length === 0) ? (
          <p className="text-sm text-gray-500 italic">No reviewers assigned yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {paper.reviewers.map(reviewer => (
              <div key={reviewer.id} className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                <span className="text-xs text-blue-800 mr-1">{reviewer.name}</span>
                <button 
                  onClick={() => onRemoveReviewer(paper.id, reviewer.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Only show the assign reviewer section for admin users */}
        {session?.user.role === "admin" && onAssignReviewer && (
          <div className="mt-3">
            <div className="flex items-center">
              <select
                id={`reviewer-${paper.id}`}
                className="block w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                defaultValue=""
              >
                <option value="" disabled>Select reviewer</option>
                {availableReviewers.map(reviewer => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={(e) => {
                  const select = document.getElementById(`reviewer-${paper.id}`);
                  if (select.value) {
                    onAssignReviewer(paper.id, select.value);
                    select.value = "";
                  }
                }}
                className="ml-2 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Assign
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 