"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FileText, Eye } from "lucide-react";
import AdminPaperActions from "./AdminPaperActions";

export default function PaperCard({ paper, availableReviewers, onAssignReviewer, onRemoveReviewer }) {
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const { data: session } = useSession();
  
  // Check if the current user is the assigned reviewer for this paper
  const isAssignedReviewer = paper.reviewers && 
    paper.reviewers.some(reviewer => reviewer.id === session?.user?.id);

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Admin view
  if (session?.user.role === "admin") {
    return (
      <div className="p-4 border-b border-gray-200 last:border-b-0">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
            {paper.title}
          </h3>
          <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
            {paper.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-1">Conference:</span>
            <span className="text-gray-900">{paper.conferenceId?.name || "N/A"}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-1">Author:</span>
            <span className="text-gray-900">{paper.author?.name || "N/A"}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-1">Reviewers:</span>
            <span className="text-gray-900">
              {paper.reviewers?.length || 0} assigned
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <AdminPaperActions paper={paper} />
        </div>

        {onAssignReviewer && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Reviewers:</h4>
            {(!paper.reviewers || paper.reviewers.length === 0) ? (
              <p className="text-sm text-gray-500 italic">No reviewers assigned yet</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {paper.reviewers.map(reviewer => (
                  <div key={reviewer.id} className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                    <span className="text-xs text-blue-800 mr-1">{reviewer.name}</span>
                    <button 
                      onClick={() => onRemoveReviewer(paper._id, reviewer.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <select
                id={`reviewer-${paper._id}`}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                defaultValue=""
              >
                <option value="" disabled>Select reviewer</option>
                {availableReviewers?.map(reviewer => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const select = document.getElementById(`reviewer-${paper._id}`);
                  if (select.value) {
                    onAssignReviewer(paper._id, select.value);
                    select.value = "";
                  }
                }}
                className="shrink-0 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Assign
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Reviewer and Author view
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h3 className="font-semibold text-lg text-gray-800">{paper.title}</h3>
          <p className="text-sm text-gray-600">
            By {paper.author?.name} • Submitted on {new Date(paper.submissionDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Conference: {paper.conferenceId?.name}
          </p>
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">
            {paper.abstract}
          </p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium ${
            paper.status === "Accepted" ? "bg-green-100 text-green-800" :
            paper.status === "Rejected" ? "bg-red-100 text-red-800" :
            "bg-yellow-100 text-yellow-800"
          } mb-2`}>
            {paper.status}
          </span>
          
          {/* Show buttons for reviewers */}
          {session?.user.role === "reviewer" && (
            <div className="flex flex-col gap-2">
              {/* Show Review Paper button only if paper hasn't been reviewed yet */}
              {!paper.hasReview && (
                <Link 
                  href={`/review-paper?id=${paper._id}`} 
                  className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Review Paper
                </Link>
              )}
              {/* Show View My Review button only if paper has been reviewed */}
              {paper.hasReview && (
                <Link 
                  href={`/review-history?paperId=${paper._id}`}
                  className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View My Review
                </Link>
              )}
            </div>
          )}

          {/* Show View Details button only for non-reviewers */}
          {session?.user.role !== "reviewer" && (
            <Link
              href={`/paper-details?id=${paper._id}`}
              className="mt-2 inline-flex items-center px-4 py-2 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 