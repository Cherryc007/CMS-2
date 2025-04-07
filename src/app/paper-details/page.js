"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Clock, User, Calendar, CheckCircle, XCircle } from "lucide-react";

function PaperContent({ paperId }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resubmissionFeedback, setResubmissionFeedback] = useState("");

  useEffect(() => {
    if (status === "authenticated" && paperId) {
      fetchPaperDetails();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, paperId]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/author/papers?id=${paperId}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch paper details");
      }
      
      const data = await response.json();
      
      // Check if papers array exists and has items
      if (!data.papers || data.papers.length === 0) {
        throw new Error("Paper not found");
      }

      // Find the specific paper in the response
      const paperDetails = data.papers.find(p => p.id === paperId);
      
      if (!paperDetails) {
        throw new Error("Paper not found");
      }

      setPaper(paperDetails);
    } catch (error) {
      console.error("Error fetching paper details:", error);
      toast.error("Unable to load paper details. Please try again later.");
      setPaper(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Resubmitted":
        return "bg-purple-100 text-purple-800";
      case "FinalSubmitted":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownload = async () => {
    try {
      if (!paper.fileUrl) {
        toast.error("No file available for download");
        return;
      }

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = paper.fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download the file");
    }
  };

  /**
   * Handles file selection for resubmission
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  /**
   * Handles paper resubmission
   */
  const handleResubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("paperId", paper.id);
      formData.append("file", selectedFile);
      formData.append("feedback", resubmissionFeedback);

      const response = await fetch("/api/papers/resubmit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resubmit paper");
      }

      toast.success("Paper resubmitted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error resubmitting paper:", error);
      toast.error(error.message || "Failed to resubmit paper");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Paper Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The paper you are looking for does not exist or you do not have permission to view it.
          </p>
          <Button
            onClick={() => router.push("/author-dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          variant="outline"
          onClick={() => router.push("/author-dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{paper.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(paper.status)}`}>
              {paper.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paper Information</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Submission Date</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{paper.submissionDate}</p>
                  </div>
                </div>
                
                {paper.lastUpdated && (
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{paper.lastUpdated}</p>
                    </div>
                  </div>
                )}
                
                {paper.conference && (
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Conference</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{paper.conference}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Information</h2>
              <div className="space-y-3">
                {paper.hasReviewer ? (
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Reviewer</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{paper.reviewer.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Review Status</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Waiting for reviewer assignment</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reviews Received</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{paper.reviews ? paper.reviews.length : 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Abstract</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
              {paper.abstract}
            </p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paper File</h2>
            <Button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Paper
            </Button>
          </div>
          
          {paper.reviews && paper.reviews.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reviews & Feedback</h2>
              <div className="space-y-4">
                {paper.reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Review #{index + 1}</span>
                        {review.rating && (
                          <div className="ml-4 flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(review.status)}`}>
                        {review.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {review.feedback}
                    </p>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Review File</h4>
                      {review.fileUrl ? (
                        <a
                          href={review.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Download Review File
                        </a>
                      ) : (
                        <p className="text-gray-500">No review file available</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Show resubmission form if paper status is RequestResubmit */}
      {paper.status === "RequestResubmit" && session?.user?.role === "author" && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resubmit Paper</h2>
          <form onSubmit={handleResubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Revised Paper (PDF only)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Feedback on Changes (Optional)
              </label>
              <textarea
                value={resubmissionFeedback}
                onChange={(e) => setResubmissionFeedback(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Describe the changes you made in response to the review..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Revision"}
            </button>
          </form>
        </div>
      )}

      {/* Show resubmission history if available */}
      {paper.resubmissionHistory && paper.resubmissionHistory.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revision History</h2>
          <div className="space-y-4">
            {paper.resubmissionHistory.map((revision) => (
              <div key={revision.version} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Version {revision.version}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(revision.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={revision.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    Download
                  </a>
                </div>
                {revision.feedback && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{revision.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("id");
  return <PaperContent paperId={paperId} />;
}

export default function PaperDetails() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchParamsWrapper />
    </Suspense>
  );
} 
