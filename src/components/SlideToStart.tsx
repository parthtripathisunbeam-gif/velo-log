import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { ChevronRight, Check, Square } from 'lucide-react';

interface SlideActionProps {
  onComplete: () => void;
  label: string;
  completedLabel: string;
  variant?: 'start' | 'end';
}

const SlideAction = ({ onComplete, label, completedLabel, variant = 'start' }: SlideActionProps) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [maxX, setMaxX] = useState(0);
  const [completed, setCompleted] = useState(false);
  const x = useMotionValue(0);

  const thumbWidth = 56;
  const padding = 4;

  const updateMaxX = useCallback(() => {
    if (constraintsRef.current) {
      const w = constraintsRef.current.offsetWidth;
      setMaxX(Math.max(0, w - thumbWidth - padding * 2));
    }
  }, []);

  useEffect(() => {
    updateMaxX();
    // Re-measure after layout settles
    const raf = requestAnimationFrame(updateMaxX);
    window.addEventListener('resize', updateMaxX);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateMaxX);
    };
  }, [updateMaxX]);

  const threshold = maxX * 0.75;

  const backgroundOpacity = useTransform(x, [0, maxX || 1], [0, 1]);
  const textOpacity = useTransform(x, [0, (maxX || 1) * 0.3], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (maxX > 0 && info.offset.x >= threshold) {
      animate(x, maxX, { type: 'spring', stiffness: 300, damping: 30 });
      setCompleted(true);
      // Vibrate if available
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(onComplete, 300);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  const isEnd = variant === 'end';
  const accentColor = isEnd ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';

  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`slider-track flex items-center justify-center ${isEnd ? 'bg-destructive/20' : 'bg-primary/20'}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className={`flex items-center gap-2 ${isEnd ? 'text-destructive' : 'text-primary'} font-medium`}
        >
          <Check size={20} />
          {completedLabel}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div ref={constraintsRef} className="slider-track relative select-none">
      {/* Background fill */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${accentColor}20, ${accentColor}30)`,
          opacity: backgroundOpacity,
        }}
      />

      {/* Text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        <span className="text-muted-foreground font-medium text-sm ml-12">
          {label}
        </span>
      </motion.div>

      {/* Thumb */}
      {maxX > 0 && (
        <motion.div
          className={`slider-thumb z-10 ${isEnd ? 'bg-destructive' : ''}`}
          drag="x"
          dragConstraints={{ left: 0, right: maxX }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileDrag={{ scale: 1.05 }}
          whileTap={{ scale: 1.02 }}
        >
          {isEnd ? (
            <Square size={20} className="text-destructive-foreground" />
          ) : (
            <ChevronRight size={24} className="text-primary-foreground" />
          )}
        </motion.div>
      )}

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
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
};

// Wrapper components
interface SlideToStartProps {
  onComplete: () => void;
  isCompleted: boolean;
}

const SlideToStart = ({ onComplete, isCompleted }: SlideToStartProps) => {
  if (isCompleted) {
    return (
      <div className="slider-track flex items-center justify-center bg-primary/20">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Check size={20} />
          Day Started!
        </div>
      </div>
    );
  }
  return (
    <SlideAction
      onComplete={onComplete}
      label="Slide to Start Your Day"
      completedLabel="Day Started!"
      variant="start"
    />
  );
};

interface SlideToEndProps {
  onComplete: () => void;
}

export const SlideToEnd = ({ onComplete }: SlideToEndProps) => (
  <SlideAction
    onComplete={onComplete}
    label="Slide to End Your Day"
    completedLabel="Day Ended!"
    variant="end"
  />
);

export default SlideToStart;
