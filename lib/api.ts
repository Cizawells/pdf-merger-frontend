import axios from "axios";
import { UploadedFile, MergeRequest, MergeResponse } from "@/types/pdf";

const API_BASE_URL = "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export const pdfApi = {
  // Upload a single PDF file (keep for backward compatibility)
  uploadPDF: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadedFile>(
      "/upload/pdf",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  },

  // NEW: Upload multiple PDF files at once
  uploadMultiplePDFs: async (
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<{
    message: string;
    files: UploadedFile[];
    totalFiles: number;
    totalSize: number;
  }> => {
    const formData = new FormData();

    // Append all files with the same field name 'files'
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post("/upload/pdfs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Merge multiple PDFs
  mergePDFs: async (request: MergeRequest): Promise<MergeResponse> => {
    const response = await apiClient.post<MergeResponse>("/merge", request);
    return response.data;
  },

  // Download merged PDF
  downloadPDF: async (fileName: string): Promise<Blob> => {
    const response = await apiClient.get(`/merge/download/${fileName}`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Get file info
  getFileInfo: async (fileName: string) => {
    const response = await apiClient.get(`/merge/info/${fileName}`);
    return response.data;
  },
};

export default apiClient;
