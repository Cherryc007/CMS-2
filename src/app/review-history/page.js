"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

/**
 * ReviewHistoryContent component that handles the actual review history display
 */
function ReviewHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const paperId = searchParams.get("paperId");

  useEffect(() => {
    // Redirect if user is not a reviewer
    if (status === "authenticated" && session?.user?.role !== "reviewer") {
      toast.error("Only reviewers can access this page");
      router.push("/");
      return;
    }

    if (status === "authenticated" && paperId) {
      fetchReviewHistory();
    }
  }, [status, paperId, session]);

  /**
   * Fetches the review history for the specified paper
   */
  const fetchReviewHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviewer/review-history/${paperId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch review history");
      }

      setReview(data.review);
    } catch (error) {
      console.error("Error fetching review history:", error);
      toast.error(error.message || "Failed to load review history");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles downloading the review file
   */
  const handleDownload = async () => {
    if (!review?.fileUrl) {
      toast.error("No review file available");
      return;
    }

    try {
      const a = document.createElement("a");
      a.href = review.fileUrl;
      a.download = `review-${paperId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading review file:", error);
      toast.error("Failed to download review file");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!review) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">No review found for this paper</p>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Review History</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Paper Details</h2>
            <p className="text-gray-600">{review.paperTitle}</p>
            <p className="text-sm text-gray-500 mt-1">Current Status: {review.paperStatus}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Details</h2>
            <p className="text-sm text-gray-500">Submitted on: {new Date(review.submittedAt).toLocaleDateString()}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Feedback</h2>
            <p className="text-gray-600 whitespace-pre-line">{review.feedback}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Rating</h2>
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">({review.rating}/5)</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">Decision</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              review.status === "Accepted" ? "bg-green-100 text-green-800" :
              review.status === "Rejected" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }`}>
              {review.status}
            </span>
          </div>

          {review.fileUrl && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Review File</h2>
              <button
                onClick={handleDownload}
                className="mt-2 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Review File
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main ReviewHistory component wrapped in Suspense
 */
export default function ReviewHistory() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ReviewHistoryContent />
    </Suspense>
  );
} 