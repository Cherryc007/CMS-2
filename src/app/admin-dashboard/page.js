"use client";
import { useEffect, useState } from "react";
import PaperCard from "@/components/ui/PaperCard";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
  const [papers, setPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPapers: 0,
    underReview: 0,
    pending: 0,
    accepted: 0,
  });

  useEffect(() => {
    // Fetch papers and reviewers when component mounts
    fetchPapersAndReviewers();
  }, []);

  const fetchPapersAndReviewers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/papers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setPapers(data.papers);
      setReviewers(data.reviewers);

      // Calculate statistics
      const totalPapers = data.papers.length;
      const underReview = data.papers.filter(p => p.status === "Under Review").length;
      const pending = data.papers.filter(p => p.status === "Pending").length;
      const accepted = data.papers.filter(p => p.status === "Accepted").length;

      setStats({
        totalPapers,
        underReview,
        pending,
        accepted,
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignReviewer = async (paperId, reviewerId) => {
    try {
      const response = await fetch("/api/admin/assignReviewer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paperId, reviewerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign reviewer");
      }

      toast.success("Reviewer assigned successfully");
      
      // Update papers state with the newly assigned reviewer
      setPapers(papers.map(paper => {
        if (paper.id === paperId) {
          return {
            ...paper,
            reviewers: [{ id: data.reviewer.id, name: data.reviewer.name }],
            status: "Under Review",
          };
        }
        return paper;
      }));

      // Update statistics
      setStats({
        ...stats,
        underReview: stats.underReview + 1,
        pending: stats.pending - 1,
      });

    } catch (error) {
      console.error("Error assigning reviewer:", error);
      toast.error(error.message || "Failed to assign reviewer");
    }
  };

  const handleRemoveReviewer = async (paperId, reviewerId) => {
    try {
      const response = await fetch("/api/admin/removeReviewer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paperId, reviewerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove reviewer");
      }

      toast.success("Reviewer removed successfully");
      
      // Update papers state by removing the reviewer
      setPapers(papers.map(paper => {
        if (paper.id === paperId) {
          return {
            ...paper,
            reviewers: [],
            status: "Pending",
          };
        }
        return paper;
      }));

      // Update statistics
      setStats({
        ...stats,
        underReview: stats.underReview - 1,
        pending: stats.pending + 1,
      });

    } catch (error) {
      console.error("Error removing reviewer:", error);
      toast.error(error.message || "Failed to remove reviewer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-lg shadow text-center"
        >
          <h2 className="text-lg font-semibold mb-4">Manage Papers</h2>
          <p className="text-gray-600 mb-4">Assign reviewers and manage paper submissions</p>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-4">
            {stats.totalPapers} Papers
          </span>
          <div>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="text-blue-600 hover:text-blue-800"
            >
              View Papers Below
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow text-center"
        >
          <h2 className="text-lg font-semibold mb-4">Create Conference</h2>
          <p className="text-gray-600 mb-4">Set up new conferences and events</p>
          <Link 
            href="/conference-creation"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Conference
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow text-center"
        >
          <h2 className="text-lg font-semibold mb-4">Create Post</h2>
          <p className="text-gray-600 mb-4">Share news, updates and announcements</p>
          <Link 
            href="/admin-dashboard/create-post"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Post
          </Link>
        </motion.div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500"
        >
          <h2 className="text-gray-500 text-sm">Total Papers</h2>
          <p className="text-2xl font-bold">{stats.totalPapers}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500"
        >
          <h2 className="text-gray-500 text-sm">Under Review</h2>
          <p className="text-2xl font-bold">{stats.underReview}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500"
        >
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500"
        >
          <h2 className="text-gray-500 text-sm">Accepted</h2>
          <p className="text-2xl font-bold">{stats.accepted}</p>
        </motion.div>
      </div>
      
      {/* Papers List */}
      <h2 className="text-xl font-semibold mb-4">Submitted Papers</h2>
      
      {papers.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500">No papers have been submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <PaperCard
                paper={paper}
                availableReviewers={reviewers}
                onAssignReviewer={handleAssignReviewer}
                onRemoveReviewer={handleRemoveReviewer}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 