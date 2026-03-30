import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, Clock, Route } from 'lucide-react';
import { DayRecord, getHistory } from '@/lib/storage';
import RouteMap from './RouteMap';

const HistoryTab = () => {
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatDuration = (start: number, end: number) => {
    const ms = end - start;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">History</h1>
          <p className="text-muted-foreground text-sm">Your movement records</p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar size={28} className="text-primary/50" />
            </div>
            <p className="text-foreground font-medium mb-1">No records yet</p>
            <p className="text-sm text-muted-foreground">
              Start tracking to create your first record
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {history.map((record, index) => (
              <motion.button
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setSelectedRecord(record)}
                className="history-card w-full text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">
                      {formatDate(record.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(record.startTime, record.endTime)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gradient text-sm">
                      {record.distance.toFixed(2)} km
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/50 shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Detail View */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div className="safe-top px-4 py-3 flex items-center gap-3 border-b border-border/50">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 active:bg-secondary transition-colors"
                >
                  <ArrowLeft size={20} className="text-foreground" />
                </button>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {formatDate(selectedRecord.date)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(selectedRecord.startTime)} – {formatTime(selectedRecord.endTime)}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-4 py-3 flex gap-3">
                <div className="flex-1 glass-card p-3 text-center">
                  <Route size={16} className="text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-gradient">
                    {selectedRecord.distance.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">km</p>
                </div>
                <div className="flex-1 glass-card p-3 text-center">
                  <Clock size={16} className="text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">
                    {formatDuration(selectedRecord.startTime, selectedRecord.endTime)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">duration</p>
                </div>
                <div className="flex-1 glass-card p-3 text-center">
                  <MapPin size={16} className="text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">
                    {selectedRecord.coordinates.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">points</p>
                </div>
              </div>

              {/* Map */}
              <div className="flex-1 px-4 pb-4 safe-bottom">
                <RouteMap
                  coordinates={selectedRecord.coordinates}
                  className="h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HistoryTab;
