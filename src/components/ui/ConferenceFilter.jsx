"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const ConferenceFilter = ({ conferences, onFilterChange, onClearFilter }) => {
  const [selectedConference, setSelectedConference] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".conference-filter")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConferenceSelect = (conference) => {
    setSelectedConference(conference);
    setIsOpen(false);
    onFilterChange(conference._id);
  };

  const handleClearFilter = () => {
    setSelectedConference(null);
    onClearFilter();
  };

  return (
    <div className="conference-filter relative">
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-white hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-700">
          {selectedConference ? selectedConference.name : "Filter by Conference"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-lg border border-gray-200"
          >
            <div className="py-1 max-h-60 overflow-auto">
              {conferences.map((conference) => (
                <button
                  key={conference._id}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    selectedConference?._id === conference._id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleConferenceSelect(conference)}
                >
                  {conference.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedConference && (
        <Button
          variant="ghost"
          className="ml-2 text-sm text-gray-500 hover:text-gray-700"
          onClick={handleClearFilter}
        >
          Clear
        </Button>
      )}
    </div>
  );
};

export default ConferenceFilter; 