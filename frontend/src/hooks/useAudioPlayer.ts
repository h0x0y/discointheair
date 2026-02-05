// src/hooks/useAudioPlayer.ts
import { useRef, useCallback, useState, useEffect } from 'react';
import type { Track } from '@/utils/types';

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  error: string | null;
  volume: number;
}

export const useAudioPlayer = (initialTrack?: Track) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 0,
    error: null,
    volume: 1.0
  });

  // 初始化或切换音轨
  useEffect(() => {
    if (!initialTrack?.url) return;

    console.log('🎵 加载音频:', initialTrack.url);
    
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = initialTrack.url;
    audio.volume = state.volume;
    
    // 添加时间戳防止缓存（如果需要从后端获取最新）
    // audio.src = `${initialTrack.url}?t=${Date.now()}`;
    
    audioRef.current = audio;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // 事件监听
    const handleCanPlay = () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        duration: audio.duration || 0 
      }));
    };
    
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setState(prev => ({ 
          ...prev, 
          progress: audio.currentTime / audio.duration 
        }));
      }
    };
    
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error('音频加载失败:', e);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isPlaying: false, 
        error: '音频加载失败，请检查网络或文件是否存在' 
      }));
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);
    
    // 清理
    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
      audioRef.current = null;
      playPromiseRef.current = null;
    };
  }, [initialTrack?.url, state.volume]);

  // 🔧 关键修复：安全的播放函数，处理自动播放限制
  const play = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current;
    if (!audio) {
      setState(prev => ({ ...prev, error: '音频未加载' }));
      return false;
    }

    // 如果已经在播放中，返回成功
    if (!audio.paused) return true;

    // 如果有正在进行的 play 操作，等待它完成
    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch (e) {
        // 忽略之前的错误
      }
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 🔧 关键：捕获自动播放限制错误
      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
      playPromiseRef.current = null;
      return true;
      
    } catch (err: any) {
      playPromiseRef.current = null;
      
      if (err.name === 'NotAllowedError') {
        // 浏览器阻止自动播放
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isPlaying: false,
          error: '浏览器阻止自动播放，请先点击屏幕任意位置' 
        }));
        console.warn('自动播放被阻止，需要用户交互');
      } else if (err.name === 'AbortError') {
        // play() 被中断（比如快速切换）
        setState(prev => ({ ...prev, isLoading: false }));
        console.warn('播放被中断');
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `播放失败: ${err.message}` 
        }));
      }
      return false;
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 🔧 关键：如果有正在进行的 play，先等待它完成再 pause，避免 AbortError
    if (playPromiseRef.current) {
      playPromiseRef.current.then(() => {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      }).catch(() => {
        audio.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      });
    } else {
      audio.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const seek = useCallback((progress: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = progress * audio.duration;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, vol));
    }
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, vol)) }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    audioRef,
    play,
    pause,
    seek,
    setVolume,
    clearError
  };
};