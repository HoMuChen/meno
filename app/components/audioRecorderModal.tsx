import React, { useRef, useState } from "react";
import { uploadFile } from "../services/storage";
import { Button } from "./ui/button";

interface AudioRecorderModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess?: (url: string) => void;
}

export function AudioRecorderModal({ open, onClose, onUploadSuccess }: AudioRecorderModalProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!open) return null;

  const startRecording = async () => {
    setAudioBlob(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleUploadAudio = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const file = new File([audioBlob], `meeting-audio-${Date.now()}.webm`, { type: "audio/webm" });
      const url = await uploadFile(file, "meetings/" + file.name);
      if (onUploadSuccess) onUploadSuccess(url);
      onClose();
      setAudioBlob(null);
    } catch (e) {
      alert("Failed to upload audio");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Record Audio</h2>
        <div className="flex flex-col items-center gap-4">
          {!recording && (
            <Button onClick={startRecording} disabled={uploading} variant="default">
              Start Recording
            </Button>
          )}
          {recording && (
            <Button onClick={stopRecording} disabled={uploading} variant="destructive">
              Stop Recording
            </Button>
          )}
          {audioBlob && (
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
          )}
          <div className="flex gap-2 mt-4">
            <Button onClick={onClose} variant="secondary" disabled={uploading}>
              Cancel
            </Button>
            {audioBlob && (
              <Button onClick={handleUploadAudio} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 