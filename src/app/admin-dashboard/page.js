"use client";
import { useEffect, useState } from "react";
import PaperCard from "@/components/ui/PaperCard";
import AdminPaperActions from "@/components/ui/AdminPaperActions";
import ConferenceFilter from "@/components/ui/ConferenceFilter";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { FileCheck, Clock, FileX, RefreshCcw } from "lucide-react";

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
    accepted: 0,
    rejected: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    fetchPapersAndReviewers();
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await fetch('/api/conferences');
      if (!response.ok) {
        throw new Error('Failed to fetch conferences');
      }
      const data = await response.json();
      if (data.success) {
        setConferences(data.activeConferences);
      }
    } catch (error) {
      console.error('Error fetching conferences:', error);
      toast.error('Failed to load conferences');
    }
  };

  const fetchPapersAndReviewers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/papers');
      if (!response.ok) {
        throw new Error('Failed to fetch papers');
      }
      const data = await response.json();
      if (data.success) {
        setPapers(data.papers);
        setReviewers(data.reviewers);
        setStats(data.stats);
        setFilteredPapers(data.papers);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to load papers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConference) {
      const filtered = papers.filter(
        paper => paper.conference?._id === selectedConference._id
      );
      setFilteredPapers(filtered);
      updateConferenceStats(filtered);
    } else {
      setFilteredPapers(papers);
      updateStats(papers);
    }
  }, [selectedConference, papers]);

  const updateStats = (papers) => {
    const totalPapers = papers.length;
    const underReview = papers.filter(p => p.status === "Under Review").length;
    const accepted = papers.filter(p => p.status === "Accepted").length;
    const rejected = papers.filter(p => p.status === "Rejected").length;
    const pendingReviews = papers.filter(p => p.status === "Pending").length;

    setStats({
      totalPapers,
      underReview,
      accepted,
      rejected,
      pendingReviews,
    });
  };

  const updateConferenceStats = (papers) => {
    const totalPapers = papers.length;
    const underReview = papers.filter(p => p.status === "Under Review").length;
    const accepted = papers.filter(p => p.status === "Accepted").length;
    const rejected = papers.filter(p => p.status === "Rejected").length;
    const pendingReviews = papers.filter(p => p.status === "Pending").length;

    setStats({
      totalPapers,
      underReview,
      accepted,
      rejected,
      pendingReviews,
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
        if (paper._id === paperId) {
          return {
            ...paper,
            reviewers: [...paper.reviewers, data.reviewer],
            status: "Under Review",
          };
        }
        return paper;
      }));

      // Update statistics
      setStats({
        ...stats,
        underReview: stats.underReview + 1,
        pendingReviews: stats.pendingReviews - 1,
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
        if (paper._id === paperId) {
          return {
            ...paper,
            reviewers: paper.reviewers.filter(r => r.id !== reviewerId),
            status: "Pending",
          };
        }
        return paper;
      }));

      // Update statistics
      setStats({
        ...stats,
        underReview: stats.underReview - 1,
        pendingReviews: stats.pendingReviews + 1,
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <ConferenceFilter
            conferences={conferences}
            selectedConference={selectedConference}
            onSelectConference={handleConferenceFilter}
            onClearFilter={handleClearFilter}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Papers</p>
              <p className="text-2xl font-bold">{stats.totalPapers}</p>
            </div>
            <FileCheck className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Under Review</p>
              <p className="text-2xl font-bold">{stats.underReview}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-bold">{stats.accepted}</p>
            </div>
            <FileCheck className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <FileX className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredPapers.map((paper) => (
          <motion.div
            key={paper._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaperCard
              paper={paper}
              onDownload={() => handleDownload(paper)}
              onViewDetails={() => handleViewDetails(paper._id)}
              onViewAuthor={() => handleViewAuthor(paper.author._id)}
              onViewReviews={() => handleViewReviews(paper._id)}
              actions={
                <AdminPaperActions
                  paper={paper}
                  reviewers={reviewers}
                  onAssignReviewer={handleAssignReviewer}
                  onRemoveReviewer={handleRemoveReviewer}
                />
              }
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 