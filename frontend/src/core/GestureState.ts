// src/core/GestureState.ts
import { create } from 'zustand';
import type { Cursor, GestureEvent, Track } from '@/utils/types';

interface State {
  cursor: Cursor;
  lastGesture: GestureEvent | null;
  cameraActive: boolean;
  videoElement: HTMLVideoElement | null;
  isRecording: boolean;
  recordingTime: number;
  currentTrack: Track | null;
  updateCursor: (cursor: Partial<Cursor>) => void;
  triggerGesture: (gesture: GestureEvent) => void;
  setCameraActive: (active: boolean) => void;
  setVideoElement: (el: HTMLVideoElement | null) => void;
  setRecording: (recording: boolean) => void;
  setRecordingTime: (time: number) => void;
  setCurrentTrack: (track: Track | null) => void;
}

export const useGestureState = create<State>((set) => ({
  cursor: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    isPinching: false,
    pinchProgress: 0,
    isVisible: false,
    handType: 'none'
  },
  lastGesture: null,
  cameraActive: false,
  videoElement: null,
  isRecording: false,
  recordingTime: 0,
  currentTrack: null,
  
  updateCursor: (cursor) => set((state) => ({ 
    cursor: { ...state.cursor, ...cursor } 
    
  })),
  
  triggerGesture: (gesture) => set({ lastGesture: gesture }),
  setCameraActive: (active) => set({ cameraActive: active }),
  setVideoElement: (el) => set({ videoElement: el }),
  setRecording: (recording) => set({ isRecording: recording }),
  setRecordingTime: (time) => set({ recordingTime: time }),
  setCurrentTrack: (track) => set({ currentTrack: track })
}));