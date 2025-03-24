"use client";
import Link from "next/link";
import StarRating from "./StarRating";

export default function ReviewForm({ 
  review, 
  statusOptions, 
  onRatingChange, 
  onCommentsChange, 
  onStatusChange, 
  onSubmit 
}) {
  return (
    <form onSubmit={onSubmit} className="px-6 py-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Review Paper</h2>
      
      <div className="space-y-6">
        {/* Rating Criteria */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Novelty */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Novelty & Originality</label>
                <span className="text-sm text-gray-500">{review.novelty}/5</span>
              </div>
              <StarRating 
                rating={review.novelty} 
                onRatingChange={onRatingChange} 
                category="novelty" 
              />
            </div>
            
            {/* Technical Quality */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Technical Quality</label>
                <span className="text-sm text-gray-500">{review.technicalQuality}/5</span>
              </div>
              <StarRating 
                rating={review.technicalQuality} 
                onRatingChange={onRatingChange} 
                category="technicalQuality" 
              />
            </div>
            
            {/* Clarity */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Clarity & Presentation</label>
                <span className="text-sm text-gray-500">{review.clarity}/5</span>
              </div>
              <StarRating 
                rating={review.clarity} 
                onRatingChange={onRatingChange} 
                category="clarity" 
              />
            </div>
            
            {/* Relevance */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Relevance & Impact</label>
                <span className="text-sm text-gray-500">{review.relevance}/5</span>
              </div>
              <StarRating 
                rating={review.relevance} 
                onRatingChange={onRatingChange} 
                category="relevance" 
              />
            </div>
          </div>
          
          {/* Overall Rating (calculated automatically) */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
              <span className="text-sm text-gray-500">
                {(review.novelty + review.technicalQuality + review.clarity + review.relevance) / 4}/5
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${((review.novelty + review.technicalQuality + review.clarity + review.relevance) / 4) * 20}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Comments & Feedback
          </label>
          <textarea
            rows={6}
            value={review.comments}
            onChange={onCommentsChange}
            placeholder="Provide detailed feedback for the authors. What are the strengths and weaknesses of the paper? What improvements would you suggest?"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            required
          ></textarea>
        </div>
        
        {/* Status Decision */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decision
          </label>
          <select
            value={review.status}
            onChange={onStatusChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            required
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            This decision will be communicated to the author.
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Link 
          href="/admin-dashboard" 
          className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          Submit Review
        </button>
      </div>
    </form>
  );
} 