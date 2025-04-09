"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Eye, User, FileText, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminPaperActions({ 
  paper, 
  onDownload, 
  onViewDetails, 
  onViewAuthor,
  onViewReviews 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      await onDownload(paper);
    } catch (error) {
      toast.error("Failed to download paper");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Paper
      </Button>

      <Button
        onClick={() => onViewDetails(paper.id)}
        className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
      >
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </Button>

      <Button
        onClick={() => onViewAuthor(paper.authorId)}
        className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
      >
        <User className="w-4 h-4 mr-2" />
        View Author
      </Button>

      {paper.reviewCount > 0 && (
        <Button
          onClick={() => onViewReviews(paper.id)}
          className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Reviews ({paper.reviewCount})
        </Button>
      )}
    </div>
  );
} 