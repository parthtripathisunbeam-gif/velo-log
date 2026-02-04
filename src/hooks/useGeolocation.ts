import { useState, useCallback, useEffect, useRef } from 'react';
import { Coordinate } from '@/lib/storage';

interface GeolocationState {
  coordinates: Coordinate[];
  currentPosition: Coordinate | null;
  error: string | null;
  isTracking: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: [],
    currentPosition: null,
    error: null,
    isTracking: false,
    permissionStatus: 'unknown',
  });

  const watchIdRef = useRef<number | null>(null);

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

    setState(prev => ({ 
      ...prev, 
      isTracking: true, 
      coordinates: initialCoordinates,
      error: null 
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: Coordinate = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
        };

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
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
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
        }
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
