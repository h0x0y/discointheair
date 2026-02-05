// src/hooks/useScreenRecorder.ts
import { useRef, useCallback } from 'react';
import { useGestureState } from '@/core/GestureState';

export const useScreenRecorder = () => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const setRecording = useGestureState((state) => state.setRecording);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60 },
        audio: true
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getAudioTracks().forEach(track => stream.addTrack(track));

      streamRef.current = stream;
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      chunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.start();
      setRecording(true);

      stream.getVideoTracks()[0].onended = () => {
        mediaRecorder.current?.stop();
      };
    } catch (err) {
      console.error('录制失败:', err);
    }
  }, [setRecording]);

  const stopRecording = useCallback(() => {
    return new Promise<Blob>((resolve) => {
      if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
        resolve(new Blob());
        return;
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        resolve(blob);
        streamRef.current?.getTracks().forEach(track => track.stop());
        setRecording(false);
      };

      mediaRecorder.current.stop();
    });
  }, [setRecording]);

  return { startRecording, stopRecording };
};