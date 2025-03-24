"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function PaperForm() {
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    fileUrl: "",
    author: "",
    conferenceId: "",
  });

  const [file, setFile] = useState(null);

  // 🎯 Predefined Conferences
  const conferences = [
    { id: "661d5f1e2b48e12345678901", name: "AI & ML Conference 2025" },
    { id: "661d5f2f3b92a98765432101", name: "International Web Summit" },
    { id: "661d5f3a1cde456789012345", name: "Data Science Global 2025" },
    { id: "661d5f4b9abc567890123456", name: "Blockchain Innovations 2025" },
    { id: "661d5f5c8def678901234567", name: "IoT & Smart Systems Expo" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFormData({ ...formData, fileUrl: URL.createObjectURL(uploadedFile) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Paper submitted:", formData);
    alert("Paper Submitted Successfully!");
  };

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
          Submit a Paper
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Paper Title
            </label>
            <motion.input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter paper title"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Abstract */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Abstract
            </label>
            <motion.textarea
              name="abstract"
              rows="4"
              value={formData.abstract}
              onChange={handleChange}
              required
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter abstract"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Conference ID Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Conference
            </label>
            <motion.select
              name="conferenceId"
              value={formData.conferenceId}
              onChange={handleChange}
              required
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            >
              <option value="">Select a Conference</option>
              {conferences.map((conf) => (
                <option key={conf.id} value={conf.id}>
                  {conf.name}
                </option>
              ))}
            </motion.select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Paper (PDF/DOC)
            </label>
            <motion.div
              className="mt-1 relative flex items-center justify-center p-3 w-full border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
            >
              <input
                type="file"
                accept=".pdf, .doc, .docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              {file ? (
                <span className="text-gray-600">{file.name}</span>
              ) : (
                <span className="text-gray-500">Click to upload your paper</span>
              )}
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          >
            Submit Paper
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
