"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export default function ConferenceFilter({ 
  conferences, 
  onFilterChange,
  onClearFilter 
}) {
  const [selectedConference, setSelectedConference] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConferenceSelect = (conference) => {
    setSelectedConference(conference);
    setShowDropdown(false);
    onFilterChange(conference);
  };

  const handleClearFilter = () => {
    setSelectedConference(null);
    onClearFilter();
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          <Filter className="w-4 h-4 mr-2" />
          {selectedConference ? selectedConference.name : "Filter by Conference"}
        </Button>

        {selectedConference && (
          <Button
            onClick={handleClearFilter}
            className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-10 mt-2 w-64 bg-white rounded-md shadow-lg"
        >
          <div className="py-1">
            {conferences.map((conference) => (
              <button
                key={conference.id}
                onClick={() => handleConferenceSelect(conference)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  selectedConference?.id === conference.id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {conference.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 