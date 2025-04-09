import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

const ReviewCard = ({ review }) => {
  const {
    comments,
    recommendation,
    score,
    submittedAt,
    reviewer,
    paper
  } = review;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            Paper: {paper?.title}
          </h3>
          <p className="text-sm text-gray-500">
            Reviewer: {reviewer?.name || "Anonymous"}
          </p>
          <p className="text-sm text-gray-500">
            Submitted {formatDistanceToNow(new Date(submittedAt))} ago
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-5 h-5 ${
                index < score
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <h4 className="font-medium text-gray-700">Recommendation</h4>
          <p className="mt-1 text-sm">{recommendation}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700">Comments</h4>
          <p className="mt-1 text-sm whitespace-pre-wrap">{comments}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard; 