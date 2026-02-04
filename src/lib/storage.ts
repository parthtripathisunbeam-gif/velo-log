// LocalStorage keys
const KEYS = {
  USER: 'tracker_user',
  TRACKING_SESSION: 'tracker_session',
  HISTORY: 'tracker_history',
} as const;

// Types
export interface User {
  name: string;
  password: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface TrackingSession {
  startTime: number;
  coordinates: Coordinate[];
  isActive: boolean;
}

export interface DayRecord {
  id: string;
  date: string;
  distance: number; // in km
  coordinates: Coordinate[];
  startTime: number;
  endTime: number;
}

// User functions
export const getUser = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const clearUser = (): void => {
  localStorage.removeItem(KEYS.USER);
};

// Tracking session functions
export const getTrackingSession = (): TrackingSession | null => {
  const data = localStorage.getItem(KEYS.TRACKING_SESSION);
  return data ? JSON.parse(data) : null;
};

export const setTrackingSession = (session: TrackingSession): void => {
  localStorage.setItem(KEYS.TRACKING_SESSION, JSON.stringify(session));
};

export const clearTrackingSession = (): void => {
  localStorage.removeItem(KEYS.TRACKING_SESSION);
};

// History functions
export const getHistory = (): DayRecord[] => {
  const data = localStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const addToHistory = (record: DayRecord): void => {
  const history = getHistory();
  history.unshift(record);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
};

export const getDayRecord = (id: string): DayRecord | undefined => {
  return getHistory().find(record => record.id === id);
};

// Haversine formula for calculating distance between two coordinates
export const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

// Calculate total distance from array of coordinates
export const calculateTotalDistance = (coordinates: Coordinate[]): number => {
  if (coordinates.length < 2) return 0;
  
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += calculateDistance(coordinates[i - 1], coordinates[i]);
  }
  return total;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
