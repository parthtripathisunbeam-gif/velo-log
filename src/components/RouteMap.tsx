import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { Coordinate } from '@/lib/storage';
import 'leaflet/dist/leaflet.css';

interface RouteMapProps {
  coordinates: Coordinate[];
  className?: string;
}

const FitBounds = ({ coordinates }: { coordinates: Coordinate[] }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = coordinates.map(c => [c.lat, c.lng] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
};

const RouteMap = ({ coordinates, className = '' }: RouteMapProps) => {
  if (coordinates.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-secondary/30 rounded-2xl ${className}`}>
        <p className="text-muted-foreground text-sm">No route data available</p>
      </div>
    );
  }

  const center = coordinates[Math.floor(coordinates.length / 2)];
  const positions = coordinates.map(c => [c.lat, c.lng] as [number, number]);

  return (
    <div className={`map-container ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline
          positions={positions}
          pathOptions={{
            color: 'hsl(174, 72%, 56%)',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
        <FitBounds coordinates={coordinates} />
      </MapContainer>
    </div>
  );
};

export default RouteMap;
