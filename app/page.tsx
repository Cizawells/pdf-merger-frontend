"use client";

import {
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useState } from "react";

// TypeScript declaration for Google Analytics
declare global {
  interface Window {
    gtag: (command: string, action: string, parameters?: any) => void;
    dataLayer: any[];
  }
}

// Types for our PDF merger
interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview?: string;
}

interface MergeResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

const PDFMergerApp = () => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop events
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  // Process and validate files
  const handleFiles = (fileList: File[]) => {
    const pdfFiles = fileList.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== fileList.length) {
      alert("Please select only PDF files");
    }

    const newFiles: PDFFile[] = pdfFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Remove file from list
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  // Move file up in order
  const moveFileUp = (id: string) => {
    setFiles((prev) => {
      const index = prev.findIndex((file) => file.id === id);
      if (index > 0) {
        const newFiles = [...prev];
        [newFiles[index - 1], newFiles[index]] = [
          newFiles[index],
          newFiles[index - 1],
        ];
        return newFiles;
      }
      return prev;
    });
  };

  // Move file down in order
  const moveFileDown = (id: string) => {
    setFiles((prev) => {
      const index = prev.findIndex((file) => file.id === id);
      if (index < prev.length - 1) {
        const newFiles = [...prev];
        [newFiles[index], newFiles[index + 1]] = [
          newFiles[index + 1],
          newFiles[index],
        ];
        return newFiles;
      }
      return prev;
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Merge PDFs (with multiple file upload)
  const mergePDFs = async () => {
    console.log("filess length", files.length);
    if (files.length < 2) {
      alert("Please select at least 2 PDF files to merge");
      return;
    }

    setIsMerging(true);
    setMergeResult(null);

    try {
      console.log(`Uploading ${files.length} files...`);

      // Upload all files at once using the new multiple upload endpoint
      const formData = new FormData();
      files.forEach((pdfFile) => {
        formData.append("files", pdfFile.file);
      });

      const uploadResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/pdfs`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload successful:", uploadResult);

      // Now merge the uploaded files
      const mergeRequest = {
        fileIds: uploadResult.files.map((f: any) => f.fileId),
        outputName: "merged-document.pdf",
      };

      // const data = {
      //   outputName: "mergepdf.pdf",
      //   fileIds: files.map((file) => file.id),
      // };

      const mergeResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mergeRequest),
        }
      );

      if (!mergeResponse.ok) {
        throw new Error(`Merge failed: ${mergeResponse.statusText}`);
      }

      const mergeResult = await mergeResponse.json();
      console.log("merrrge result", mergeResult);
      debugger;

      setMergeResult({
        success: true,
        downloadUrl: mergeResult.downloadUrl,
        filename: mergeResult.fileName,
      });

      // Track analytics (Week 2 requirement)
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_merge_success", {
          files_count: files.length,
          total_size: files.reduce((sum, file) => sum + file.size, 0),
        });
      }
    } catch (error: any) {
      setMergeResult({
        success: false,
        error: "Failed to merge PDFs. Please try again.",
      });

      // Track error analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_merge_error", {
          error: error.message,
        });
      }
    } finally {
      setIsMerging(false);
    }
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    setMergeResult(null);
  };

  // Download merged PDF
  const downloadMergedPDF = async () => {
    if (!mergeResult?.filename) {
      alert("No merged PDF available for download");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/merge/download/${mergeResult.filename}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = mergeResult.filename || "merged-document.pdf";

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track download analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_download_success", {
          filename: mergeResult.filename,
          files_merged: files.length,
        });
      }
    } catch (error: any) {
      console.error("Download failed:", error);
      alert("Failed to download merged PDF. Please try again.");

      // Track download error analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_download_error", {
          error: error.message,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PDF Merger</h1>
          <p className="text-gray-600">
            Upload, reorder, and merge your PDF files easily
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Drop PDF files here or click to select
            </h3>
            <p className="text-gray-500 mb-4">
              Select multiple PDF files to merge them into one document
            </p>

            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleInputChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
            >
              <Upload className="h-5 w-5 mr-2" />
              Choose PDF Files
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Selected Files ({files.length})
              </h3>
              <button
                onClick={clearFiles}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center p-3 bg-gray-50 rounded-lg"
                >
                  <FileText className="h-8 w-8 text-red-600 mr-3" />

                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveFileUp(file.id)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => moveFileDown(file.id)}
                      disabled={index === files.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merge Button */}
        {files.length >= 2 && (
          <div className="text-center mb-6">
            <button
              onClick={mergePDFs}
              disabled={isMerging}
              className="inline-flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Merging PDFs...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Merge PDFs
                </>
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {mergeResult && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {mergeResult.success ? (
              <div className="text-center">
                <div className="text-green-600 mb-4">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  PDFs Merged Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your merged PDF is ready for download
                </p>
                <button
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                  onClick={downloadMergedPDF}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Merged PDF
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Merge Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  {mergeResult.error || "An error occurred while merging PDFs"}
                </p>
                <button
                  onClick={() => setMergeResult(null)}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {files.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              How to use PDF Merger
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">1. Upload PDFs</h4>
                <p>Select or drag and drop multiple PDF files</p>
              </div>
              <div>
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <ArrowUp className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">2. Reorder Files</h4>
                <p>Use arrow buttons to arrange files in desired order</p>
              </div>
              <div>
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">3. Merge & Download</h4>
                <p>Click merge button to combine PDFs into one file</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Google Analytics Script Placeholder */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Google Analytics 4 Configuration
            // Replace GA_MEASUREMENT_ID with your actual measurement ID
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `,
        }}
      />
    </div>
  );
};

export default PDFMergerApp;
