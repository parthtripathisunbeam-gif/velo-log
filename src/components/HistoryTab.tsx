import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { DayRecord, getHistory } from '@/lib/storage';
import RouteMap from './RouteMap';

const HistoryTab = () => {
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">History</h1>
          <p className="text-muted-foreground text-sm">Your movement records</p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Calendar size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No records yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
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
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedRecord(record)}
                className="history-card w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {formatDate(record.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(record.startTime, record.endTime)} tracked
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gradient">
                      {record.distance.toFixed(2)} km
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.coordinates.length} points
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Map Detail View */}
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full flex flex-col"
            >
              {/* Header */}
              <div className="safe-top px-4 py-3 flex items-center justify-between border-b border-border/50">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="text-center">
                  <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRecord.distance.toFixed(2)} km
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 -mr-2 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Map */}
              <div className="flex-1 p-4 safe-bottom">
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
