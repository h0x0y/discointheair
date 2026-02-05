// src/pages/Collection.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CollectionItem } from '@/utils/types';  // 添加 type 关键字
import {AlbumCard} from '@/components/ui/AlbumCard';     // 改为默认导入
import { GestureButton } from '@/components/ui/GestureButton';
import { useHover } from '@/hooks/useHover';

const Collection = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CollectionItem[]>([]);
  
  const backHover = useHover(() => navigate(-1));
  const clearHover = useHover(() => {
    if (window.confirm('确定清空所有收藏吗？')) {
      localStorage.removeItem('disco_collections');
      setItems([]);
    }
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('disco_collections') || '[]');
    setItems(saved);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black p-8 pt-24">
      <div className="fixed top-0 left-0 right-0 z-20 bg-gradient-to-b from-black to-transparent p-6 flex justify-between items-center">
        <h2 className="text-4xl font-bold text-white">我的收藏</h2>
        
        <div className="flex gap-4">
          <div ref={clearHover.ref}
            className={`px-4 py-2 rounded-full cursor-none transition-all ${
              clearHover.isHovered ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
            {clearHover.isHovered ? '👌 捏合清空' : '清空收藏'}
          </div>
          
          <div ref={backHover.ref}
            className={`px-4 py-2 rounded-full cursor-none transition-all ${
              backHover.isHovered ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
            {backHover.isHovered ? '👌 捏合返回' : '返回'}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-white/40">
          <p className="text-2xl mb-4">暂无收藏</p>
          <p className="text-sm mb-8">去舞厅创作你的第一支Disco可视化作品</p>
          <GestureButton onClick={() => navigate('/turntable')} variant="primary">
            去挑选唱片
          </GestureButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <AlbumCard key={item.id} item={item} index={index} onPlay={() => {
              const video = document.createElement('video');
              video.src = item.videoUrl;
              video.controls = true;
              video.autoplay = true;
              video.className = 'fixed inset-0 w-full h-full z-50 bg-black';
              document.body.appendChild(video);
              video.onended = () => video.remove();
              video.onclick = () => video.remove();
            }} />
          ))}
        </div>
      )}

      <div className="fixed bottom-8 left-0 right-0 text-center text-white/40 text-sm pointer-events-none">
        悬停卡片查看详情，捏合播放视频
      </div>
    </div>
  );
};

export default Collection;