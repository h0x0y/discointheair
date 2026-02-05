import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EtherProps {
  intensity?: number;       // 流动强度 0-1
  cursor?: { x: number; y: number } | null;
  colors?: string[];
}

const DiscoEther: React.FC<EtherProps> = ({
  intensity = 0.3,
  cursor = null,
  colors = ['#5227FF', '#FF9FFC', '#B19EEF']
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const intensityRef = useRef(intensity);
  const cursorRef = useRef(cursor);

  useEffect(() => {
    intensityRef.current = intensity;
    cursorRef.current = cursor;
  }, [intensity, cursor]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uCursor: { value: new THREE.Vector2(0.5, 0.5) },
        uColor1: { value: new THREE.Color(colors[0]) },
        uColor2: { value: new THREE.Color(colors[1]) },
        uColor3: { value: new THREE.Color(colors[2]) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform vec2 uCursor;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          
          // 基于噪声的流体效果
          float t = uTime * (0.5 + uIntensity);
          
          // 多层正弦波模拟流体
          float wave1 = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 + t * 0.5);
          float wave2 = sin(uv.y * 4.0 - t * 0.7) * cos(uv.x * 3.0 + t);
          float noise = (wave1 + wave2) * 0.5 + 0.5;
          
          // 光标影响
          float dist = distance(uv, uCursor);
          float cursorEffect = smoothstep(0.5, 0.0, dist) * uIntensity;
          
          // 混合颜色
          vec3 color = mix(uColor1, uColor2, noise);
          color = mix(color, uColor3, cursorEffect);
          
          // 根据强度调整透明度
          float alpha = (0.2 + cursorEffect * 0.4) * (0.5 + uIntensity * 0.5);
          
          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `,
      transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      material.uniforms.uTime.value += 0.01;
      material.uniforms.uIntensity.value = intensityRef.current;
      
      if (cursorRef.current) {
        material.uniforms.uCursor.value.set(
          cursorRef.current.x,
          1.0 - cursorRef.current.y
        );
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [colors]);

  return (
    <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />
  );
};

export default DiscoEther;