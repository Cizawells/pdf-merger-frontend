"use client";

import {
  ArrowLeft,
  ChevronRight,
  Cloud,
  Download,
  FileText,
  FolderOpen,
  GripVertical,
  Info,
  Loader,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadFile, useFilesContext } from "../context/context";
import Header from "@/components/ui/header";

interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview?: string;
}

const MergePDFPage = () => {
  const router = useRouter();
  const { files, setFiles, mergeResult, setMergeResult } = useFilesContext();
  let fileIds = files.map((file) => file.id);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  const handleFileUpload = (files: File[]) => {
    const pdfFiles = Array.from(files)
      .filter((file) => file.type === "application/pdf")
      .map((file, index) => ({
        id: Date.now().toString() + index,
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        pages: Math.floor(Math.random() * 50) + 1,
      }));

    setFiles((prev: UploadFile[]) => [...prev, ...pdfFiles]);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setFiles((files: UploadFile[]) => files.filter((file) => file.id !== id));
  };

  const handleFileDragStart = (e: React.DragEvent, file: UploadFile) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleFileDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedFile) return;

    const dragIndex = files.findIndex((f) => f.id === draggedFile.id);
    if (dragIndex === dropIndex) return;

    const newFiles = [...files];
    const [removed] = newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, removed);

    setFiles(newFiles);
    setDraggedFile(null);
    setDragOverIndex(null);
  };

  const handleMerge = () => {
    console.log("Merging files:", uploadedFiles);
    // In a real app, this would trigger the merge process
  };

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
      router.push(`/download/${mergeResult.fileName!}`); // navigate to /dashboard
      debugger;
      setMergeResult({
        success: true,
        downloadUrl: mergeResult.downloadUrl,
        fileName: mergeResult.fileName,
        message: "PDFs merged successfully",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Header title="PDF Merge" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {files.length === 0 ? (
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
                    {files.length} files selected
                  </span>
                </div>

                {/* File List */}
                <div className="space-y-3">
                  {files.map((file, index) => (
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
                  onClick={mergePDFs}
                  disabled={isMerging}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-lg mb-6 flex items-center justify-center space-x-2"
                >
                  {isMerging ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}

                  <span>{isMerging ? "Merging PDFs" : "Merge PDFs"}</span>
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
