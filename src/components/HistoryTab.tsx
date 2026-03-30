import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronRight, ArrowLeft, Clock, Route, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { DayRecord, getHistory } from '@/lib/storage';
import RouteMap from './RouteMap';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const HistoryTab = () => {
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Get dates that have records for highlighting in the calendar
  const recordDates = useMemo(() => {
    return history.map((r) => new Date(r.date + 'T00:00:00'));
  }, [history]);

  // Filter history by selected date
  const filteredHistory = useMemo(() => {
    if (!selectedDate) return history;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return history.filter((r) => r.date === dateStr);
  }, [history, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setCalendarOpen(false);

    // If a date is selected and there's exactly one record, open it directly
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const matches = history.filter((r) => r.date === dateStr);
      if (matches.length === 1) {
        setSelectedRecord(matches[0]);
      }
    }
  };

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">History</h1>
            <p className="text-muted-foreground text-sm">Your movement records</p>
          </div>

          {/* Date picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
                <Search size={18} className="text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={{ hasRecord: recordDates }}
                modifiersClassNames={{ hasRecord: 'bg-primary/20 font-bold text-primary' }}
                disabled={(date) => date > new Date()}
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </motion.div>

        {/* Active filter chip */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Calendar size={14} className="text-primary" />
              <span className="text-sm text-primary font-medium">
                {format(selectedDate, 'MMM d, yyyy')}
              </span>
              <button
                onClick={() => setSelectedDate(undefined)}
                className="p-0.5 rounded-full hover:bg-primary/20 transition-colors"
              >
                <X size={14} className="text-primary" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {filteredHistory.length} record{filteredHistory.length !== 1 ? 's' : ''}
            </span>
          </motion.div>
        )}

        {/* Records list */}
        {filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar size={28} className="text-primary/50" />
            </div>
            <p className="text-foreground font-medium mb-1">
              {selectedDate ? 'No records for this date' : 'No records yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? 'Try selecting a different date'
                : 'Start tracking to create your first record'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((record, index) => (
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
