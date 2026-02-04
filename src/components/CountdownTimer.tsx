import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  getTimeRemaining: () => number;
}

const CountdownTimer = ({ getTimeRemaining }: CountdownTimerProps) => {
  const [time, setTime] = useState(getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [getTimeRemaining]);

  const hours = Math.floor(time / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <p className="text-sm text-muted-foreground mb-3 text-center">
        Time remaining until day ends
      </p>
      <div className="flex items-center justify-center gap-2">
        <TimeUnit value={formatNumber(hours)} label="HRS" />
        <span className="text-2xl text-muted-foreground font-light">:</span>
        <TimeUnit value={formatNumber(minutes)} label="MIN" />
        <span className="text-2xl text-muted-foreground font-light">:</span>
        <TimeUnit value={formatNumber(seconds)} label="SEC" />
      </div>
    </motion.div>
  );
};

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <motion.div
      key={value}
      initial={{ opacity: 0.5, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-semibold countdown-number text-foreground"
    >
      {value}
    </motion.div>
    <div className="text-[10px] text-muted-foreground tracking-widest mt-1">
      {label}
    </div>
  </div>
);

export default CountdownTimer;
