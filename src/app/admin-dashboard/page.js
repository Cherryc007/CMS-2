"use client";
import { useEffect, useState } from "react";
import PaperCard from "@/components/ui/PaperCard";
import AdminPaperActions from "@/components/ui/AdminPaperActions";
import ConferenceFilter from "@/components/ui/ConferenceFilter";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPapers: 0,
    underReview: 0,
    pending: 0,
    accepted: 0,
  });

  useEffect(() => {
    fetchPapersAndReviewers();
  }, []);

  useEffect(() => {
    if (selectedConference) {
      const filtered = papers.filter(paper => paper.conferenceId?.toString() === selectedConference.id?.toString());
      setFilteredPapers(filtered);
      updateConferenceStats(filtered);
    } else {
      setFilteredPapers(papers);
      updateStats(papers);
    }
  }, [selectedConference, papers]);

  const fetchPapersAndReviewers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/papers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch data");
      }

      setPapers(data.papers || []);
      setFilteredPapers(data.papers || []);
      setReviewers(data.reviewers || []);
      setConferences(data.conferences || []);
      updateStats(data.papers || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (papers) => {
    const totalPapers = papers.length;
    const underReview = papers.filter(p => p.status === "Under Review").length;
    const pending = papers.filter(p => p.status === "Pending").length;
    const accepted = papers.filter(p => p.status === "Accepted").length;

    setStats({
      totalPapers,
      underReview,
      pending,
      accepted,
    });
  };

  const updateConferenceStats = (papers) => {
    const totalPapers = papers.length;
    const underReview = papers.filter(p => p.status === "Under Review").length;
    const pending = papers.filter(p => p.status === "Pending").length;
    const accepted = papers.filter(p => p.status === "Accepted").length;

    setStats({
      totalPapers,
      underReview,
      pending,
      accepted,
    });
  };

  const handleConferenceFilter = (conference) => {
    setSelectedConference(conference);
  };

  const handleClearFilter = () => {
    setSelectedConference(null);
  };

  const handleDownload = async (paper) => {
    if (!paper.fileUrl) {
      toast.error("No file available for download");
      return;
    }
    
    try {
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
      toast.error("Failed to download file");
    }
  };

  const handleViewDetails = (paperId) => {
    router.push(`/admin/paper-details?id=${paperId}`);
  };

  const handleViewAuthor = (authorId) => {
    router.push(`/admin/user-details?id=${authorId}`);
  };

  const handleViewReviews = (paperId) => {
    router.push(`/admin/paper-reviews?id=${paperId}`);
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
      
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded-lg shadow text-center"
        >
          <h2 className="text-lg font-semibold mb-2">Manage Papers</h2>
          <p className="text-gray-600 mb-2">Assign reviewers and manage paper submissions</p>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
            {stats.totalPapers} Papers
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow text-center"
        >
          <h2 className="text-lg font-semibold mb-2">Create Conference</h2>
          <p className="text-gray-600 mb-2">Set up new conferences and events</p>
          <Link 
            href="/conference-creation"
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Conference
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow text-center"
        >
          <h2 className="text-lg font-semibold mb-2">Create Post</h2>
          <p className="text-gray-600 mb-2">Share news, updates and announcements</p>
          <Link 
            href="/admin-dashboard/create-post"
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Post
          </Link>
        </motion.div>
      </div>
      
      {/* Conference Filter */}
      <div className="mb-6">
        <ConferenceFilter
          conferences={conferences}
          onFilterChange={handleConferenceFilter}
          onClearFilter={handleClearFilter}
        />
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
          <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500"
        >
          <h2 className="text-gray-500 text-sm">Under Review</h2>
          <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500"
        >
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500"
        >
          <h2 className="text-gray-500 text-sm">Accepted</h2>
          <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
        </motion.div>
      </div>
      
      {/* Papers List */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        {selectedConference ? `${selectedConference.name} Papers` : "All Papers"}
      </h2>
      
      {filteredPapers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow p-8 text-center"
        >
          <p className="text-gray-600">
            {selectedConference 
              ? "No papers found for this conference" 
              : "No papers found"}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {filteredPapers.map((paper, index) => (
            <motion.div
              key={paper._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200"
            >
              <div className="p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-medium text-gray-900 truncate">
                      {paper.title}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-500">
                      <span className="truncate">By {paper.author?.name}</span>
                      <span>•</span>
                      <span className="truncate">{paper.conferenceId?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      paper.status === "Accepted" ? "bg-green-100 text-green-800" :
                      paper.status === "Rejected" ? "bg-red-100 text-red-800" :
                      paper.status === "Under Review" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {paper.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <AdminPaperActions
                    paper={paper}
                    onDownload={handleDownload}
                    onViewDetails={handleViewDetails}
                    onViewAuthor={handleViewAuthor}
                    onViewReviews={handleViewReviews}
                  />
                  
                  <PaperCard
                    paper={paper}
                    availableReviewers={reviewers}
                    onAssignReviewer={handleAssignReviewer}
                    onRemoveReviewer={handleRemoveReviewer}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 