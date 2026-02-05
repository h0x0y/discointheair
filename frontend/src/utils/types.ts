// src/utils/types.ts
export type GestureType = 'wave_left' | 'wave_right' | 'fist_to_palm' | 'palm_slide' | 'finger_slide' | 'none';
export type HandType = 'left' | 'right' | 'none';

export interface Cursor {
  x: number;
  y: number;
  isPinching: boolean;
  pinchProgress: number;
  isVisible: boolean;
  handType: HandType;
}

export interface GestureEvent {
  type: GestureType;
  intensity: number;
  timestamp: number;
  hand: HandType;
}

export interface Track {
  id: string;
  title: string;
  description?: string;
  artist: string;
  cover?: string;
  url: string;
  
}

export interface CollectionItem {
  id: string;
  trackId: string;
  trackName: string;
  videoUrl: string;
  thumbnail: string;
  createdAt: string;
}

export interface DiscoState {
  cursor: Cursor;
  lastGesture: GestureEvent | null;
  cameraActive: boolean;
  videoElement: HTMLVideoElement | null;
  isRecording: boolean;
  recordingTime: number;
  currentTrack: Track | null;
}