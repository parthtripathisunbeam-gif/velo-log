import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { Coordinate } from "@/lib/storage";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  coordinates: Coordinate[];
  className?: string;
}

const RouteMap = ({ coordinates, className = "" }: RouteMapProps) => {
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const polylineColor = useMemo(() => {
    if (typeof window === "undefined") return "hsl(174 72% 56%)";
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    return primary ? `hsl(${primary})` : "hsl(174 72% 56%)";
  }, []);

  // Create map once
  useEffect(() => {
    if (!isClient) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    mapRef.current = map;

    // Base layer (CARTO dark)
    tileLayerRef.current = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 20,
      },
    ).addTo(map);

    return () => {
      // Full cleanup to avoid crashes when opening/closing the modal repeatedly
      try {
        map.remove();
      } finally {
        mapRef.current = null;
        polylineRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [isClient]);

  // Update polyline + bounds whenever coordinates change
  useEffect(() => {
    if (!isClient) return;
    const map = mapRef.current;
    if (!map) return;

    // Remove previous polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (coordinates.length === 0) return;

    const latLngs = coordinates.map((c) => L.latLng(c.lat, c.lng));

    polylineRef.current = L.polyline(latLngs, {
      color: polylineColor,
      weight: 4,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [coordinates, isClient, polylineColor]);

  if (coordinates.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary/30 rounded-2xl ${className}`}
      >
        <p className="text-muted-foreground text-sm">No route data available</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div
        className={`flex items-center justify-center bg-secondary/30 rounded-2xl ${className}`}
      >
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default RouteMap;

