import React, { useEffect, useRef } from 'react';
import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';

interface RibbonsProps {
  colors?: string[];
  active?: boolean;           // 是否激活绘制
  cursor?: { x: number; y: number; isVisible?: boolean } | null; // 手势光标位置
  baseSpring?: number;
  baseFriction?: number;
  baseThickness?: number;
  offsetFactor?: number;
  pointCount?: number;
  speedMultiplier?: number;
  backgroundColor?: number[];
}

const DiscoRibbons: React.FC<RibbonsProps> = ({
  colors = ['#ff9346', '#7cff67', '#ffee51', '#5227FF'],
  active = false,
  cursor = null,
  baseSpring = 0.03,
  baseFriction = 0.9,
  baseThickness = 30,
  offsetFactor = 0.05,
  pointCount = 50,
  speedMultiplier = 0.6,
  backgroundColor = [0, 0, 0, 0]
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(cursor);
  const activeRef = useRef(active);
  const frameCountRef = useRef(0);

  // 同步 refs 避免闭包问题
  useEffect(() => {
    cursorRef.current = cursor;
    activeRef.current = active;
  }, [cursor, active]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    const gl = renderer.gl;
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const scene = new Transform();
    const lines: any[] = [];
    const targetPos = new Vec3(0, 0, 0);

    const vertex = `
      precision highp float;
      attribute vec3 position;
      attribute vec3 next;
      attribute vec3 prev;
      attribute vec2 uv;
      attribute float side;
      uniform vec2 uResolution;
      uniform float uDPR;
      uniform float uThickness;
      varying vec2 vUV;
      
      vec4 getPosition() {
          vec4 current = vec4(position, 1.0);
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 nextScreen = next.xy * aspect;
          vec2 prevScreen = prev.xy * aspect;
          vec2 tangent = normalize(nextScreen - prevScreen);
          vec2 normal = vec2(-tangent.y, tangent.x);
          normal /= aspect;
          normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
          float dist = length(nextScreen - prevScreen);
          normal *= smoothstep(0.0, 0.02, dist);
          float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
          float pixelWidth = current.w * pixelWidthRatio;
          normal *= pixelWidth * uThickness;
          current.xy -= normal * side;
          return current;
      }
      
      void main() {
          vUV = uv;
          gl_Position = getPosition();
      }
    `;

    const fragment = `
      precision highp float;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUV;
      
      void main() {
          float alpha = uOpacity * (1.0 - smoothstep(0.0, 1.0, vUV.y));
          gl_FragColor = vec4(uColor, alpha);
      }
    `;

    const center = (colors.length - 1) / 2;
    colors.forEach((color, index) => {
      const line = {
        spring: baseSpring + (Math.random() - 0.5) * 0.02,
        friction: baseFriction + (Math.random() - 0.5) * 0.02,
        velocity: new Vec3(),
        offset: new Vec3(
          (index - center) * offsetFactor,
          (Math.random() - 0.5) * 0.1,
          0
        ),
        points: [] as Vec3[],
        polyline: null as any
      };

      const points: Vec3[] = [];
      for (let i = 0; i < pointCount; i++) {
        points.push(new Vec3(0, 0, 0));
      }
      line.points = points;

      line.polyline = new Polyline(gl, {
        points,
        vertex,
        fragment,
        uniforms: {
          uColor: { value: new Color(color) },
          uThickness: { value: baseThickness + Math.random() * 5 },
          uOpacity: { value: 0.8 }
        }
      });
      line.polyline.mesh.setParent(scene);
      lines.push(line);
    });

    const resize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      lines.forEach(line => line.polyline.resize());
    };
    window.addEventListener('resize', resize);
    resize();

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      frameCountRef.current++;

      // 更新目标位置（基于手势光标）
      if (cursorRef.current && cursorRef.current.isVisible !== false) {
        // 将 0-1 坐标转换为 WebGL -1 到 1
        targetPos.set(
          cursorRef.current.x * 2 - 1,
          -(cursorRef.current.y * 2 - 1),
          0
        );
      }

      lines.forEach((line) => {
        // 当 active 为 true 时跟随手势，否则缓慢回到中心或保持
        if (activeRef.current) {
          const tmp = new Vec3().copy(targetPos).add(line.offset).sub(line.points[0]);
          line.velocity.add(tmp.multiply(line.spring));
          line.velocity.multiply(line.friction);
          line.points[0].add(line.velocity);
        } else {
          // 非激活状态缓慢回到中心
          line.points[0].lerp(new Vec3(0, 0, 0), 0.05);
          for (let k = 1; k < line.points.length; k++) {
            line.points[k].lerp(line.points[k - 1], 0.1);
          }
        }

        // 延迟跟随效果（画笔画迹）
        if (activeRef.current) {
          for (let k = 1; k < line.points.length; k++) {
            const delay = 20 * speedMultiplier;
            const alpha = Math.min(1, 16 / delay);
            line.points[k].lerp(line.points[k - 1], alpha);
          }
        }

        line.polyline.updateGeometry();
      });

      renderer.render({ scene });
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [colors, baseSpring, baseFriction, baseThickness, offsetFactor, pointCount, speedMultiplier, backgroundColor]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default DiscoRibbons;