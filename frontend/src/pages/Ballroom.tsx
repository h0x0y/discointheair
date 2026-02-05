// src/pages/Ballroom.tsx
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DiscoRibbons from '@/components/animation/DiscoRibbons';
import DiscoSplash from '@/components/animation/DiscoSplash';
import { useGlobalGesture } from '@/hooks/useGlobalGesture';
import { useScreenRecorder } from '@/hooks/useScreenRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useGestureState } from '@/core/GestureState';
import type { Track} from '@/utils/types';

const BackgroundLayer = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30 pointer-events-none" />
));

const Ballroom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lastGesture } = useGlobalGesture();
  const { startRecording, stopRecording } = useScreenRecorder();
  
  const cursor = useGestureState((state) => state.cursor);
  const cameraActive = useGestureState((state) => state.cameraActive);
  const setRecordingTime = useGestureState((state) => state.setRecordingTime);
  
  const locationState = location.state as { 
    track?: Track & { image?: string }; 
    audioUrl?: string 
  } | undefined;
  
  const rawTrack = locationState?.track;
  const track: Track | null = rawTrack ? {
    id: rawTrack.id || 'unknown',
    title: rawTrack.title || 'Unknown Track',
    artist: rawTrack.artist || rawTrack.description || 'Unknown Artist',
    url: rawTrack.url?.startsWith('http') 
      ? rawTrack.url 
      : `http://localhost:8000${rawTrack.url}`,
    cover: rawTrack.cover || rawTrack.image || '',
    description: rawTrack.description
  } : null;

  const { play, pause, isPlaying, progress } = useAudioPlayer(track || undefined);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [ribbonsActive, setRibbonsActive] = useState(false);
  const [splashPulse, setSplashPulse] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('准备就绪');
  const [lastHand, setLastHand] = useState<string>('无');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStartedRef = useRef(false);
  const performanceStartedRef = useRef(false);

  // 🔧 修复：确保手势检测和动画显示逻辑正确
  useEffect(() => {
    if (!cursor.isVisible) {
      setRibbonsActive(false);
      setDebugInfo('等待手势...');
      return;
    }

    // 更新最后检测到的手
    setLastHand(cursor.handType);
    setDebugInfo(`检测到手: ${cursor.handType} | 位置: (${cursor.x.toFixed(2)}, ${cursor.y.toFixed(2)})`);

    // 左手控制 Ribbons（实时跟随）
    if (cursor.handType === 'left') {
      setRibbonsActive(true);
    } else {
      setRibbonsActive(false);
    }
  }, [cursor]);

  // 🔧 修复：右手手势触发 Splash，左手不触发任何手势动画
  useEffect(() => {
    if (!lastGesture?.type || lastGesture.type === 'none') return;
    
    console.log('检测到手势:', lastGesture.type, '来自:', lastGesture.hand);
    
    // 🔧 明确禁止左手触发任何手势（包括返回）
    if (lastGesture.hand === 'left') {
      console.log('左手手势，忽略');
      return;
    }

    // 只有右手可以触发
    if (lastGesture.hand === 'right') {
      // 右手拳变掌或右挥触发 Splash
      if (lastGesture.type === 'fist_to_palm' || lastGesture.type === 'wave_right') {
        console.log('✅ 右手触发 Splash');
        setSplashPulse(prev => prev + 1);
      }
      
      // 🔧 右手左挥返回（保留右手返回功能，删除左手返回）
      if (lastGesture.type === 'wave_left') {
        console.log('👋 右手挥手返回');
        handleBack();
      }
    }
  }, [lastGesture]);

  const endPerformance = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      pause();
      await stopRecording();
      setShowSaveDialog(true);
      performanceStartedRef.current = false;
    } catch (err) {
      console.error('Stop failed:', err);
    }
  }, [pause, stopRecording]);

  const handleBack = useCallback(() => {
    pause();
    navigate('/turntable');
  }, [navigate, pause]);

  const startPerformance = useCallback(async () => {
    if (!track?.url || performanceStartedRef.current) return;
    
    performanceStartedRef.current = true;
    console.log('🎵 开始表演！');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await startRecording();
      const success = await play();
      
      if (success) {
        let seconds = 0;
        timerRef.current = setInterval(() => {
          seconds++;
          setRecordingTime(seconds);
        }, 1000);
      } else {
        await stopRecording();
        performanceStartedRef.current = false;
      }
    } catch (err) {
      console.error('Start failed:', err);
      await stopRecording().catch(() => {});
      performanceStartedRef.current = false;
    }
  }, [track?.url, play, startRecording, stopRecording, setRecordingTime]);

  const startCountdown = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    setCountdown(3);
    let current = 3;
    
    const interval = setInterval(() => {
      current -= 1;
      if (current >= 0) {
        setCountdown(current);
        if (current === 0) {
          startPerformance();
          setTimeout(() => setCountdown(null), 1000);
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }, [startPerformance]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecording().catch(() => {});
    };
  }, [stopRecording]);

  useEffect(() => {
    if (progress >= 0.995 && isPlaying) {
      endPerformance();
    }
  }, [progress, isPlaying, endPerformance]);

  if (!track || !track.url) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p>请先选择唱片</p>
          <button onClick={() => navigate('/turntable')} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            去唱片机
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden"
      onClick={countdown === null && !hasStartedRef.current ? startCountdown : undefined}
    >
      <BackgroundLayer />
      
      {/* 🔧 动画层 - 始终渲染，避免切换导致的闪烁 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 左手绘画：Ribbons - active 控制是否跟随 */}
        <DiscoRibbons 
          active={ribbonsActive} 
          cursor={cursor}
        />
        
        {/* 右手爆发：Splash - 使用 key 强制刷新 */}
        <DiscoSplash 
          key={`splash-${splashPulse}`}
          trigger={splashPulse > 0}  // 🔧 修复：确保 trigger 为 true 时触发
          intensity={0.7}
          cursor={cursor}
        />
      </div>

      {/* 倒计时显示 */}
      {countdown !== null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40">
          <div className={`text-9xl font-bold text-white drop-shadow-lg ${countdown === 0 ? 'text-green-400 animate-ping' : ''}`}>
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      )}

      {/* 点击开始提示 */}
      {!hasStartedRef.current && countdown === null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 cursor-pointer">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4">点击屏幕开始</div>
            <div className="text-white/60">{track.title} - {track.artist}</div>
          </div>
        </div>
      )}

      {/* 顶部栏 */}
      <div className="absolute top-0 left-0 right-0 z-40 p-6 flex justify-between items-start pointer-events-none">
        <button 
          onClick={handleBack}
          className="pointer-events-auto px-4 py-2 bg-black/50 border border-white/30 rounded-full text-white text-sm hover:bg-white/20"
        >
          ← 返回
        </button>

        <div className="flex flex-col items-center bg-black/40 px-4 py-2 rounded-xl border border-white/10">
          {track.cover ? (
            <div className={`w-12 h-12 rounded-full overflow-hidden ${isPlaying ? 'animate-spin' : ''}`}>
              <img src={track.cover.startsWith('http') ? track.cover : `http://localhost:8000${track.cover}`} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">🎵</div>
          )}
          <h2 className="text-white font-bold text-sm mt-1">{track.title}</h2>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs border ${cameraActive ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {cameraActive ? '📹' : '❌'}
        </div>
      </div>

      {/* 调试信息 - 显示详细状态 */}
      <div className="absolute bottom-4 left-4 z-40 bg-black/80 text-green-400 px-4 py-3 rounded text-xs font-mono space-y-1 border border-green-500/30">
        <div>{debugInfo}</div>
        <div className="text-yellow-400">Ribbons: {ribbonsActive ? '✅ 激活' : '❌ 未激活'} ({lastHand})</div>
        <div className="text-blue-400">Splash脉冲: {splashPulse}</div>
      </div>

      {/* 手势提示 */}
      {hasStartedRef.current && (
        <div className="absolute bottom-4 right-4 z-40 text-white/50 text-xs text-right space-y-1">
          <p>👈 左手：绘画彩带</p>
          <p>👉 右拳变掌：粒子爆发</p>
          <p>👉 左挥：返回</p>
        </div>
      )}

      {/* 结束按钮 */}
      {isPlaying && (
        <button 
          onClick={endPerformance}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-40 px-4 py-3 bg-red-500/80 hover:bg-red-500 rounded-full text-white font-bold text-sm"
        >
          ⏹ 结束
        </button>
      )}

      {/* 保存对话框 */}
      {showSaveDialog && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 pointer-events-auto">
          <div className="bg-gray-900 p-8 rounded-2xl border border-purple-500/30 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-4">🎉 表演结束！</h3>
            <div className="flex gap-4">
              <button onClick={() => navigate('/collection')} className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-lg text-white font-bold">
                ⭐ 收藏
              </button>
              <button onClick={() => setShowSaveDialog(false)} className="flex-1 px-6 py-3 bg-gray-700 rounded-lg text-white">
                放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ballroom;