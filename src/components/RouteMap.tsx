import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Coordinate } from '@/lib/storage';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  coordinates: Coordinate[];
  className?: string;
}

const RouteMap = ({ coordinates, className = '' }: RouteMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.CircleMarker | null>(null);
  const endMarkerRef = useRef<L.CircleMarker | null>(null);

  const polylineColor = useMemo(() => {
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();
    return primary ? `hsl(${primary})` : 'hsl(174 72% 56%)';
  }, []);

  // Create map once
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    mapRef.current = map;

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 20 },
    ).addTo(map);

    // Force a resize after the container is visible
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      try { map.remove(); } catch { /* safe */ }
      mapRef.current = null;
      polylineRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
    };
  }, []);

  // Update polyline + bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean previous
    polylineRef.current?.remove();
    startMarkerRef.current?.remove();
    endMarkerRef.current?.remove();
    polylineRef.current = null;
    startMarkerRef.current = null;
    endMarkerRef.current = null;

    if (coordinates.length === 0) return;

    const latLngs = coordinates.map((c) => L.latLng(c.lat, c.lng));

    polylineRef.current = L.polyline(latLngs, {
      color: polylineColor,
      weight: 4,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Start marker (green)
    startMarkerRef.current = L.circleMarker(latLngs[0], {
      radius: 6,
      color: '#22c55e',
      fillColor: '#22c55e',
      fillOpacity: 1,
      weight: 2,
    }).addTo(map);

    // End marker (red)
    if (latLngs.length > 1) {
      endMarkerRef.current = L.circleMarker(latLngs[latLngs.length - 1], {
        radius: 6,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
    }

    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
  }, [coordinates, polylineColor]);

  if (coordinates.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-2xl ${className}`}>
        <p className="text-muted-foreground text-sm">No route data available</p>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default RouteMap;
