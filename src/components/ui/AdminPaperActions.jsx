"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Download, Eye, Users, FileText } from "lucide-react";

const AdminPaperActions = ({ paper }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      if (!paper?.fileUrl) {
        toast.error("No file available for download");
        return;
      }

      // First try to get a download URL if it's a blob URL
      let downloadUrl = paper.fileUrl;
      if (paper.fileUrl.startsWith('blob:')) {
        const response = await fetch(`/api/papers/${paper._id}/download`);
        if (!response.ok) {
          throw new Error("Failed to get download URL");
        }
        const data = await response.json();
        downloadUrl = data.downloadUrl;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paper.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Paper downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download paper");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewDetails = () => {
    try {
      if (!paper?._id) {
        toast.error("Paper ID not found");
        return;
      }
      router.push(`/admin/papers/${paper._id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to view paper details");
    }
  };

  const handleViewAuthors = () => {
    try {
      if (!paper?.author?._id) {
        toast.error("Author information not available");
        return;
      }
      router.push(`/admin/authors/${paper.author._id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to view author details");
    }
  };

  const handleViewReviews = () => {
    try {
      if (!paper?._id) {
        toast.error("Paper ID not found");
        return;
      }
      router.push(`/admin/papers/${paper._id}/reviews`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to view reviews");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading || !paper?.fileUrl}
        className="flex items-center gap-2 min-w-[120px]"
      >
        <Download className="w-4 h-4" />
        {isDownloading ? "Downloading..." : "Download"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDetails}
        disabled={!paper?._id}
        className="flex items-center gap-2 min-w-[120px]"
      >
        <Eye className="w-4 h-4" />
        View Details
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleViewAuthors}
        disabled={!paper?.author?._id}
        className="flex items-center gap-2 min-w-[120px]"
      >
        <Users className="w-4 h-4" />
        View Authors
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleViewReviews}
        disabled={!paper?._id}
        className="flex items-center gap-2 min-w-[120px]"
      >
        <FileText className="w-4 h-4" />
        View Reviews
      </Button>
    </div>
  );
};

export default AdminPaperActions; 