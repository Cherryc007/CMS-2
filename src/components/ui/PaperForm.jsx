"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function PaperForm({ onClose }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingConferences, setIsLoadingConferences] = useState(true);
  const [conferences, setConferences] = useState([]);
  const [formData, setFormData] = useState({
    conferenceId: "",
    title: "",
    abstract: "",
    fileUrl: ""
  });

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      setIsLoadingConferences(true);
      const response = await fetch('/api/conferences');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch conferences");
      }

      const data = await response.json();
      
      if (data.success && data.activeConferences && data.activeConferences.length > 0) {
        setConferences(data.activeConferences);
      } else {
        toast.error("No active conferences available for submission");
      }
    } catch (error) {
      console.error("Error fetching conferences:", error);
      toast.error("Failed to load conferences. Please try again later.");
    } finally {
      setIsLoadingConferences(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      toast.error("You must be logged in to submit a paper");
      return;
    }

    // Validate document URL
    if (!formData.fileUrl) {
      toast.error("Please provide a document URL");
      return;
    }

    try {
      // Basic URL validation
      new URL(formData.fileUrl);
    } catch (err) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submission = {
        ...formData,
        userEmail: session.user.email,
      };

      const response = await fetch('/api/papers/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit paper");
      }

      const result = await response.json();
      
      toast.success("Paper submitted successfully!");
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit paper");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Submit New Paper
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="conferenceId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select Conference
          </label>
          {isLoadingConferences ? (
            <div className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-gray-400 dark:text-gray-500 shadow-sm sm:text-sm animate-pulse">
              Loading conferences...
            </div>
          ) : conferences.length === 0 ? (
            <div className="mt-1 block w-full rounded-md border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-red-600 dark:text-red-400 shadow-sm sm:text-sm">
              No active conferences available for submission
            </div>
          ) : (
            <select
              id="conferenceId"
              name="conferenceId"
              value={formData.conferenceId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a conference</option>
              {conferences.map((conference) => (
                <option key={conference.id} value={conference.id}>
                  {conference.name} - {conference.location} (Deadline: {conference.submissionDeadline}, {conference.daysRemaining} days left)
                </option>
              ))}
            </select>
          )}
          {conferences.length > 0 && formData.conferenceId && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {conferences.find(c => c.id === formData.conferenceId)?.description || ""}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Paper Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter Paper Title"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="abstract"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            value={formData.abstract}
            onChange={handleChange}
            placeholder="Enter Abstract"
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="fileUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Document URL
          </label>
          <input
            type="url"
            id="fileUrl"
            name="fileUrl"
            value={formData.fileUrl}
            onChange={handleChange}
            placeholder="https://example.com/your-paper.pdf"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please provide a link to your paper (Google Drive, Dropbox, etc.)
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingConferences || conferences.length === 0}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Paper"}
          </Button>
        </div>
      </form>
    </div>
  );
}
