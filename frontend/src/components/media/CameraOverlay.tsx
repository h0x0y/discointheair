// src/components/media/CameraOverlay.tsx
import { useEffect, useRef } from 'react';
import { useGestureState } from '@/core/GestureState';
import  { motion } from 'framer-motion';

export const CameraOverlay = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const setVideoElement = useGestureState((state) => state.setVideoElement);
  const setCameraActive = useGestureState((state) => state.setCameraActive);
  const isRecording = useGestureState((state) => state.isRecording);
  const recordingTime = useGestureState((state) => state.recordingTime);
  const cursor = useGestureState((state) => state.cursor);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setVideoElement(videoRef.current);
          setCameraActive(true);
        }
      } catch (err) {
        console.error('摄像头错误:', err);
      }
    };
    init();
  }, [setVideoElement, setCameraActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 left-4 z-[100] w-48 h-36 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.4)] bg-black/90 backdrop-blur-md"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />
      
      <div className="absolute inset-0 pointer-events-none">
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600/90 px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] text-white font-mono">{formatTime(recordingTime)}</span>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] text-cyan-400 font-mono bg-black/60 px-2 py-1 rounded">
          <span className="flex items-center gap-1">
            {cursor.isVisible ? '🖐' : '✋'}
            {cursor.isVisible ? '已追踪' : '未检测'}
          </span>
          <span>{cursor.handType === 'left' ? 'L' : 'R'}</span>
        </div>

        {cursor.isVisible && cursor.pinchProgress > 0 && !cursor.isPinching && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg className="w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="#22d3ee" strokeWidth="3" 
                strokeDasharray={`${cursor.pinchProgress * 125} 125`} strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};