// types/dfp.ts;
export interface UploadedFile {
  fileId: string;
  originalName: string;
  size: number;
  path: string;
}

export interface PDFFile extends UploadedFile {
  id: string; // For frontend tracking
  status: "uploading" | "uploaded" | "error";
  progress?: number;
  error?: string;
}

export interface MergeRequest {
  fileIds: string[];
  outputName?: string;
}

export interface MergeResponse {
  message: string;
  outputFileName: string;
  downloadUrl: string;
}
