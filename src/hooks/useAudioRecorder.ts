import { useCallback, useRef, useState } from "react";

export interface UseAudioRecorderOptions {
  mimeType?: string;
}

export interface UseAudioRecorderResult {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export const useAudioRecorder = (
  options?: UseAudioRecorderOptions
): UseAudioRecorderResult => {
  const mimeType = options?.mimeType ?? "audio/webm";
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) throw new Error("Microphone access denied.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    });

    mediaRecorder.start();
    setIsRecording(true);
  }, [hasPermission, mimeType, requestPermission]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const mediaRecorder = mediaRecorderRef.current;

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      return null;
    }

    return new Promise((resolve) => {
      mediaRecorder.addEventListener(
        "stop",
        () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          mediaRecorder.stream
            .getTracks()
            .forEach((track) => track.stop());
          mediaRecorderRef.current = null;
          chunksRef.current = [];
          setIsRecording(false);
          resolve(blob);
        },
        { once: true }
      );

      mediaRecorder.stop();
    });
  }, [mimeType]);

  return {
    isRecording,
    hasPermission,
    startRecording,
    stopRecording,
    requestPermission,
  };
};

