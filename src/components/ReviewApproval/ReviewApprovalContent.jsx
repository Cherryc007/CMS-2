"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReviewCard from "@/components/ui/ReviewCard";
import { Button } from "@/components/ui/button";

export default function ReviewApprovalContent() {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch("/api/admin/pending-reviews");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pending reviews");
      }

      setPendingReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      toast.error(error.message || "Failed to load pending reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReview = async (reviewId, verdict) => {
    try {
      const response = await fetch("/api/admin/review-verdict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          verdict,
          adminVerdict: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update review status");
      }

      toast.success("Review verdict submitted successfully");
      // Remove the approved review from the list
      setPendingReviews(prevReviews => 
        prevReviews.filter(review => review._id !== reviewId)
      );
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error(error.message || "Failed to update review status");
    }
  };

  const handleDownload = async (fileType) => {
    try {
      let filePath;
      if (fileType === 'paper') {
        filePath = review.paper.filePath;
      } else if (fileType === 'review' && review.filePath) {
        filePath = review.filePath;
      } else {
        throw new Error('File not found');
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const data = await response.json();
      
      if (!data.success || !data.url) {
        throw new Error(data.message || 'Failed to get download URL');
      }

      // Open the blob URL in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (pendingReviews.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-600">
          No pending reviews to approve
        </h2>
        <p className="text-gray-500 mt-2">
          All reviews have been processed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingReviews.map((review) => (
        <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
          <ReviewCard review={review} />
          <div className="mt-4 flex gap-4">
            <Button
              onClick={() => handleApproveReview(review._id, "approved")}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve Review
            </Button>
            <Button
              onClick={() => handleApproveReview(review._id, "rejected")}
              variant="destructive"
            >
              Reject Review
            </Button>
            <Button
              onClick={() => handleApproveReview(review._id, "revision")}
              variant="outline"
            >
              Request Revision
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 