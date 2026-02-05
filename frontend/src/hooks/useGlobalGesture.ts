// src/hooks/useGlobalGesture.ts
import { useGestureState } from '@/core/GestureState';

export const useGlobalGesture = () => {
  return {
    cursor: useGestureState((state) => state.cursor),
    lastGesture: useGestureState((state) => state.lastGesture),
    isRecording: useGestureState((state) => state.isRecording)
  };
};