// src/components/ui/GlobalCursor.tsx
import { useGestureState } from '@/core/GestureState';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalCursor = () => {
  const cursor = useGestureState((state) => state.cursor);

  return (
    <AnimatePresence>
      {cursor.isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 1, 
            scale: cursor.isPinching ? 0.8 : 1,
            x: cursor.x,
            y: cursor.y
          }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          className="fixed top-0 left-0 z-[9999] pointer-events-none"
          style={{ translateX: '-50%', translateY: '-50%' }}
        >
          <div className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
            cursor.isPinching ? 'border-green-400 bg-green-400/30' : 'border-cyan-400 bg-cyan-400/20'
          }`} style={{
            boxShadow: cursor.isPinching 
              ? '0 0 30px rgba(74,222,128,0.8)' 
              : '0 0 20px rgba(34,211,238,0.6)'
          }} />
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          {cursor.isPinching && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 left-1/2 -translate-x-1/2 text-green-400 text-xs font-bold whitespace-nowrap bg-black/80 px-2 py-1 rounded">
              确认
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};