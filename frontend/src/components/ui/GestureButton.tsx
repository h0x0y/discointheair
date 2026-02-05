// src/components/ui/GestureButton.tsx
import { motion } from 'framer-motion';
import { useHover } from '@/hooks/useHover';

interface Props {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const GestureButton = ({ onClick, children, className = '', variant = 'primary' }: Props) => {
  const { ref, isHovered } = useHover(onClick);

  const variants = {
    primary: 'bg-green-600 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]',
    secondary: 'bg-gray-800 text-white border border-gray-600',
    ghost: 'bg-transparent text-white border border-white/30'
  };

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative px-8 py-4 rounded-full cursor-none font-bold text-lg transition-all
        ${variants[variant]}
        ${isHovered ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black scale-110' : ''}
        ${className}
      `}
    >
      {children}
      {isHovered && (
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-cyan-400 text-xs whitespace-nowrap">
          👌 捏合确认
        </span>
      )}
    </motion.div>
  );
};