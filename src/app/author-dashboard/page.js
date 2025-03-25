"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockPapers } from "@/components/ui/MockDataProvider";
import PaperCard from "@/components/ui/PaperCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import PaperForm from "@/components/ui/PaperForm";

export default function AuthorDashboard() {
  const router = useRouter();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaperForm, setShowPaperForm] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch author's papers
    const fetchPapers = async () => {
      // In a real app, this would be an API call to get papers for the current author
      // For now, we'll filter mock papers to show only those with authorId "a001"
      const authorPapers = mockPapers.filter(paper => paper.authorId === "a001");
      setPapers(authorPapers);
      setLoading(false);
    };

    fetchPapers();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "text-blue-500";
      case "under review":
        return "text-yellow-500";
      case "accepted":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return <FileText className="w-4 h-4" />;
      case "under review":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
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
        <div className="flex justify-between items-center mb-8">
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
        </div>

        {papers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Papers Submitted Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start by submitting your first paper to a conference.
              </p>
              <Button
                onClick={() => setShowPaperForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Your First Paper
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {paper.title}
                    </h3>
                    <div className={`flex items-center ${getStatusColor(paper.status)}`}>
                      {getStatusIcon(paper.status)}
                      <span className="ml-1 text-sm">{paper.status}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {paper.abstract}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Submitted: {new Date(paper.submissionDate).toLocaleDateString()}</span>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/review-paper?id=${paper.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paper Form Modal */}
      {showPaperForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PaperForm onClose={() => setShowPaperForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 