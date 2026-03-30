import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Navigation } from 'lucide-react';
import SlideToStart, { SlideToEnd } from './SlideToStart';
import CountdownTimer from './CountdownTimer';
import PermissionModal from './PermissionModal';
import { useTracker } from '@/hooks/useTracker';

interface HomeTabProps {
  userName: string;
}

const HomeTab = ({ userName }: HomeTabProps) => {
  const {
    isActive,
    isLoading,
    startDay,
    endDay,
    getTimeUntilMidnight,
    getCurrentDistance,
    permissionStatus,
    requestPermission,
  } = useTracker();

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(0);

  useEffect(() => {
    if (isActive) {
      setCurrentDistance(getCurrentDistance());
      const interval = setInterval(() => {
        setCurrentDistance(getCurrentDistance());
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setCurrentDistance(0);
    }
  }, [isActive, getCurrentDistance]);

  const handleStartDay = async () => {
    if (permissionStatus !== 'granted') {
      setShowPermissionModal(true);
      return;
    }
    await startDay();
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPermissionModal(false);
      await startDay();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-muted-foreground text-sm">{getGreeting()},</p>
        <h1 className="text-2xl font-bold text-foreground">
          Hi, {userName}! 👋
        </h1>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        {isActive ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <div className="pulse-ring w-3 h-3 -top-0 -left-0" />
                </div>
                <span className="text-sm font-medium text-primary">Tracking Active</span>
              </div>
              <Navigation size={20} className="text-primary" />
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Distance Today</p>
                  <motion.p
                    key={currentDistance.toFixed(2)}
                    initial={{ opacity: 0.7, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="stat-value"
                  >
                    {currentDistance.toFixed(2)}
                  </motion.p>
                  <p className="stat-label">kilometers</p>
                </div>
                <TrendingUp size={32} className="text-primary/30" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Activity size={26} className="text-primary/60" />
            </div>
            <p className="text-foreground font-medium mb-1">Ready to track</p>
            <p className="text-muted-foreground text-sm">
              Slide below to start logging your movement
            </p>
          </div>
        )}
      </motion.div>

      {/* Timer when active */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CountdownTimer getTimeRemaining={getTimeUntilMidnight} />
        </motion.div>
      )}

      {/* Slider */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isActive ? 0.4 : 0.3 }}
      >
        {isActive ? (
          <SlideToEnd onComplete={endDay} />
        ) : (
          <SlideToStart onComplete={handleStartDay} isCompleted={false} />
        )}
      </motion.div>

      {/* Tip when active */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4"
        >
          <p className="text-xs text-muted-foreground text-center">
            GPS is recording your route. Keep the app open for best accuracy 📍
          </p>
        </motion.div>
      )}

      {/* Permission Modal */}
      <PermissionModal
        isOpen={showPermissionModal}
        onRequestPermission={handleRequestPermission}
        onClose={() => setShowPermissionModal(false)}
        status={permissionStatus}
      />
    </motion.div>
  );
};

export default HomeTab;
