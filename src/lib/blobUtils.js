import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * Uploads a file to Vercel Blob storage
 * @param {File} file - The file to upload
 * @param {string} prefix - Prefix for the file name (e.g., 'papers' or 'reviews')
 * @returns {Promise<{url: string, pathname: string}>} The URL and pathname of the uploaded file
 */
export async function uploadToBlob(file, prefix) {
  try {
    console.log('Starting file upload to Vercel Blob...');
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type || !file.type.includes('pdf')) {
      throw new Error('Only PDF files are allowed');
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `${prefix}-${timestamp}-${randomString}.pdf`;

    console.log('Generated filename:', filename);

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
    }

    // Upload to Vercel Blob
    const { url, pathname } = await put(filename, file, {
      access: 'public',
      contentType: 'application/pdf',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log('File uploaded successfully:', { url, pathname });

    return { url, pathname };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Validates a file upload
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Promise<{valid: boolean, error?: string}>} Validation result
 */
export async function validateFileUpload(file, maxSize = 10 * 1024 * 1024) { // 10MB default
  try {
    console.log('Validating file upload...');
    console.log('File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    // Check if file exists
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file type
    if (!file.type || !file.type.includes('pdf')) {
      return { valid: false, error: 'Only PDF files are allowed' };
    }

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
    }

    console.log('File validation successful');
    return { valid: true };
  } catch (error) {
    console.error('Error validating file:', error);
    return { valid: false, error: 'Error validating file' };
  }
} 