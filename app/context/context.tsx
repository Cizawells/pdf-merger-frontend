// app/context/UserContext.tsx
"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type UploadFile = {
  id: string;
  name: string;
  size: string;
  pages: number;
  file: File;
};

type FilesContextType = {
  files: UploadFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
};

const FilesContext = createContext<FilesContextType | undefined>(undefined);

export function FilesProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <FilesContext.Provider value={{ files, setFiles }}>
      {children}
    </FilesContext.Provider>
  );
}

export function useFilesContext() {
  const context = useContext(FilesContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
