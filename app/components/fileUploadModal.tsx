import React, { useRef, useState } from "react";
import { uploadFile } from "../services/storage";
import { Button } from "./ui/button";

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess?: (url: string) => void;
  accept?: string;
}

export function FileUploadModal({ open, onClose, onUploadSuccess, accept }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "meetings/" + file.name);
      if (onUploadSuccess) onUploadSuccess(url);
      onClose();
      setFile(null);
    } catch (e) {
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">Upload File</h2>
        <div className="flex flex-col items-center gap-4">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="flex gap-2 mt-4 w-full">
            <Button onClick={onClose} variant="secondary" disabled={uploading} className="flex-1 text-sm">
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1 text-sm">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 