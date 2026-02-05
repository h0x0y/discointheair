import type { FC } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DotGrid from "@/components/animation/DotGrid.tsx";
import Orb from "@/components/animation/Orb.tsx";

// 封面组件：修复 DotGrid activeColor 不显示问题
const Cover: FC = () => {
  const navigate = useNavigate();


  const discoDotGridConfig = {
    dotSize: 2.5,
    gap: 25,
    baseColor: "#341b909c", 
    activeColor: "#e1d5f0", 
    proximity: 150,
    bgColor: "#000000", // 复古深紫黑底色
    baseColorOpacity: 0.4, // 单独配置基础色透明度（若 DotGrid 支持）
    activeColorOpacity: 1.0, 
  };

  const discoOrbs = [
    { id: 1, hue: 30, size: 120 },
    { id: 2, hue: 320, size: 180 },
    { id: 3, hue: 270, size: 90 },
    { id: 4, hue: 200, size: 200 },
    { id: 5, hue: 350, size: 150 },
    { id: 6, hue: 30, size: 110 },
    { id: 7, hue: 270, size: 170 },
    { id: 8, hue: 220, size: 130 },
    { id: 9, hue: 310, size: 160 },
    { id: 10, hue: 180, size: 140 },
    { id: 11, hue: 340, size: 100 },
  ];

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes discoFloat {
        0% { transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
        25% { transform: translate(-50%, -50%) translate(25px, -20px) scale(1.02); }
        50% { transform: translate(-50%, -50%) translate(0px, -35px) scale(1); }
        75% { transform: translate(-50%, -50%) translate(-25px, -20px) scale(0.98); }
        100% { transform: translate(-50%, -50%) translate(0px, 0px) scale(1); }
      }
      .orb-container {
        pointer-events: auto !important;
        transition: none;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <DotGrid
        dotSize={discoDotGridConfig.dotSize}
        gap={discoDotGridConfig.gap}
        baseColor={discoDotGridConfig.baseColor}
        activeColor={discoDotGridConfig.activeColor}
        proximity={discoDotGridConfig.proximity}

        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          background: discoDotGridConfig.bgColor,
        }}
      />

      {/* ===== 中层：OGL Orb 光球 ===== */}
      {discoOrbs.map((orb) => (
        <div
          key={orb.id}
          className="orb-container"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            position: "absolute",
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            transform: "translate(-50%, -50%)",
            animation: `discoFloat ${Math.random() * 30 + 20}s linear infinite`,
            zIndex: 1,
            pointerEvents: "auto",
            overflow: "visible",
          }}
        >
          <Orb
            hue={orb.hue}
            hoverIntensity={0.3}
            rotateOnHover={true}
            forceHoverState={false}
            backgroundColor={discoDotGridConfig.bgColor}
          />
        </div>
      ))}

      {/* ===== 上层：封面核心内容 ===== */}
      <div
        className="relative z-2 flex flex-col items-center justify-center h-full text-white"
        style={{ pointerEvents: "auto" }}
      >
        <h1 className="text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          Disco In The Air
        </h1>
        <p className="text-2xl mb-12 text-pink-200 tracking-wider">
          Join The Party
        </p>
        <button
          onClick={() => navigate("/navigation")}
          className="px-12 py-5 bg-gradient-to-r from-yellow-500 to-pink-600 rounded-full text-2xl font-semibold hover:opacity-90 transition-opacity drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]"
        >
          Enter The Ballroom
        </button>
      </div>
    </div>
  );
};

export default Cover;