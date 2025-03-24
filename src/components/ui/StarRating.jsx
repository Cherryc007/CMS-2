"use client";

export default function StarRating({ rating, onRatingChange, category }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(category, star)}
          className={`${
            star <= rating
              ? "text-yellow-400"
              : "text-gray-300"
          } focus:outline-none text-xl mx-0.5`}
        >
          ★
        </button>
      ))}
    </div>
  );
} 