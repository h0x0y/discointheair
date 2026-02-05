// src/hooks/useHover.ts
import { useRef, useEffect, useState } from 'react';
import { useGestureState } from '@/core/GestureState';

interface UseHoverReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isHovered: boolean;
  isPinching: boolean;
  pinchProgress: number;
}

export const useHover = (onTrigger?: () => void): UseHoverReturn => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchProgress, setPinchProgress] = useState(0);
  
  // 🔧 关键：使用 ref 保存回调和之前的状态，避免依赖变化导致重置
  const onTriggerRef = useRef(onTrigger);
  const prevPinchingRef = useRef(false);
  const hasTriggeredRef = useRef(false); // 防止单次捏合重复触发
  
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    let animationId: number;
    
    const checkHover = () => {
      const cursor = useGestureState.getState().cursor;
      
      if (!ref.current) {
        animationId = requestAnimationFrame(checkHover);
        return;
      }

      if (!cursor.isVisible) {
        setIsHovered(false);
        setIsPinching(false);
        prevPinchingRef.current = false;
        animationId = requestAnimationFrame(checkHover);
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const padding = 40;
      
      // 坐标转换（支持归一化和像素）
      let cursorX = cursor.x;
      let cursorY = cursor.y;
      
      const isNormalized = cursor.x >= 0 && cursor.x <= 1.01 && 
                           cursor.y >= 0 && cursor.y <= 1.01;
      
      if (isNormalized) {
        cursorX = cursor.x * window.innerWidth;
        cursorY = cursor.y * window.innerHeight;
      }

      const hit = 
        cursorX >= (rect.left - padding) && 
        cursorX <= (rect.right + padding) && 
        cursorY >= (rect.top - padding) && 
        cursorY <= (rect.bottom + padding);

      setIsHovered(hit);
      
      const currentlyPinching = hit && cursor.isPinching;
      setIsPinching(currentlyPinching);
      setPinchProgress(cursor.pinchProgress);

      // 🔧 关键修复：只在进入捏合瞬间触发一次，且需要松开手后才能再次触发
      if (hit && cursor.isPinching && !prevPinchingRef.current && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onTriggerRef.current?.();
      }
      
      // 当松开捏合时，重置触发标志
      if (!cursor.isPinching) {
        hasTriggeredRef.current = false;
      }
      
      prevPinchingRef.current = cursor.isPinching;
      animationId = requestAnimationFrame(checkHover);
    };

    animationId = requestAnimationFrame(checkHover);
    
    return () => cancelAnimationFrame(animationId);
  }, []); // 🔧 空依赖数组，确保只初始化一次

  return { ref, isHovered, isPinching, pinchProgress };
};