import { useState, useEffect, useCallback } from 'react';
import { 
  TrackingSession, 
  DayRecord,
  getTrackingSession, 
  setTrackingSession, 
  clearTrackingSession,
  addToHistory,
  calculateTotalDistance,
  generateId,
  Coordinate,
} from '@/lib/storage';
import { useGeolocation } from './useGeolocation';

export const useTracker = () => {
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const geolocation = useGeolocation();

  // Load session on mount
  useEffect(() => {
    const storedSession = getTrackingSession();
    if (storedSession?.isActive) {
      setSession(storedSession);
      // Resume tracking with stored coordinates
      geolocation.startTracking(storedSession.coordinates);
    }
    setIsLoading(false);
  }, []);

  // Sync geolocation coordinates with session
  useEffect(() => {
    if (session?.isActive && geolocation.coordinates.length > 0) {
      const updatedSession = {
        ...session,
        coordinates: geolocation.coordinates,
      };
      setSession(updatedSession);
      setTrackingSession(updatedSession);
    }
  }, [geolocation.coordinates, session?.isActive]);

  // Check for midnight auto-end
  useEffect(() => {
    if (!session?.isActive) return;

    const checkMidnight = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 0, 0);
      
      if (now >= endOfDay) {
        endDay();
      }
    };

    const interval = setInterval(checkMidnight, 1000);
    return () => clearInterval(interval);
  }, [session?.isActive]);

  const startDay = useCallback(async (): Promise<boolean> => {
    const hasPermission = await geolocation.requestPermission();
    if (!hasPermission) return false;

    const newSession: TrackingSession = {
      startTime: Date.now(),
      coordinates: [],
      isActive: true,
    };

    setSession(newSession);
    setTrackingSession(newSession);
    geolocation.startTracking();
    return true;
  }, [geolocation]);

  const endDay = useCallback(() => {
    if (!session) return;

    geolocation.stopTracking();

    const allCoordinates = geolocation.coordinates.length > 0 
      ? geolocation.coordinates 
      : session.coordinates;

    const record: DayRecord = {
      id: generateId(),
      date: new Date(session.startTime).toISOString().split('T')[0],
      distance: calculateTotalDistance(allCoordinates),
      coordinates: allCoordinates,
      startTime: session.startTime,
      endTime: Date.now(),
    };

    addToHistory(record);
    clearTrackingSession();
    setSession(null);
  }, [session, geolocation]);

  const getTimeUntilMidnight = useCallback((): number => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 0, 0);
    return Math.max(0, endOfDay.getTime() - now.getTime());
  }, []);

  const getCurrentDistance = useCallback((): number => {
    const coords = geolocation.coordinates.length > 0 
      ? geolocation.coordinates 
      : session?.coordinates || [];
    return calculateTotalDistance(coords);
  }, [geolocation.coordinates, session?.coordinates]);

  return {
    session,
    isLoading,
    isActive: session?.isActive || false,
    startDay,
    endDay,
    getTimeUntilMidnight,
    getCurrentDistance,
    permissionStatus: geolocation.permissionStatus,
    geolocationError: geolocation.error,
    requestPermission: geolocation.requestPermission,
  };
};
