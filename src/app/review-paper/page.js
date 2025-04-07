"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Upload, Download } from "lucide-react";

function ReviewPaperContent({ paperId }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  
  const [paper, setPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewStatus, setReviewStatus] = useState("Accepted");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePath, setFilePath] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    // Redirect if user is not a reviewer
    if (sessionStatus === "authenticated" && session?.user?.role !== "reviewer") {
      toast.error("Only reviewers can access this page");
      router.push("/");
      return;
    }
    
    if (sessionStatus === "authenticated" && paperId) {
      fetchPaperDetails();
    }
  }, [paperId, sessionStatus, session]);

  const fetchPaperDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviewer/paper/${paperId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch paper details");
      }

      setPaper(data.paper);
    } catch (error) {
      console.error("Error fetching paper:", error);
      toast.error(error.message || "Failed to load paper details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('paperId', paperId);

    try {
      const response = await fetch('/api/reviewer/upload-review', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      const data = await response.json();
      setFilePath(data.filePath);
      setFileUrl(data.fileUrl);
      toast.success("Review file uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/reviewer/submit-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperId,
          feedback,
          rating,
          status: reviewStatus,
          filePath,
          fileUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      toast.success("Review submitted successfully");
      // Redirect to reviewer dashboard or show success message
      router.push("/reviewer-dashboard");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Paper Not Found</h2>
          <p className="text-red-600">The paper you are looking for does not exist or you do not have permission to review it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-2xl font-bold mb-6">Review Paper</h1>

        {/* Paper Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{paper.title}</h2>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium">Author:</span> {paper.author}</p>
            <p><span className="font-medium">Conference:</span> {paper.conference}</p>
            <p><span className="font-medium">Submission Date:</span> {paper.submissionDate}</p>
            <p><span className="font-medium">Status:</span> {paper.status}</p>
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Abstract:</h3>
            <p className="text-gray-700">{paper.abstract}</p>
          </div>
          <div className="mt-4">
            <a
              href={paper.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                if (!paper.fileUrl) {
                  e.preventDefault();
                  toast.error("No file available for download");
                }
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Download Paper
            </a>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Accepted">Accept</option>
                <option value="Rejected">Reject</option>
                <option value="Resubmitted">Request Resubmission</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed feedback about the paper..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review File (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Please upload your review in PDF format (max 10MB)
              </p>
              {filePath && (
                <p className="mt-1 text-sm text-green-600">
                  Review file uploaded successfully
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("id");
  return <ReviewPaperContent paperId={paperId} />;
}

export default function ReviewPaper() {
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
