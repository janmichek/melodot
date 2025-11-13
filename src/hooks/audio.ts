// @ts-check

import {useCallback, useRef, useState} from "react";

/** @typedef {import("../types/index.js").AudioRecorderState} AudioRecorderState */

export const useAudioRecorder = () => {
  /** @type {[AudioRecorderState, (updater: (prev: AudioRecorderState) => AudioRecorderState) => void]} */
  const [state, setState] = useState({
    mediaRecorder: null,
    audioBlob: null,
    permission: false,
    errorMessage: null,
    isRecording: false,
  });
  const audioChunksRef = useRef(/** @type {Blob[]} */([]));
  const mediaRecorderRef = useRef(/** @type {MediaRecorder|null} */(null));

  const enablePermission = useCallback(async () => {
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
        setState((prev) => ({ ...prev, isRecording: true }));
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
        }));
      };

      mediaRecorderRef.current = mediaRecorder;
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
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'inactive') {
      audioChunksRef.current = []; // Clear audio chunks on start
      recorder.start();
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      audioChunksRef.current = []; // Clear audio chunks
      if (recorder.state === 'recording') {
        recorder.stop();
      }
      setState((prev) => ({
        ...prev,
        audioBlob: null,
        isRecording: false,
      }));
    }
  }, []);

  return {
    ...state,
    enablePermission,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
