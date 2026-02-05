// src/pages/Turntable.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteMenu from "@/components/animation/InfiniteMenu";
import { useHover } from "@/hooks/useHover";


// 扩展类型以适配InfiniteMenu
interface MenuItem {
  image: string;
  title: string;
  description: string;
  link: string;
  id: string;
  audioUrl: string;
  [key: string]: any;
}

const Turntable = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<MenuItem[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");

  // 获取音乐列表
  useEffect(() => {
    fetch('http://localhost:8000/api/music/list/')
      .then(res => res.json())
      .then((data: any[]) => {
        const items: MenuItem[] = data.map((track) => ({
          image: track.cover_url || track.cover || '/default-cover.jpg',
          title: track.title,
          description: `${track.artist} • ${Math.floor((track.duration || 0) / 60)}:${((track.duration || 0) % 60).toString().padStart(2, '0')}`,
          link: "#", 
          id: track.id.toString(),
          audioUrl: track.audio_url || track.audio_file || '',
          ...track
        }));
        setTracks(items);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tracks:", err);
        setDebugInfo("加载失败: " + err.message);
        setLoading(false);
      });
  }, []);

  // 进入舞厅 - 使用useCallback确保引用稳定
const handlePlay = useCallback(() => {
  if (selectedTrack) {
    navigate("/ballroom", { 
      state: { 
        track: {
          id: selectedTrack.id,
          title: selectedTrack.title,
          description: selectedTrack.description,
          // 关键：useAudioPlayer 需要的是 .url 字段
          url: selectedTrack.audioUrl,  // 将 audioUrl 映射为 url
          cover: selectedTrack.image    // 封面图 URL
        }
      } 
    });
  }
}, [navigate, selectedTrack]);

  const { ref: playRef, isHovered: playHovered, isPinching: playPinching } = useHover(handlePlay);

  // 返回按钮
  const handleBack = useCallback(() => {
    navigate("/navigation");
  }, [navigate]);
  
  const { ref: backRef, isHovered: backHovered } = useHover(handleBack);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <div className="text-2xl animate-pulse">加载唱片中...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      {/* 调试信息 - 临时显示 */}
      <div className="fixed top-20 left-4 z-[100] bg-black/80 text-green-400 p-2 rounded text-xs font-mono">
        <div>选中: {selectedTrack?.title || '无'}</div>
        <div>播放悬停: {playHovered ? '是' : '否'}</div>
        <div>播放捏合: {playPinching ? '是' : '否'}</div>
        <div>{debugInfo}</div>
      </div>

      {/* 返回按钮 - 右上角，确保z-50最高层级 */}
      <div 
        ref={backRef}
        className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-full cursor-none transition-all duration-200 ${
          backHovered 
            ? 'bg-cyan-500 border-white scale-110 shadow-[0_0_20px_cyan]' 
            : 'bg-black/50 border-white/30'
        } border-2 backdrop-blur-md pointer-events-auto`}
      >
        <span className="text-white font-bold">
          {backHovered ? '👌 捏合返回' : '返回'}
        </span>
      </div>

      {/* 3D 唱片球体 */}
      <div className="absolute inset-0 z-10">
        <InfiniteMenu 
          items={tracks} 
          scale={1.1}
          onActiveItemChange={(index: number) => {
            const track = tracks[index % tracks.length];
            console.log('Selected track:', track);
            setSelectedTrack(track);
            setDebugInfo(`选中: ${track.title}`);
          }}
        />
      </div>

      {/* 进入舞厅按钮 - 固定在底部中央，z-50确保在最上层 */}
      <div className="fixed bottom-12 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div
          ref={playRef}
          className={`
            pointer-events-auto px-12 py-6 rounded-full cursor-none
            transition-all duration-150 transform
            ${playHovered 
              ? 'bg-green-500 scale-110 shadow-[0_0_50px_rgba(34,197,94,0.9)] border-4 border-white' 
              : 'bg-green-600 scale-100 border-4 border-green-400/50'}
            ${playPinching ? 'scale-95 bg-green-400' : ''}
          `}
        >
          <div className="text-white text-center pointer-events-none">
            <div className="text-2xl font-bold mb-1">
              {selectedTrack ? selectedTrack.title : '请选择唱片'}
            </div>
            <div className="text-sm text-green-100 font-medium">
              {playHovered 
                ? playPinching 
                  ? '✅ 确认中...' 
                  : '👌 请捏合手指确认'
                : '将光标移到这里'}
            </div>
          </div>
          
          {/* 捏合进度条可视化 */}
          <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: playPinching ? '100%' : (playHovered ? '50%' : '0%'),
                transition: playPinching ? 'width 0.3s ease-out' : 'width 0.1s'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Turntable;