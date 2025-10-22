import { useState, useCallback, useRef } from "react";

interface AudioRecorderState {
  mediaRecorder: MediaRecorder | null;
  audioBlob: Blob | null;
  permission: boolean;
  errorMessage: string | null;
  isRecording: boolean;
  isPaused: boolean;
}

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    mediaRecorder: null,
    audioBlob: null,
    permission: false,
    errorMessage: null,
    isRecording: false,
    isPaused: false,
  });
  const audioChunksRef = useRef<Blob[]>([]);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
        video: false,
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/ogg",
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.onstart = () => {
        setState((prev) => ({ ...prev, isRecording: true, isPaused: false }));
      };

      mediaRecorder.onresume = () => {
        setState((prev) => ({ ...prev, isPaused: false }));
      };

      mediaRecorder.onpause = () => {
        setState((prev) => ({ ...prev, isPaused: true }));
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/ogg",
        });
        setState((prev) => ({
          ...prev,
          audioBlob,
          isRecording: false,
          isPaused: false,
        }));
      };

      setState((prev) => ({
        ...prev,
        mediaRecorder,
        permission: true,
        errorMessage: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        permission: false,
        errorMessage: "Microphone permission denied",
      }));
      console.error("Error accessing microphone:", error);
    }
  }, []);
  const startRecording = useCallback(() => {
    if (state.mediaRecorder && !state.isRecording) {
      audioChunksRef.current = []; // Clear audio chunks on start
      state.mediaRecorder.start();
      setState((prev) => ({ ...prev, isRecording: true, isPaused: false }));
    }
  }, [state.mediaRecorder, state.isRecording]);

  const stopRecording = useCallback(() => {
    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop();
      setState((prev) => ({ ...prev, isRecording: false, isPaused: false }));
    }
  }, [state.mediaRecorder, state.isRecording]);

  const resumeRecording = useCallback(() => {
    if (state.mediaRecorder && state.isPaused) {
      state.mediaRecorder.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.mediaRecorder, state.isPaused]);

  const pauseRecording = useCallback(() => {
    if (state.mediaRecorder && state.isRecording && !state.isPaused) {
      state.mediaRecorder.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.mediaRecorder, state.isRecording, state.isPaused]);

  const resetRecording = useCallback(() => {
    if (state.mediaRecorder) {
      audioChunksRef.current = []; // Clear audio chunks
      state.mediaRecorder.stop();
      setState((prev) => ({
        ...prev,
        audioBlob: null,
        isRecording: false,
        isPaused: false,
      }));
    }
  }, [state.mediaRecorder]);

  return {
    ...state,
    requestPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
};
