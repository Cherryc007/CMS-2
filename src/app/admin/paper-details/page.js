"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { put } from "@vercel/blob";

function PaperDetailsContent() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get("id");
  const [paper, setPaper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (paperId) {
      fetchPaperDetails();
    }
  }, [paperId]);

  const fetchPaperDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/papers/${paperId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch paper details");
      }

      setPaper(data.paper);
    } catch (error) {
      console.error("Error fetching paper details:", error);
      toast.error(error.message || "Failed to load paper details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!paper?.fileUrl) {
      toast.error("No file available for download");
      return;
    }

    try {
      const response = await fetch(paper.fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${paper.title.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Paper not found</p>
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
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>By {paper.author?.name}</span>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Conference:</span>
                <span>{paper.conference?.name}</span>
              </div>
              <span>•</span>
              <span>Submitted on {new Date(paper.submissionDate).toLocaleDateString()}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            paper.status === "Accepted" ? "bg-green-100 text-green-800" :
            paper.status === "Rejected" ? "bg-red-100 text-red-800" :
            paper.status === "Under Review" ? "bg-yellow-100 text-yellow-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {paper.status}
          </span>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
          <p className="text-gray-700 mb-6">{paper.abstract}</p>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Keywords</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {paper.keywords?.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviewers</h2>
          <div className="space-y-2 mb-6">
            {paper.reviewers?.map((reviewer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{reviewer.name}</span>
                <span className="text-sm text-gray-500">{reviewer.status}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Download Paper
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminPaperDetails() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <PaperDetailsContent />
    </Suspense>
  );
} 