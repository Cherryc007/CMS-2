/**
 * Validates file upload based on type and size constraints
 * @param {File} file - The file to validate
 * @param {Object} options - Optional validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 10)
 * @param {string[]} options.allowedTypes - Array of allowed MIME types (default: ['application/pdf'])
 * @returns {string|null} Error message if validation fails, null if validation passes
 */
export function validateFileUpload(file, options = {}) {
    const {
      maxSizeMB = 10,
      allowedTypes = ['application/pdf']
    } = options;
  
    // Check if file exists
    if (!file) {
      return "No file provided";
    }
  
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
  
    // Check file size (convert maxSizeMB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
  
    // Check if file name is too long
    if (file.name.length > 255) {
      return "File name is too long";
    }
  
    // Check if file name contains invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(file.name)) {
      return "File name contains invalid characters";
    }
  
    // All validations passed
    return null;
  } 