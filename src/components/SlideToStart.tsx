import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { ChevronRight, Check, Square } from 'lucide-react';

interface SlideActionProps {
  onComplete: () => void;
  isCompleted: boolean;
  label: string;
  completedLabel: string;
  variant?: 'start' | 'end';
}

const SlideAction = ({ onComplete, isCompleted, label, completedLabel, variant = 'start' }: SlideActionProps) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useMotionValue(0);
  
  const thumbWidth = 56;
  const padding = 4;
  const maxX = trackWidth - thumbWidth - padding * 2;
  const threshold = maxX * 0.8;

  useEffect(() => {
    const updateWidth = () => {
      if (constraintsRef.current) {
        setTrackWidth(constraintsRef.current.offsetWidth);
      }
    };
    
    // Initial measurement
    updateWidth();
    
    // Re-measure after a short delay to ensure layout is complete
    const timer = setTimeout(updateWidth, 100);
    
    // Also listen for resize events
    window.addEventListener('resize', updateWidth);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const backgroundOpacity = useTransform(x, [0, maxX], [0, 1]);
  const textOpacity = useTransform(x, [0, maxX * 0.3], [1, 0]);
  const checkOpacity = useTransform(x, [maxX * 0.7, maxX], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x >= threshold) {
      animate(x, maxX, { type: "spring", stiffness: 300, damping: 30 });
      setTimeout(onComplete, 200);
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  };

  const isEnd = variant === 'end';
  const bgGradient = isEnd 
    ? 'linear-gradient(90deg, hsl(0 72% 56% / 0.2), hsl(0 72% 56% / 0.3))'
    : 'linear-gradient(90deg, hsl(174 72% 56% / 0.2), hsl(174 72% 56% / 0.3))';

  if (isCompleted) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`slider-track flex items-center justify-center ${isEnd ? 'bg-destructive/20' : 'bg-primary/20'}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          className={`flex items-center gap-2 ${isEnd ? 'text-destructive' : 'text-primary'} font-medium`}
        >
          <Check size={20} />
          {completedLabel}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div ref={constraintsRef} className="slider-track relative">
      {/* Background fill */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: bgGradient,
          opacity: backgroundOpacity,
        }}
      />

      {/* Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        <span className="text-muted-foreground font-medium ml-12">
          {label}
        </span>
      </motion.div>

      {/* Thumb */}
      <motion.div
        className={`slider-thumb z-10 ${isEnd ? 'bg-destructive' : ''}`}
        drag="x"
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileDrag={{ scale: 1.05 }}
      >
        <motion.div style={{ opacity: useTransform(checkOpacity, v => 1 - v) }}>
          {isEnd ? (
            <Square size={20} className="text-destructive-foreground" />
          ) : (
            <ChevronRight size={24} className="text-primary-foreground" />
          )}
        </motion.div>
        <motion.div 
          className="absolute"
          style={{ opacity: checkOpacity }}
        >
          <Check size={24} className={isEnd ? 'text-destructive-foreground' : 'text-primary-foreground'} />
        </motion.div>
      </motion.div>

      {/* Pulse indicators */}
      <motion.div
        className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1"
        style={{ opacity: textOpacity }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

// Wrapper components for backwards compatibility
interface SlideToStartProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const SlideToStart = ({ onComplete, isCompleted }: SlideToStartProps) => (
  <SlideAction
    onComplete={onComplete}
    isCompleted={isCompleted}
    label="Slide to Start Your Day"
    completedLabel="Day Started!"
    variant="start"
  />
);

interface SlideToEndProps {
  onComplete: () => void;
}

export const SlideToEnd = ({ onComplete }: SlideToEndProps) => (
  <SlideAction
    onComplete={onComplete}
    isCompleted={false}
    label="Slide to End Your Day"
    completedLabel="Day Ended!"
    variant="end"
  />
);

export default SlideToStart;
