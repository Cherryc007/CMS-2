"use client";
import { motion } from "framer-motion";
import { handleConferenceCreation } from "@/actions";
export default function ConferenceCreationForm() {

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
          Create a Conference
        </h2>
        <form action = {handleConferenceCreation} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Conference Name
            </label>
            <motion.input
              type="text"
              name="name"
              required
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter conference name"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Submission Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Submission Deadline
            </label>
            <motion.input
              type="date"
              name="submissionDeadline"
              required
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <motion.input
              type="text"
              name="location"
              required
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter location"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <motion.textarea
              name="description"
              rows="3"
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter description (optional)"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          >
            Create Conference
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
