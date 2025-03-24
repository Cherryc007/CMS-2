"use client";

export default function PaperDetails({ paper }) {
  return (
    <div>
      {/* Paper Details Section */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">{paper.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          By {paper.author} • Submitted on {paper.submissionDate} • Conference: {paper.conference}
        </p>
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-700">Abstract</h2>
          <p className="mt-2 text-gray-700">{paper.abstract}</p>
        </div>
      </div>
      
      {/* Paper Content */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Paper Content</h2>
        <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto text-gray-700">
          {paper.fullText}
        </div>
        <div className="mt-4">
          <a 
            href={paper.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Full Paper
          </a>
        </div>
      </div>
    </div>
  );
} 