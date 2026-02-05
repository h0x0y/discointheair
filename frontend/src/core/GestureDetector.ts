// src/core/GestureDetector.ts
import type { GestureType, HandType } from '@/utils/types';

export class GestureDetector {
  private history: { x: number; y: number; time: number }[] = [];
  private lastFistState = false;
  private lastFistTime = 0;
  private lastGestureTime = 0;
  private gestureCooldown = 300; // 手势冷却时间，防止重复触发

  detect(landmarks: any[], handedness: any[]): { type: GestureType; intensity: number; hand: HandType } {
    const now = Date.now();
    
    // 冷却检查
    if (now - this.lastGestureTime < this.gestureCooldown) {
      return { type: 'none', intensity: 0, hand: this.getHandType(handedness) };
    }

    const palmCenter = landmarks[9];
    const extendedCount = this.countExtendedFingers(landmarks);
    const isFist = extendedCount === 0;
    const isPalm = extendedCount >= 4; // 🔧 放宽条件：4-5 个手指都算掌

    // 🔧 拳变掌检测：时间窗口放宽到 800ms，且增加调试日志
    if (this.lastFistState && isPalm && (now - this.lastFistTime < 800)) {
      console.log('✊→🖐 检测到拳变掌！');
      this.lastFistState = false;
      this.lastGestureTime = now;
      return {
        type: 'fist_to_palm',
        intensity: 1,
        hand: this.getHandType(handedness)
      };
    }

    if (isFist) {
      this.lastFistState = true;
      this.lastFistTime = now;
    } else if (!isPalm) {
      // 如果不是拳也不是掌，重置 fist 状态（避免误触发）
      this.lastFistState = false;
    }

    // 🔧 挥手检测：使用速度阈值，且需要最小位移
    this.history.push({ x: palmCenter.x, y: palmCenter.y, time: now });
    this.history = this.history.filter(h => now - h.time < 600); // 600ms 窗口

    if (this.history.length >= 3) {
      const start = this.history[0];
      const end = this.history[this.history.length - 1];
      const deltaX = end.x - start.x;
      const deltaTime = end.time - start.time;
      
      // 计算速度（归一化坐标/秒）
      const velocity = Math.abs(deltaX) / (deltaTime / 1000);
      
      // 🔧 降低速度阈值，增加最小位移要求
      if (velocity > 0.3 && Math.abs(deltaX) > 0.15) {
        console.log(`👋 检测到挥手: ${deltaX > 0 ? '右' : '左'}, 速度: ${velocity.toFixed(2)}`);
        this.history = []; // 清空历史
        this.lastGestureTime = now;
        return {
          type: deltaX > 0 ? 'wave_right' : 'wave_left',
          intensity: Math.min(velocity, 1),
          hand: this.getHandType(handedness)
        };
      }
    }

    // 🔧 手指滑动检测（用于 Ribbon 动画）
    // 检测单个食指移动（其他手指弯曲）
    if (this.isFingerSlide(landmarks)) {
      console.log('👆 检测到手指滑动');
      this.lastGestureTime = now;
      return {
        type: 'finger_slide',
        intensity: 0.8,
        hand: this.getHandType(handedness)
      };
    }

    // 🔧 手掌滑动检测（用于 Ether 动画）
    if (isPalm && this.history.length >= 2) {
      const recent = this.history.slice(-2);
      const moveDist = Math.sqrt(
        Math.pow(recent[1].x - recent[0].x, 2) + 
        Math.pow(recent[1].y - recent[0].y, 2)
      );
      if (moveDist > 0.05) {
        return { type: 'palm_slide', intensity: 0.6, hand: this.getHandType(handedness) };
      }
    }

    return {
      type: 'none',
      intensity: 0,
      hand: this.getHandType(handedness)
    };
  }

  private countExtendedFingers(landmarks: any[]): number {
    let count = 0;
    
    // 🔧 改进：计算指尖到手腕的距离 vs 关节到手腕的距离
    const wrist = landmarks[0];
    
    const fingers = [
      { tip: 8, pip: 6 },    // 食指
      { tip: 12, pip: 10 },  // 中指
      { tip: 16, pip: 14 },  // 无名指
      { tip: 20, pip: 18 }   // 小指
    ];

    fingers.forEach(({ tip, pip }) => {
      const tipDist = this.dist(landmarks[tip], wrist);
      const pipDist = this.dist(landmarks[pip], wrist);
      if (tipDist > pipDist * 1.2) count++; // 指尖明显比关节远
    });

    // 拇指检测：使用 x 距离（假设手是竖直的）
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const thumbMcp = landmarks[2];
    
    // 拇指是否伸直（指尖远离掌根）
    if (this.dist(thumbTip, thumbMcp) > this.dist(thumbIp, thumbMcp) * 1.3) {
      count++;
    }

    return count;
  }

  private isFingerSlide(landmarks: any[]): boolean {
    // 只有食指伸直，其他弯曲
    const indexExtended = this.isFingerExtended(landmarks, 8, 6);
    const middleExtended = this.isFingerExtended(landmarks, 12, 10);
    const ringExtended = this.isFingerExtended(landmarks, 16, 14);
    const pinkyExtended = this.isFingerExtended(landmarks, 20, 18);
    
    return indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
  }

  private isFingerExtended(landmarks: any[], tipIdx: number, pipIdx: number): boolean {
    const wrist = landmarks[0];
    const tipDist = this.dist(landmarks[tipIdx], wrist);
    const pipDist = this.dist(landmarks[pipIdx], wrist);
    return tipDist > pipDist * 1.2;
  }

  private dist(a: any, b: any): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private getHandType(handedness: any[]): HandType {
    if (!handedness || handedness.length === 0) return 'right';
    return handedness[0].categoryName.toLowerCase() as HandType;
  }
}