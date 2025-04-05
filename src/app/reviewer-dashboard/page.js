"use client";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";

function ReviewerDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
      const reviewed = data.papers.filter(p => p.hasReviewed).length;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reviewer Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
        >
          <h2 className="text-gray-500 text-sm">Total Assigned</h2>
          <p className="text-2xl font-bold">{stats.total}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500"
        >
          <h2 className="text-gray-500 text-sm">Pending Review</h2>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500"
        >
          <h2 className="text-gray-500 text-sm">Reviewed</h2>
          <p className="text-2xl font-bold">{stats.reviewed}</p>
        </motion.div>
      </div>
      
      {/* Papers List */}
      <h2 className="text-xl font-semibold mb-4">Assigned Papers</h2>
      
      {papers.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500">No papers have been assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{paper.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {paper.author} • {paper.conference}
                  </p>
                  <p className="text-sm text-gray-600">
                    Submitted on {paper.submissionDate}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">{paper.abstract.substring(0, 150)}...</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    paper.status === "Under Review" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : paper.status === "Accepted" 
                      ? "bg-green-100 text-green-800" 
                      : paper.status === "Rejected" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {paper.status}
                  </span>
                  
                  {!paper.hasReviewed && (
                    <Link 
                      href={`/review-paper?id=${paper.id}`}
                      className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Review
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
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