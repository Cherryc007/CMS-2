"use client";

import { Suspense } from "react";
import ReviewApprovalContent from "@/components/ReviewApproval/ReviewApprovalContent";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ReviewApprovalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Review Approval Dashboard</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <ReviewApprovalContent />
      </Suspense>
    </div>
  );
} 