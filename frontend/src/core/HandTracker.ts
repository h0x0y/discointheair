// src/core/HandTracker.ts
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useGestureState } from './GestureState';
import { CoordinateMapper } from './CoordinateMapper';
import { GestureDetector } from './GestureDetector';

export class HandTracker {
  private landmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private mapper: CoordinateMapper;
  private detector: GestureDetector;
  private rafId = 0;
  private isRunning = false;
  private lastProcessTime = 0;
  private frameInterval = 1000 / 30; // 🔧 限制 30fps，降低 CPU 占用
  private consecutiveErrors = 0;

  constructor() {
    this.mapper = new CoordinateMapper(window.innerWidth, window.innerHeight);
    this.detector = new GestureDetector();
    
    window.addEventListener('resize', () => {
      this.mapper.updateSize(window.innerWidth, window.innerHeight);
    });
  }

  async initialize() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      
      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      this.consecutiveErrors = 0;
    } catch (err) {
      console.error('HandTracker 初始化失败:', err);
      throw err;
    }
  }

  start(videoElement: HTMLVideoElement) {
    if (this.isRunning) {
      console.log('HandTracker 已在运行');
      return;
    }
    this.video = videoElement;
    this.isRunning = true;
    this.consecutiveErrors = 0;
    this.loop();
    console.log('✅ HandTracker 已启动');
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    console.log('⏹️ HandTracker 已停止');
  }

  private loop = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    
    // 🔧 节流：控制处理频率
    if (now - this.lastProcessTime < this.frameInterval) {
      this.rafId = requestAnimationFrame(this.loop);
      return;
    }
    
    this.lastProcessTime = now;

    // 🔧 关键：添加 try-catch 防止异常中断循环
    try {
      if (!this.video || !this.landmarker) {
        this.rafId = requestAnimationFrame(this.loop);
        return;
      }

      if (this.video.currentTime > 0 && this.video.readyState >= 2) {
        const results = this.landmarker.detectForVideo(this.video, now);
        
        if (results.landmarks?.length > 0) {
          this.processHand(results.landmarks[0], results.handednesses[0]);
          this.consecutiveErrors = 0; // 成功时重置错误计数
        } else {
          useGestureState.getState().updateCursor({ isVisible: false });
        }
      }
    } catch (err) {
      this.consecutiveErrors++;
      console.error(`HandTracker 检测错误 (${this.consecutiveErrors}/10):`, err);
      
      // 连续错误 10 次后自动停止，避免死循环
      if (this.consecutiveErrors > 10) {
        console.error('连续错误次数过多，停止检测');
        this.stop();
        // 尝试重新初始化（可选）
        setTimeout(() => {
          if (this.video) this.start(this.video);
        }, 1000);
        return;
      }
    }

    this.rafId = requestAnimationFrame(this.loop);
  };

  private processHand(landmarks: any[], handedness: any[]) {
    const { updateCursor, triggerGesture } = useGestureState.getState();
    
    const indexTip = this.mapper.map(landmarks[8]);
    const pinchDist = this.mapper.distance(landmarks[4], landmarks[8]);
    const isPinching = pinchDist < 0.05;
    const pinchProgress = Math.min(1, Math.max(0, (0.08 - pinchDist) / 0.03));
    
    const gesture = this.detector.detect(landmarks, handedness);
    if (gesture.type !== 'none') {
      triggerGesture({
        type: gesture.type,
        intensity: gesture.intensity,
        timestamp: Date.now(),
        hand: gesture.hand
      });
    }

    updateCursor({
      x: indexTip.x,
      y: indexTip.y,
      isPinching,
      pinchProgress,
      isVisible: true,
      handType: handedness[0]?.categoryName.toLowerCase() || 'right'
    });
  }
}