// src/pages/Navigation.tsx
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import PixelBlast from "@/components/animation/PixelBlast.tsx";

const Navigation: FC = () => {
  const navigate = useNavigate();

  // 适配高级感的 PixelBlast 参数：细腻、克制、低饱和
  const pixelBlastConfig = {
    colors: ["#000000", "#000000", "#303860", "#000000"], // 低饱和暗紫/蓝，契合高级感背景
    pixelSize: 2, // 更小像素，更细腻颗粒感
    blastForce: 8, // 弱化爆炸力度，避免杂乱
    autoBlast: true,
    autoBlastInterval: 3000, // 降低爆炸频率，更克制
    speed: 0.5, // 放缓动效，更优雅
    opacity: 0.9,
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#0f0f1f]">
      {/* 底层：细腻像素动效背景（克制不抢镜） */}
      <PixelBlast
        {...pixelBlastConfig}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* 上层：极简高级UI（留白充足+排版克制） */}
      <div className="relative z-10 flex flex-col items-center gap-12 px-6 max-w-sm">
        {/* 标题：极简排版+细腻阴影，无冗余装饰 */}
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-wider drop-shadow-[0_1px_4px_rgba(255,255,255,0.15)]">
          Navigation
        </h2>

        {/* 按钮容器：极简圆角+半透明+细微渐变 */}
        <div className="flex flex-col gap-4 w-full">
          {/* 唱片机按钮：低饱和蓝+半透明+轻hover */}
          <button
            onClick={() => navigate("/turntable")}
            className="px-8 py-4 rounded-lg bg-[#424c7a]/30 backdrop-blur-sm border border-[#5a4f8e]/50 text-white font-medium transition-all duration-300 hover:bg-[#424c7a]/50 hover:border-[#5a4f8e]/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            Turntable
          </button>

          {/* 收藏夹按钮：低饱和紫+半透明+轻hover */}
          <button
            onClick={() => navigate("/collection")}
            className="px-8 py-4 rounded-lg bg-[#5a4f8e]/30 backdrop-blur-sm border border-[#5a4f8e]/50 text-white font-medium transition-all duration-300 hover:bg-[#5a4f8e]/50 hover:border-[#5a4f8e]/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            Collection
          </button>
        </div>

        {/* 返回封面：更低调的灰调半透明 */}
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 rounded-lg bg-[#303860]/20 backdrop-blur-sm border border-[#303860]/50 text-white/80 text-sm font-normal transition-all duration-300 hover:bg-[#303860]/40"
        >
          Back to Cover
        </button>
      </div>
    </div>
  );
};

export default Navigation;