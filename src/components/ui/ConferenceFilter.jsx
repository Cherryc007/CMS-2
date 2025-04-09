"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const ConferenceFilter = ({ conferences, onFilterChange, onClearFilter }) => {
  const [selectedConference, setSelectedConference] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-2 min-w-[200px] bg-white"
        >
          <span className="truncate">
            {selectedConference ? selectedConference.name : "Filter by Conference"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>

        {selectedConference && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilter}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 py-1 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="max-h-60 overflow-auto">
            {conferences.map((conference) => (
              <button
                key={conference._id}
                onClick={() => handleConferenceSelect(conference)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                  selectedConference?._id === conference._id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {conference.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceFilter; 