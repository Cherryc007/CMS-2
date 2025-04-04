"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle, Calendar, MapPin, CalendarDays, AlertCircle, CheckCircle2, FilePlus, Loader2, TimerOff, Timer, PieChart, ChevronDown } from "lucide-react";
import PaperForm from "@/components/ui/PaperForm";
import { motion } from "framer-motion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/alert";

export default function AuthorDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [papers, setPapers] = useState([]);
  const [conferences, setConferences] = useState({ active: [], expired: [] });
  const [loading, setLoading] = useState(true);
  const [loadingConferences, setLoadingConferences] = useState(true);
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.user) {
      fetchPapers();
      fetchConferences();
    }
  }, [session]);

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

  const fetchConferences = async () => {
    try {
      setLoadingConferences(true);
      setError(null);
      const response = await fetch("/api/conferences");
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConferences({
          active: data.activeConferences || [],
          expired: data.expiredConferences || []
        });
      } else {
        setError(data.message || "Failed to fetch conferences");
      }
    } catch (err) {
      console.error("Error fetching conferences:", err);
      setError("Failed to fetch conferences. Please try again later.");
    } finally {
      setLoadingConferences(false);
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

  if (loading && loadingConferences) {
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
            Author Dashboard
          </h1>
          <Button
            onClick={() => setShowPaperForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Submit New Paper
          </Button>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
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
        </div>

        {/* Available Conferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Available Conferences</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Conferences accepting paper submissions
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConferences}
              disabled={loadingConferences}
            >
              {loadingConferences ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>

          {loadingConferences ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading conferences...</span>
            </div>
          ) : conferences.active.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">
                No Active Conferences
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                There are no conferences currently accepting submissions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {conferences.active.map((conference) => (
                <div
                  key={conference.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b">
                    <h3 className="font-bold text-lg truncate" title={conference.name}>
                      {conference.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={conference.description}>
                      {conference.description}
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Submissions Due: {new Date(conference.submissionDeadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm mb-2">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        {conference.daysRemaining > 0
                          ? `${conference.daysRemaining} days remaining`
                          : "Deadline today!"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Timer className="h-4 w-4 mr-2 text-purple-500" />
                      <span>Conference: {new Date(conference.startDate).toLocaleDateString()} - {new Date(conference.endDate).toLocaleDateString()}</span>
                    </div>
                    <Button
                      className="w-full mt-4 bg-primary text-white hover:bg-primary/90"
                      onClick={() => {
                        setShowPaperForm(true);
                      }}
                    >
                      <FilePlus className="mr-2 h-4 w-4" />
                      Submit Paper
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expired Conferences Section (collapsed) */}
        {conferences.expired.length > 0 && (
          <div className="mt-8">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-0 font-normal">
                  <div className="flex items-center">
                    <TimerOff className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Past Conferences ({conferences.expired.length})</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {conferences.expired.map((conference) => (
                    <div
                      key={conference.id}
                      className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
                    >
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b">
                        <h3 className="font-bold text-lg text-gray-600 dark:text-gray-400 truncate" title={conference.name}>
                          {conference.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 truncate" title={conference.description}>
                          {conference.description}
                        </p>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center text-sm mb-2 text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Submission Closed: {new Date(conference.submissionDeadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Conference: {new Date(conference.startDate).toLocaleDateString()} - {new Date(conference.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* My Papers Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            My Papers
          </h2>

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
                  You don&apos;t have any papers in the system yet. Start by submitting your first paper to an available conference.
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
                        <span className="ml-1 text-xs font-medium">{paper.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                      {paper.abstract}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <span>Submitted: {paper.submissionDate}</span>
                      <span>Conference: {paper.conference}</span>
                    </div>
                    
                    <Button
                      onClick={() => router.push(`/paper-details?id=${paper.id}`)}
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Paper Submission Modal */}
        {showPaperForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto"
            >
              <PaperForm onClose={() => setShowPaperForm(false)} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 