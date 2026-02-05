// src/contexts/GlobalGestureProvider.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HandTracker } from '@/core/HandTracker';
import { useGestureState } from '@/core/GestureState';
import { CameraOverlay } from '@/components/media/CameraOverlay';
import { GlobalCursor } from '@/components/ui/GlobalCursor';

// 🔧 改为 ref 管理，避免模块级单例问题
const handTrackerRef = { current: new HandTracker() };

export const GlobalGestureProvider = ({ children }: { children: React.ReactNode }) => {
  const videoElement = useGestureState((state) => state.videoElement);
  const lastGesture = useGestureState((state) => state.lastGesture);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);

  // 初始化
  useEffect(() => {
    isMounted.current = true;
    
    handTrackerRef.current.initialize()
      .then(() => {
        if (isMounted.current) setReady(true);
      })
      .catch(err => {
        console.error('手势初始化失败:', err);
      });

    return () => {
      isMounted.current = false;
      // 🔧 关键：Provider 卸载时才停止，防止路由切换时误停
      // 但如果只是子页面切换，Provider 通常保持挂载，所以这里安全
      handTrackerRef.current.stop();
    };
  }, []);

  // 控制检测开关
  useEffect(() => {
    if (!ready || !videoElement) return;
    
    // 🔧 延迟启动，确保视频元素准备就绪
    const timer = setTimeout(() => {
      if (videoElement.readyState >= 2) {
        handTrackerRef.current.start(videoElement);
      } else {
        // 等待视频就绪
        const onLoaded = () => {
          handTrackerRef.current.start(videoElement);
          videoElement.removeEventListener('loadeddata', onLoaded);
        };
        videoElement.addEventListener('loadeddata', onLoaded);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // 🔧 不再在这里 stop，避免页面切换时中断
      // 只有 Provider 卸载时才 stop（在上面的 effect 中）
    };
  }, [ready, videoElement]);

  // 全局手势导航
  useEffect(() => {
    if (lastGesture?.type === 'wave_left' && location.pathname !== '/') {
      navigate(-1);
    }
  }, [lastGesture, navigate, location.pathname]);

  return (
    <>
      <CameraOverlay />
      <GlobalCursor />
      {children}
    </>
  );
};