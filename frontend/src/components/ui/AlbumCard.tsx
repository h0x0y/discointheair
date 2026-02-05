// src/components/ui/AlbumCard.tsx
import { motion } from 'framer-motion';
import { useHover } from '@/hooks/useHover';
import type { CollectionItem } from '@/utils/types';

interface Props {
  item: CollectionItem;
  index: number;
  onPlay: () => void;
}

export const AlbumCard = ({ item, index, onPlay }: Props) => {
  const { ref, isHovered } = useHover(onPlay);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`relative aspect-video rounded-xl overflow-hidden cursor-none transition-all duration-300 ${
        isHovered ? 'ring-4 ring-cyan-400 z-10 scale-105' : 'ring-0 scale-100'
      }`}
      style={{
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(34,211,238,0.3)' 
          : '0 4px 10px rgba(0,0,0,0.3)'
      }}
    >
      <img src={item.thumbnail} alt={item.trackName} className="w-full h-full object-cover" />
      
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg">{item.trackName}</p>
          <p className="text-cyan-400 text-sm mt-1">{item.createdAt}</p>
          <p className="text-white/60 text-xs mt-2">👌 捏合播放</p>
        </div>
      </div>

      {isHovered && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-xs">▶</span>
        </div>
      )}
    </motion.div>
  );
};