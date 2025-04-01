"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import PaperForm from "@/components/ui/PaperForm";
import { motion } from "framer-motion";

export default function AuthorDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaperForm, setShowPaperForm] = useState(false);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pending: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    resubmitted: 0,
    finalSubmitted: 0
  });

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/author/papers");
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch papers");
      }
      
      const data = await response.json();
      
      // Log the response for debugging
      console.log("Papers API response:", data);
      
      setPapers(data.papers || []);
      setStats(data.stats || {
        totalSubmissions: 0,
        pending: 0,
        underReview: 0,
        accepted: 0,
        rejected: 0,
        resubmitted: 0,
        finalSubmitted: 0
      });
    } catch (error) {
      console.error("Error fetching papers:", error);
      // Show a different message for common errors
      if (error.message.includes("User not found")) {
        toast.error("Your author profile is not complete. Please contact an administrator.");
      } else if (error.message.includes("Unauthorized")) {
        toast.error("You don't have permission to view papers. Please ensure you're logged in as an author.");
      } else {
        toast.error("Unable to load papers. Please try again later.");
      }
      
      // Set empty data in case of error
      setPapers([]);
      setStats({
        totalSubmissions: 0,
        pending: 0,
        underReview: 0,
        accepted: 0,
        rejected: 0,
        resubmitted: 0,
        finalSubmitted: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-blue-500";
      case "Under Review":
        return "text-yellow-500";
      case "Accepted":
        return "text-green-500";
      case "Rejected":
        return "text-red-500";
      case "Resubmitted":
        return "text-purple-500";
      case "FinalSubmitted":
        return "text-teal-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FileText className="w-4 h-4" />;
      case "Under Review":
        return <Clock className="w-4 h-4" />;
      case "Accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "Resubmitted":
        return <RefreshCw className="w-4 h-4" />;
      case "FinalSubmitted":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Papers
          </h1>
          <Button
            onClick={() => setShowPaperForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Submit New Paper
          </Button>
        </motion.div>

        {/* Statistics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.underReview}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Accepted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending/Other</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pending + stats.rejected + stats.resubmitted + stats.finalSubmitted}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {papers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-12"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Papers Submitted Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You do not have any papers in the system yet. Start by submitting your first paper to an available conference.
              </p>
              <Button
                onClick={() => setShowPaperForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Your First Paper
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {papers.map((paper, index) => (
              <motion.div
                key={paper.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {paper.title}
                    </h3>
                    <div className={`flex items-center ${getStatusColor(paper.status)}`}>
                      {getStatusIcon(paper.status)}
                      <span className="ml-1 text-sm">{paper.status}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {paper.abstract}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex justify-between mb-1">
                      <span>Submitted:</span>
                      <span>{paper.submissionDate}</span>
                    </div>
                    {paper.conference && (
                      <div className="flex justify-between mb-1">
                        <span>Conference:</span>
                        <span>{paper.conference}</span>
                      </div>
                    )}
                    {paper.reviewer && (
                      <div className="flex justify-between">
                        <span>Reviewer:</span>
                        <span>{paper.reviewer.name}</span>
                      </div>
                    )}
                  </div>
                  
                  {paper.reviews && paper.reviews.length > 0 && (
                    <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Latest Feedback:
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {paper.reviews[0].feedback}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/paper-details?id=${paper.id}`)}
                      className="text-sm"
                    >
                      View Details
                    </Button>
                    
                    {paper.status === "Accepted" && (
                      <Button
                        className="ml-2 bg-green-500 hover:bg-green-600 text-white text-sm"
                        onClick={() => router.push(`/submit-final?id=${paper.id}`)}
                      >
                        Submit Final
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Paper Form Modal */}
      {showPaperForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PaperForm 
              onClose={() => {
                setShowPaperForm(false);
                fetchPapers(); // Refresh papers after submission
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
} 