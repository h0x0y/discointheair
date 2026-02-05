import React, { useEffect, useRef, useCallback } from 'react';

interface SplashProps {
  trigger?: boolean;        // 触发爆发
  intensity?: number;       // 爆发强度 0-1
  cursor?: { x: number; y: number } | null; // 爆发位置
}

const DiscoSplash: React.FC<SplashProps> = ({
  trigger = false,
  intensity = 0.5,
  cursor = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
  }>>([]);
  const prevTriggerRef = useRef(false);

  // 创建爆发效果
  const createExplosion = useCallback((x: number, y: number, power: number) => {
    const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff'];
    const count = Math.floor(30 + power * 50); // 根据强度调整粒子数
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = (2 + Math.random() * 3) * power;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 1.0,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // 检测触发信号（上升沿）
      if (trigger && !prevTriggerRef.current) {
        const x = cursor ? cursor.x * width : width / 2;
        const y = cursor ? cursor.y * height : height / 2;
        createExplosion(x, y, intensity);
      }
      prevTriggerRef.current = trigger;

      // 清空画布（使用半透明实现拖尾效果）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // 更新和绘制粒子
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98; // 阻力
        p.vy *= 0.98;
        p.life -= 0.02;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        
        // 发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [trigger, intensity, cursor, createExplosion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default DiscoSplash;