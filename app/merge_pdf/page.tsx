"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Plus,
  ArrowLeft,
  GripVertical,
  X,
  Download,
  FolderOpen,
  Cloud,
  Settings,
  Info,
  ChevronRight,
} from "lucide-react";

const MergePDFPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleFileUpload = (files) => {
    const pdfFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );
    const newFiles = pdfFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      pages: Math.floor(Math.random() * 50) + 1, // Mock page count
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files);
  };

  const removeFile = (id) => {
    setUploadedFiles((files) => files.filter((file) => file.id !== id));
  };

  const handleFileDragStart = (e, file) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFileDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleFileDrop = (e, dropIndex) => {
    e.preventDefault();
    if (!draggedFile) return;

    const dragIndex = uploadedFiles.findIndex((f) => f.id === draggedFile.id);
    if (dragIndex === dropIndex) return;

    const newFiles = [...uploadedFiles];
    const [removed] = newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, removed);

    setUploadedFiles(newFiles);
    setDraggedFile(null);
    setDragOverIndex(null);
  };

  const handleMerge = () => {
    console.log("Merging files:", uploadedFiles);
    // In a real app, this would trigger the merge process
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">
                  Merge PDF
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
        {uploadedFiles.length === 0 ? (
          // Initial Upload State
          <div className="text-center">
            <div className="mb-8">
              {/* <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-white" />
              </div> */}
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Merge PDF Files
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                Combine multiple PDF documents into a single file. Select the
                files you want to merge, arrange them in the desired order, and
                create your merged PDF in seconds.
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
                  onChange={handleFileInputChange}
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
            {/* Files Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    PDF Files to Merge
                  </h2>
                  <span className="text-sm text-slate-600">
                    {uploadedFiles.length} files selected
                  </span>
                </div>

                {/* File List */}
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={file.id}
                      draggable
                      onDragStart={(e) => handleFileDragStart(e, file)}
                      onDragOver={(e) => handleFileDragOver(e, index)}
                      onDrop={(e) => handleFileDrop(e, index)}
                      className={`flex items-center p-4 bg-slate-50 rounded-xl border-2 transition-all cursor-move hover:bg-slate-100 ${
                        dragOverIndex === index
                          ? "border-blue-400 bg-blue-50"
                          : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <GripVertical className="w-5 h-5 text-slate-400" />
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 truncate max-w-xs">
                            {file.name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {file.size} • {file.pages} pages
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                          {index + 1}
                        </span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Files Button */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <button
                    onClick={() =>
                      document.getElementById("file-input-additional").click()
                    }
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Add more files</span>
                  </button>
                  <input
                    id="file-input-additional"
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
                {/* Merge Button */}
                <button
                  onClick={handleMerge}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-lg mb-6 flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Merge PDFs</span>
                </button>

                {/* Options */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-slate-800">
                    Merge Options
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        defaultChecked
                      />
                      <span className="text-sm text-slate-700">
                        Preserve bookmarks
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">
                        Add page numbers
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">
                        Optimize file size
                      </span>
                    </label>
                  </div>
                </div>

                {/* Upload Sources */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-slate-800">Add from</h3>
                  <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">
                        Google Drive
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Dropbox</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() =>
                      document.getElementById("file-input-additional").click()
                    }
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-700">
                        From Device
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
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
                        Drag and drop to reorder your files. The merged PDF will
                        combine all pages in the order shown.
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

export default MergePDFPage;
