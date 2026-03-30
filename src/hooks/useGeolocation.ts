import { useState, useCallback, useEffect, useRef } from 'react';
import { Coordinate } from '@/lib/storage';

interface GeolocationState {
  coordinates: Coordinate[];
  currentPosition: Coordinate | null;
  error: string | null;
  isTracking: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

// Minimum distance in meters to accept a new point (reduces GPS jitter)
const MIN_DISTANCE_METERS = 5;
// Maximum speed in m/s to accept (filters out GPS jumps) ~120 km/h
const MAX_SPEED_MS = 33;
// Minimum accuracy in meters to accept a reading
const MAX_ACCURACY_METERS = 50;

const haversineMeters = (a: Coordinate, b: Coordinate): number => {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: [],
    currentPosition: null,
    error: null,
    isTracking: false,
    permissionStatus: 'unknown',
  });

  const watchIdRef = useRef<number | null>(null);
  const lastAcceptedRef = useRef<Coordinate | null>(null);

  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
      return 'unknown';
    }
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setState(prev => ({ ...prev, permissionStatus: result.state as any }));
      return result.state;
    } catch {
      setState(prev => ({ ...prev, permissionStatus: 'unknown' }));
      return 'unknown';
    }
  }, []);

  const startTracking = useCallback((initialCoordinates: Coordinate[] = []) => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation is not supported' }));
      return;
    }

    // Seed the last-accepted ref so filtering works from the start
    if (initialCoordinates.length > 0) {
      lastAcceptedRef.current = initialCoordinates[initialCoordinates.length - 1];
    } else {
      lastAcceptedRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isTracking: true,
      coordinates: initialCoordinates,
      error: null,
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        // Skip low-accuracy readings
        if (position.coords.accuracy > MAX_ACCURACY_METERS) return;

        const newCoord: Coordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

        const last = lastAcceptedRef.current;

        if (last) {
          const dist = haversineMeters(last, newCoord);
          const dt = (newCoord.timestamp - last.timestamp) / 1000; // seconds
          const speed = dt > 0 ? dist / dt : 0;

          // Filter out GPS jitter (too close) and teleport jumps (too fast)
          if (dist < MIN_DISTANCE_METERS || speed > MAX_SPEED_MS) {
            // Still update current position for UI, but don't record the coordinate
            setState(prev => ({ ...prev, currentPosition: newCoord, permissionStatus: 'granted' }));
            return;
          }
        }

        lastAcceptedRef.current = newCoord;

        setState(prev => ({
          ...prev,
          currentPosition: newCoord,
          coordinates: [...prev.coordinates, newCoord],
          permissionStatus: 'granted',
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          permissionStatus: error.code === 1 ? 'denied' : prev.permissionStatus,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      },
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    lastAcceptedRef.current = null;
    setState(prev => ({ ...prev, isTracking: false }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setState(prev => ({ ...prev, permissionStatus: 'granted' }));
          resolve(true);
        },
        (error) => {
          setState(prev => ({
            ...prev,
            permissionStatus: error.code === 1 ? 'denied' : 'prompt',
            error: error.message,
          }));
          resolve(false);
        },
      );
    });
  }, []);

  useEffect(() => {
    checkPermission();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [checkPermission]);

  return {
    ...state,
    startTracking,
    stopTracking,
    requestPermission,
    checkPermission,
  };
};
