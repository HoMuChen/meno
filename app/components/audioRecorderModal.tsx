import React, { useRef, useState, useEffect } from "react";
import { uploadFile } from "../services/storage";
import { Button } from "./ui/button";
import { MicrophoneIcon } from "@heroicons/react/24/outline";

interface AudioRecorderModalProps {
  open: boolean;
  onClose: () => void;
  onUploadSuccess?: (url: string) => void;
}

export function AudioRecorderModal({ open, onClose, onUploadSuccess }: AudioRecorderModalProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [volume, setVolume] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!open) return null;

  const startRecording = async () => {
    setAudioBlob(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    // Set up audio analyzer
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);

    const updateVolume = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Get frequency data for visualization
      const bars = 8;
      const step = Math.floor(dataArray.length / bars);
      const newFrequencyData = [];
      for (let i = 0; i < bars; i++) {
        const start = i * step;
        const end = start + step;
        const slice = dataArray.slice(start, end);
        const average = slice.reduce((a, b) => a + b) / slice.length;
        newFrequencyData.push(average / 255); // Normalize to 0-1
      }
      setFrequencyData(newFrequencyData);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolume(average / 128); // Normalize to 0-1 range
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setFrequencyData([]);
      setVolume(0);
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

  const renderSoundWave = (side: 'left' | 'right') => {
    const bars = frequencyData.slice(0, 8);
    return (
      <div className={`flex items-end gap-1 h-16 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        {bars.map((height, index) => (
          <div
            key={index}
            className="bg-white/60 rounded-full transition-all duration-100"
            style={{
              width: '4px',
              height: `${Math.max(8, height * 64)}px`,
              opacity: recording ? 0.6 + height * 0.4 : 0.3,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">Record Audio</h2>
        <div className="flex flex-col items-center gap-4 md:gap-6">
          {recording && (
            <div className="flex items-center justify-center gap-4 md:gap-6 w-full py-6 md:py-8 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 rounded-lg">
              {renderSoundWave('left')}
              <div className="relative">
              <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, rgba(59, 130, 246, ${0.3 + volume * 0.7}) 0%, rgba(147, 51, 234, ${0.2 + volume * 0.5}) 50%, transparent 70%)`,
                    filter: 'blur(8px)',
                    transform: `scale(${1 + volume * 0.5})`,
                  }}
                />
                <div className="relative z-10 w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <MicrophoneIcon 
                    className="w-6 h-6 md:w-8 md:h-8 text-white"
                    style={{
                      filter: `drop-shadow(0 0 ${4 + volume * 8}px rgba(59, 130, 246, 0.8))`,
                    }}
              />
                </div>
              </div>
              {renderSoundWave('right')}
            </div>
          )}
          <div className="flex gap-2 w-full">
            {!recording ? (
              <>
                <Button onClick={startRecording} disabled={uploading} variant="default" className="flex-1 text-sm">
                  Start Recording
                </Button>
                <Button onClick={onClose} variant="secondary" disabled={uploading} className="flex-1 text-sm">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={stopRecording} disabled={uploading} variant="destructive" className="w-full text-sm">
                Stop Recording
              </Button>
            )}
          </div>
          {audioBlob && (
            <>
              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
              <div className="flex gap-2 w-full">
                <Button onClick={onClose} variant="secondary" disabled={uploading} className="flex-1 text-sm">
                  Cancel
                </Button>
                <Button onClick={handleUploadAudio} disabled={uploading} className="flex-1 text-sm">
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 