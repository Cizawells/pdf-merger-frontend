"use client";
import {
  ArrowLeft,
  Cloud,
  Download,
  FileText,
  FolderOpen,
  Grid3X3,
  Layers,
  Loader2,
  Plus,
  Scissors,
  Settings,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

// TypeScript declarations
declare global {
  interface Window {
    gtag: (command: string, action: string, parameters?: any) => void;
    dataLayer: any[];
  }
}

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  totalPages?: number;
  preview?: string;
}

interface SplitOption {
  type: "pages" | "range" | "size" | "extract";
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface SplitRequest {
  fileId: string;
  splitType: string;
  options: {
    pages?: number[];
    ranges?: string;
    pageNumbers?: string;
    extractPages?: string;
    maxSizeKB?: number;
  };
}

interface SplitResponse {
  success: boolean;
  files?: { name: string; downloadUrl: string }[];
  error?: string;
}

const PDFSplitterApp = () => {
  const router = useRouter();
  const [file, setFile] = useState<PDFFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResult, setSplitResult] = useState<SplitResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSplitType, setSelectedSplitType] = useState<string>("pages");
  const [isDragOver, setIsDragOver] = useState(false);

  // Split configuration states
  const [pagesPerSplit, setPagesPerSplit] = useState<number>(1);
  const [customRanges, setCustomRanges] = useState<string>("");
  const [extractPages, setExtractPages] = useState<string>("");
  const [maxFileSize, setMaxFileSize] = useState<number>(5000); // KB
  const [showPreview, setShowPreview] = useState(false);

  const splitOptions: SplitOption[] = [
    {
      type: "pages",
      label: "Split by Pages",
      description: "Split every N pages into separate files",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      type: "range",
      label: "Split by Range",
      description: "Define custom page ranges (e.g., 1-5, 6-10)",
      icon: <Grid3X3 className="h-5 w-5" />,
    },
    {
      type: "extract",
      label: "Extract Pages",
      description: "Extract specific pages (e.g., 1, 3, 5-7)",
      icon: <Scissors className="h-5 w-5" />,
    },
    {
      type: "size",
      label: "Split by Size",
      description: "Split based on maximum file size",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

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
    if (droppedFiles.length > 0) {
      handleFile(droppedFiles[0]);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Process and validate file
  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    // Simulate getting page count (in real app, you'd get this from backend)
    const mockPageCount = Math.floor(Math.random() * 50) + 5;

    const newFile: PDFFile = {
      id: Math.random().toString(36).substr(2, 9),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size,
      totalPages: mockPageCount,
    };

    setFile(newFile);
    setSplitResult(null);
  };

  // Remove file
  const removeFile = () => {
    setFile(null);
    setSplitResult(null);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Validate split configuration
  const validateSplitConfig = (): string | null => {
    if (!file) return "No file selected";

    switch (selectedSplitType) {
      case "pages":
        if (pagesPerSplit < 1 || pagesPerSplit >= (file.totalPages || 1)) {
          return "Pages per split must be between 1 and total pages";
        }
        break;
      case "range":
        if (!customRanges.trim()) {
          return "Please specify page ranges (e.g., 1-5, 6-10)";
        }
        break;
      case "extract":
        if (!extractPages.trim()) {
          return "Please specify pages to extract (e.g., 1, 3, 5-7)";
        }
        break;
      case "size":
        if (maxFileSize < 100) {
          return "Maximum file size must be at least 100 KB";
        }
        break;
    }
    return null;
  };

  // Split PDF
  const splitPDF = async () => {
    const validationError = validateSplitConfig();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (!file) return;

    setIsSplitting(true);
    setSplitResult(null);

    try {
      // Upload file first
      const formData = new FormData();
      formData.append("files", file.file);
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
      debugger;
      // Prepare split request
      const splitRequest: SplitRequest = {
        fileId: uploadResult.files.map((f: any) => f.fileId)[0],
        splitType: selectedSplitType,
        options: {},
      };

      switch (selectedSplitType) {
        case "pages":
          splitRequest.options.pages = [pagesPerSplit];
          break;
        case "range":
          splitRequest.options.ranges = customRanges;
          break;
        case "extract":
          splitRequest.options.extractPages = extractPages;
          break;
        case "size":
          splitRequest.options.maxSizeKB = maxFileSize;
          break;
      }

      // Split PDF
      const splitResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/split/pattern`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...splitRequest,
            splitByPattern: splitRequest.options.pages
              ? splitRequest.options.pages?.join("")
              : "1",
          }),
        }
      );

      if (!splitResponse.ok) {
        throw new Error(`Split failed: ${splitResponse.statusText}`);
      }

      const splitResult = await splitResponse.json();

      setSplitResult({
        success: true,
        files: splitResult.files || [],
      });

      // Track analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_split_success", {
          split_type: selectedSplitType,
          total_pages: file.totalPages,
          file_size: file.size,
          output_files: splitResult.files?.length || 0,
        });
      }
    } catch (error: any) {
      setSplitResult({
        success: false,
        error: "Failed to split PDF. Please try again.",
      });

      // Track error analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_split_error", {
          error: error.message,
        });
      }
    } finally {
      setIsSplitting(false);
    }
  };

  // Download split files
  const downloadFile = async (fileName: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/split/download/${fileName}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Track download
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "pdf_download_success", {
          filename: fileName,
        });
      }
    } catch (error: any) {
      console.error("Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  // Download all files
  const downloadAllFiles = async () => {
    if (!splitResult?.files) return;

    for (const file of splitResult.files) {
      await downloadFile(file.name);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const renderSplitConfiguration = () => {
    switch (selectedSplitType) {
      case "pages":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages per split
              </label>
              <input
                type="number"
                min="1"
                max={file?.totalPages || 1}
                value={pagesPerSplit}
                onChange={(e) =>
                  setPagesPerSplit(parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Split every {pagesPerSplit} page(s) into separate files
              </p>
            </div>
          </div>
        );

      case "range":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Ranges
              </label>
              <input
                type="text"
                placeholder="e.g., 1-5, 6-10, 11-15"
                value={customRanges}
                onChange={(e) => setCustomRanges(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Specify page ranges separated by commas (e.g., 1-5, 8-12)
              </p>
            </div>
          </div>
        );

      case "extract":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pages to Extract
              </label>
              <input
                type="text"
                placeholder="e.g., 1, 3, 5-7, 10"
                value={extractPages}
                onChange={(e) => setExtractPages(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Specify individual pages or ranges (e.g., 1, 3, 5-7, 10)
              </p>
            </div>
          </div>
        );

      case "size":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (KB)
              </label>
              <input
                type="number"
                min="100"
                value={maxFileSize}
                onChange={(e) =>
                  setMaxFileSize(parseInt(e.target.value) || 5000)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Split into files no larger than{" "}
                {formatFileSize(maxFileSize * 1024)}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">
                  PDF To Word
                </span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                All Tools
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Help
              </a>
            </nav>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
              Premium
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scissors className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">PDF Splitter</h1>
          </div>
          <p className="text-gray-600">
            Split your PDF into multiple files with advanced customization
            options
          </p>
        </div>

        {/* Upload Area */}
        {!file && (
          <>
            <div className="max-w-2xl mx-auto">
              <div
                className={`border-2 border-dashed rounded-2xl p-16 transition-all cursor-pointer ${
                  isDragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-300 hover:border-blue-400 bg-white"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("file-input").click()}
              >
                <Upload
                  className={`w-16 h-16 mx-auto mb-6 transition-colors ${
                    isDragOver ? "text-blue-500" : "text-slate-400"
                  }`}
                />
                <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                  {isDragOver ? "Drop your PDFs here" : "Select PDF files"}
                </h3>
                <p className="text-slate-500 mb-6">or drop PDFs here</p>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold">
                  Select PDF files
                </button>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* Upload Options */}
              <div className="flex justify-center space-x-4 mt-8">
                <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                  <Cloud className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">From Google Drive</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                  <FolderOpen className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700">From Dropbox</span>
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Drop a PDF file here or click to select
                </h3>
                <p className="text-gray-500 mb-4">
                  Select a PDF file to split into multiple documents
                </p>

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleInputChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors duration-200"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose PDF File
                </label>
              </div>
            </div>
          </>
        )}

        {/* File Preview */}
        {file && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Selected File
              </h3>
              <button
                onClick={removeFile}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Remove File
              </button>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <FileText className="h-8 w-8 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium text-gray-700">{file.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{file.totalPages} pages</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Split Options */}
        {file && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Split Options
            </h3>

            {/* Option Tabs */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {splitOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSelectedSplitType(option.type)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedSplitType === option.type
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedSplitType === option.type
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {option.icon}
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>

            {/* Configuration Panel */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-700 mb-4">
                {
                  splitOptions.find((opt) => opt.type === selectedSplitType)
                    ?.label
                }{" "}
                Configuration
              </h4>
              {renderSplitConfiguration()}
            </div>
          </div>
        )}

        {/* Split Button */}
        {file && (
          <div className="text-center mb-6">
            <button
              onClick={splitPDF}
              disabled={isSplitting}
              className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
            >
              {isSplitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Splitting PDF...
                </>
              ) : (
                <>
                  <Scissors className="h-5 w-5 mr-2" />
                  Split PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {splitResult && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {splitResult.success ? (
              <div>
                <div className="text-center mb-6">
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
                    PDF Split Successfully!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your PDF has been split into{" "}
                    {splitResult.files?.length || 0} file(s)
                  </p>
                  <button
                    onClick={downloadAllFiles}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 mr-4"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download All Files
                  </button>
                </div>

                {/* Individual File Downloads */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">
                    Individual Downloads:
                  </h4>
                  {splitResult.files?.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-red-600 mr-3" />
                        <span className="font-medium text-gray-700">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => downloadFile(file.name)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
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
                  Split Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  {splitResult.error ||
                    "An error occurred while splitting the PDF"}
                </p>
                <button
                  onClick={() => setSplitResult(null)}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!file && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              How to Split PDFs
            </h3>
            <div className="grid md:grid-cols-4 gap-6 text-sm text-gray-600">
              <div>
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">1. Upload PDF</h4>
                <p>Select or drag and drop your PDF file</p>
              </div>
              <div>
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">2. Choose Split Type</h4>
                <p>Select how you want to split your PDF</p>
              </div>
              <div>
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Scissors className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">3. Configure Options</h4>
                <p>Set your preferred split parameters</p>
              </div>
              <div>
                <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">4. Download Files</h4>
                <p>Download your split PDF files individually or all at once</p>
              </div>
            </div>
          </div>
        )}

        {/* Google Analytics Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `,
          }}
        />
      </div>
    </div>
  );
};

export default PDFSplitterApp;
