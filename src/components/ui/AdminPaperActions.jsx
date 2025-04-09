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

      const response = await fetch(paper.fileUrl);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paper.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Paper downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download paper");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewDetails = () => {
    if (!paper?._id) {
      toast.error("Paper ID not found");
      return;
    }
    router.push(`/admin/paper-details/${paper._id}`);
  };

  const handleViewAuthors = () => {
    if (!paper?.author?._id) {
      toast.error("Author information not available");
      return;
    }
    router.push(`/admin/authors/${paper.author._id}`);
  };

  const handleViewReviews = () => {
    if (!paper?._id) {
      toast.error("Paper ID not found");
      return;
    }
    router.push(`/admin/reviews/${paper._id}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading || !paper?.fileUrl}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {isDownloading ? "Downloading..." : "Download"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDetails}
        disabled={!paper?._id}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Details
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleViewAuthors}
        disabled={!paper?.author?._id}
        className="flex items-center gap-2"
      >
        <Users className="w-4 h-4" />
        View Authors
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleViewReviews}
        disabled={!paper?._id}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        View Reviews
      </Button>
    </div>
  );
};

export default AdminPaperActions; 