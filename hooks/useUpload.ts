"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PDFFile } from "@/types/pdf";
import { pdfApi } from "@/lib/api";
import { generateId } from "@/lib/utils";

export function useUpload() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const addFiles = useCallback(async (newFiles: File[]) => {
    setIsUploading(true);

    // Create PDFFile objects with uploading status
    const pdfFiles: PDFFile[] = newFiles.map((file) => ({
      id: generateId(),
      fileId: "", // Will be set after upload
      originalName: file.name,
      size: file.size,
      path: "",
      status: "uploading",
      progress: 0,
    }));

    // Add files to state immediately
    setFiles((prev) => [...prev, ...pdfFiles]);

    // Upload files one by one
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const pdfFile = pdfFiles[i];

      try {
        const uploadedFile = await pdfApi.uploadPDF(file, (progress) => {
          // Update progress
          setFiles((prev) =>
            prev.map((f) => (f.id === pdfFile.id ? { ...f, progress } : f))
          );
        });

        // Update file with upload result
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pdfFile.id
              ? {
                  ...f,
                  fileId: uploadedFile.fileId,
                  path: uploadedFile.path,
                  status: "uploaded",
                  progress: 100,
                }
              : f
          )
        );

        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error("Upload error:", error);

        // Update file with error status
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pdfFile.id
              ? {
                  ...f,
                  status: "error",
                  error: "Upload failed",
                }
              : f
          )
        );

        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const reorderFiles = useCallback((startIndex: number, endIndex: number) => {
    setFiles((prev) => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const mergePDFs = useCallback(
    async (outputName?: string) => {
      const uploadedFiles = files.filter((f) => f.status === "uploaded");

      if (uploadedFiles.length < 2) {
        toast.error("Please upload at least 2 PDF files");
        return null;
      }

      setIsMerging(true);

      try {
        const result = await pdfApi.mergePDFs({
          fileIds: uploadedFiles.map((f) => f.fileId),
          outputName,
        });

        toast.success("PDFs merged successfully!");
        return result;
      } catch (error) {
        console.error("Merge error:", error);
        toast.error("Failed to merge PDFs");
        return null;
      } finally {
        setIsMerging(false);
      }
    },
    [files]
  );

  const downloadPDF = useCallback(
    async (fileName: string, displayName?: string) => {
      try {
        const blob = await pdfApi.downloadPDF(fileName);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = displayName || fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Download started!");
      } catch (error) {
        console.error("Download error:", error);
        toast.error("Failed to download PDF");
      }
    },
    []
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const uploadedFiles = files.filter((f) => f.status === "uploaded");
  const hasUploadedFiles = uploadedFiles.length > 0;
  const canMerge = uploadedFiles.length >= 2;

  return {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    mergePDFs,
    downloadPDF,
    clearFiles,
    isUploading,
    isMerging,
    hasUploadedFiles,
    canMerge,
    uploadedCount: uploadedFiles.length,
  };
}
