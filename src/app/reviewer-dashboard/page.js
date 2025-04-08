"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Download, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

function ReviewerDashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0
  });

  useEffect(() => {
    // Redirect if user is not a reviewer
    if (status === "authenticated" && session?.user?.role !== "reviewer") {
      toast.error("Only reviewers can access this page");
      router.push("/");
      return;
    }
    
    if (status === "authenticated") {
      fetchAssignedPapers();
    }
  }, [status, session]);

  const fetchAssignedPapers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/reviewer/papers");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assigned papers");
      }
      
      setPapers(data.papers);
      
      // Calculate statistics
      const total = data.papers.length;
      const reviewed = data.papers.filter(p => p.hasReview).length;
      const pending = total - reviewed;
      
      setStats({
        total,
        pending,
        reviewed
      });
    } catch (error) {
      console.error("Error fetching papers:", error);
      toast.error(error.message || "Failed to load assigned papers");
    } finally {
      setIsLoading(false);
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

  const handleDownload = async (paper) => {
    if (!paper.fileUrl) {
      toast.error("No file available for download");
      return;
    }
    
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = paper.fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `${paper.title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reviewer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {session?.user?.name}. Here are the papers assigned to you for review.
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500"
          >
            <h2 className="text-gray-500 text-sm dark:text-gray-400">Total Assigned</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500"
          >
            <h2 className="text-gray-500 text-sm dark:text-gray-400">Pending Review</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500"
          >
            <h2 className="text-gray-500 text-sm dark:text-gray-400">Reviewed</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewed}</p>
          </motion.div>
        </div>
        
        {/* Papers List */}
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Assigned Papers</h2>
        
        {papers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center"
          >
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Papers Assigned</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You do not have any papers assigned for review at the moment.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {papers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {paper.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        By {paper.author} • {paper.conference}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Submitted on {paper.submissionDate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(paper.status)}`}>
                      {paper.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abstract</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {paper.abstract}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => handleDownload(paper)}
                        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Paper
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {!paper.hasReview && (
                        <Button
                          onClick={() => router.push(`/review-paper?id=${paper.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      )}
                      {paper.hasReview && (
                        <Button
                          onClick={() => router.push(`/review-history?paperId=${paper.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Review
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => router.push(`/paper-details?id=${paper.id}`)}
                        variant="outline"
                        className="inline-flex items-center"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewerDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ReviewerDashboardContent />
    </Suspense>
  );
} 