"use client";
import Header from "@/components/ui/header";
import {
  ArrowLeft,
  Cloud,
  Download,
  FileText,
  FolderOpen,
  Grid3X3,
  Info,
  Layers,
  Loader2,
  Plus,
  Scissors,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { UploadFile, useFilesContext } from "../context/context";

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
  pages?: number;
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
    const { files, setFiles, mergeResult, setMergeResult } = useFilesContext();
  const [file, setFile] = useState<UploadFile | null>(null);
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

  useEffect(() => {
    if (files) {
      setFile(files[0] ?? null); // example: take the first file
    }
  }, [files]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
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

    const newFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      file: selectedFile,
      name: selectedFile.name,
      size: selectedFile.size.toString(),
      pages: mockPageCount,
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
        if (pagesPerSplit < 1 || pagesPerSplit >= (file.pages || 1)) {
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
          total_pages: file.pages,
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
        `${process.env.NEXT_PUBLIC_API_URL}/download/${fileName}`,
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pages per split
              </label>
              <input
                type="number"
                min="1"
                max={file?.pages || 1}
                value={pagesPerSplit}
                onChange={(e) =>
                  setPagesPerSplit(parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-1">
                Split every {pagesPerSplit} page(s) into separate files
              </p>
            </div>
          </div>
        );

      case "range":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Page Ranges
              </label>
              <input
                type="text"
                placeholder="e.g., 1-5, 6-10, 11-15"
                value={customRanges}
                onChange={(e) => setCustomRanges(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-1">
                Specify page ranges separated by commas (e.g., 1-5, 8-12)
              </p>
            </div>
          </div>
        );

      case "extract":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pages to Extract
              </label>
              <input
                type="text"
                placeholder="e.g., 1, 3, 5-7, 10"
                value={extractPages}
                onChange={(e) => setExtractPages(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-1">
                Specify individual pages or ranges (e.g., 1, 3, 5-7, 10)
              </p>
            </div>
          </div>
        );

      case "size":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum File Size (KB)
              </label>
              <input
                type="number"
                min="100"
                value={maxFileSize}
                onChange={(e) =>
                  setMaxFileSize(parseInt(e.target.value) || 5000)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-1">
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
      <Header title="Split PDF" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!file ? (
          // Initial Upload State
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Split PDF Files
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                Split your PDF document into multiple files. Choose from various
                splitting options like page ranges, file size limits, or extract
                specific pages.
              </p>
            </div>

            {/* Upload Area */}
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
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Upload
                  className={`w-16 h-16 mx-auto mb-6 transition-colors ${
                    isDragOver ? "text-blue-500" : "text-slate-400"
                  }`}
                />
                <h3 className="text-2xl font-semibold text-slate-700 mb-3">
                  {isDragOver ? "Drop your PDF here" : "Select PDF file"}
                </h3>
                <p className="text-slate-500 mb-6">or drop PDF here</p>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold">
                  Select PDF file
                </button>
                <input
                  id="file-input"
                  type="file"
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
          </div>
        ) : (
          // Files Uploaded State
          <div className="grid lg:grid-cols-4 gap-8">
            {/* File Preview Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Selected PDF
                  </h2>
                  <button
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="flex items-center p-4 bg-slate-50 rounded-xl border-2 border-transparent">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 truncate max-w-xs">
                      {file.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span>{formatFileSize(parseInt(file.size))}</span>
                      <span>•</span>
                      <span>{file.pages} pages</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split Options */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  Choose Split Method
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {splitOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedSplitType(option.type)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedSplitType === option.type
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <div
                          className={`p-2 rounded-lg mr-3 ${
                            selectedSplitType === option.type
                              ? "bg-blue-500 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {option.icon}
                        </div>
                        <h4 className="font-semibold text-slate-800">
                          {option.label}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-600">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Section */}
              {splitResult && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
                  {splitResult.success ? (
                    <div>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Download className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          PDF Split Successfully!
                        </h3>
                        <p className="text-slate-600 mb-6">
                          Your PDF has been split into{" "}
                          {splitResult.files?.length || 0} file(s)
                        </p>
                        <button
                          onClick={downloadAllFiles}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg mb-6 flex items-center justify-center space-x-2 mx-auto"
                        >
                          <Download className="w-5 h-5" />
                          <span>Download All Files</span>
                        </button>
                      </div>

                      {/* Individual File Downloads */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800 mb-4">
                          Individual Downloads:
                        </h4>
                        {splitResult.files?.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                          >
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-red-600 mr-3" />
                              <span className="font-medium text-slate-700">
                                {file.name}
                              </span>
                            </div>
                            <button
                              onClick={() => downloadFile(file.name)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Split Failed
                      </h3>
                      <p className="text-slate-600 mb-6">
                        {splitResult.error ||
                          "An error occurred while splitting the PDF"}
                      </p>
                      <button
                        onClick={() => setSplitResult(null)}
                        className="bg-slate-500 text-white px-6 py-3 rounded-xl hover:bg-slate-600 transition-all duration-200 font-semibold"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                {/* Split Button */}
                <button
                  onClick={splitPDF}
                  disabled={isSplitting}
                   className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-lg mb-6 flex items-center justify-center space-x-2"
                >
                  {isSplitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Scissors className="w-5 h-5" />
                  )}
                  <span>{isSplitting ? "Splitting PDF..." : "Split PDF"}</span>
                </button>

                {/* Configuration Panel */}
                <div className="space-y-6 mb-6">
                  <h3 className="font-semibold text-slate-800">
                    Split Configuration
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    {renderSplitConfiguration()}
                  </div>
                </div>

                {/* Upload Sources */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-slate-800">
                    Upload new file
                  </h3>
                  <button
                    onClick={() =>
                      document.getElementById("file-input-new")?.click()
                    }
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">
                        Select New File
                      </span>
                    </div>
                  </button>
                  <input
                    id="file-input-new"
                    type="file"
                    accept=".pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex space-x-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        How it works
                      </h4>
                      <p className="text-sm text-blue-800">
                        Choose your split method and configure the options. Your
                        PDF will be divided according to your specifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFSplitterApp;
