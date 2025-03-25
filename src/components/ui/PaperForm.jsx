"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { handlePaperSubmission } from "@/actions";

// Predefined conferences data
const conferences = [
  "AI & ML Conference 2025",
  "International Web Summit",
  "Data Science Global 2025",
  "Blockchain Innovations 2025",
  "IoT & Smart Systems Expo",
];

export default function PaperForm({ onClose }) {

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Submit New Paper
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <form action = {handlePaperSubmission} className="space-y-6">
        <div>
          <label
            htmlFor="conferenceId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select Conference
          </label>
          <select
            id="conferenceId"
            name="conferenceId"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select a conference</option>
            {conferences.map((conference) => (
              <option key={conference} value={conference}>
                {conference}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Paper Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder = "Enter Paper Title"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="abstract"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Abstract
          </label>
          <textarea
            id="abstract"
            name="abstract"
            placeholder = "Enter Abstract"
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Paper File (PDF)
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf"
            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900 dark:file:text-blue-100"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Submit Paper
          </Button>
        </div>
      </form>
    </div>
  );
}
