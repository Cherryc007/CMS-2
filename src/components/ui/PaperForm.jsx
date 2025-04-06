"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function PaperForm({ onClose }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingConferences, setIsLoadingConferences] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [conferences, setConferences] = useState([]);
  const [formData, setFormData] = useState({
    conferenceId: "",
    title: "",
    abstract: "",
    filePath: "",
    fileUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        filePath: data.filePath,
        fileUrl: data.fileUrl
      }));
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      toast.error("You must be logged in to submit a paper");
      return;
    }

    if (!formData.filePath || !formData.fileUrl) {
      toast.error("Please upload your paper file");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('abstract', formData.abstract);
      formDataToSubmit.append('conferenceId', formData.conferenceId);
      formDataToSubmit.append('file', selectedFile);

      const response = await fetch('/api/author/submit-paper', {
        method: 'POST',
        body: formDataToSubmit,
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
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Paper File (PDF only)
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="file"
              id="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/20 dark:file:text-blue-400
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30"
            />
            <Button
              type="button"
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please upload your paper in PDF format (max 10MB)
          </p>
          {formData.filePath && (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              File uploaded successfully
            </p>
          )}
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
            disabled={isSubmitting || isLoadingConferences || conferences.length === 0 || !formData.filePath}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Paper"}
          </Button>
        </div>
      </form>
    </div>
  );
}
