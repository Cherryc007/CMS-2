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
      const filtered = papers.filter(paper => paper.conferenceId === selectedConference.id);
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

      setPapers(data.papers);
      setFilteredPapers(data.papers);
      setReviewers(data.reviewers);
      setConferences(data.conferences);
      updateStats(data.papers);

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
    router.push(`/paper-details?id=${paperId}`);
  };

  const handleViewAuthor = (authorId) => {
    router.push(`/user-details?id=${authorId}`);
  };

  const handleViewReviews = (paperId) => {
    router.push(`/paper-reviews?id=${paperId}`);
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
          className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500"
        >
          <h2 className="text-gray-500 text-sm">Total Papers</h2>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500"
        >
          <h2 className="text-gray-500 text-sm">Under Review</h2>
          <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500"
        >
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500"
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
        <div className="grid gap-6">
          {filteredPapers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {paper.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      By {paper.author} • {paper.conference}
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted on {paper.submissionDate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      paper.status === "Accepted" ? "bg-green-100 text-green-800" :
                      paper.status === "Rejected" ? "bg-red-100 text-red-800" :
                      paper.status === "Under Review" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {paper.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
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