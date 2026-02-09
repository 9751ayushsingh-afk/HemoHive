'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { useMemo, useRef, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to fit map to route bounds
function MapController({ driverLocation, destination }: { driverLocation: [number, number], destination: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        // Create bounds from driver and destination
        const bounds = L.latLngBounds([driverLocation, destination]);

        // Fit bounds with padding to ensure markers aren't on the very edge
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true
        });
    }, [driverLocation, destination, map]);
    return null;
}

interface LiveMapProps {
    driverLocation: [number, number];
    destination: [number, number];
    onMapClick?: (lat: number, lng: number) => void;
    draggable?: boolean; // New prop
    onDragEnd?: (lat: number, lng: number) => void; // New callback
}

export default function LiveMap({ driverLocation, destination, onMapClick, draggable, onDragEnd }: LiveMapProps) {

    // Draggable Marker Logic
    const markerRef = useRef<L.Marker>(null);
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null && onDragEnd) {
                    const { lat, lng } = marker.getLatLng();
                    onDragEnd(lat, lng);
                }
            },
        }),
        [onDragEnd],
    );

    return (
        <MapContainer center={driverLocation} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
                draggable={draggable}
                eventHandlers={eventHandlers}
                position={driverLocation}
                ref={markerRef}
                opacity={draggable ? 0.8 : 1}
            >
                <Popup>{draggable ? "Drag me to move!" : "You"}</Popup>
            </Marker>

            <Marker position={destination}>
                <Popup>Destination</Popup>
            </Marker>

            {/* Route Path (Actual Road) */}
            <RoutePolyline driverLocation={driverLocation} destination={destination} />

            <MapController driverLocation={driverLocation} destination={destination} />
            <ClickHandler onMapClick={onMapClick} />
        </MapContainer>
    );
}

// Internal Component to fetch and draw route
function RoutePolyline({ driverLocation, destination }: { driverLocation: [number, number], destination: [number, number] }) {
    const [positions, setPositions] = useState<[number, number][]>([]);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                // OSRM Public API (Demo Server - Respect Usage Policy)
                // Coordinates: {lng},{lat}
                const start = `${driverLocation[1]},${driverLocation[0]}`;
                const end = `${destination[1]},${destination[0]}`;

                const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
                const data = await res.json();

                if (data.routes && data.routes.length > 0) {
                    // OSRM returns [lng, lat], Leaflet needs [lat, lng]
                    const route = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                    setPositions(route);
                    console.log('[LiveMap] Route Found:', route.length, 'points');
                } else {
                    console.warn('[LiveMap] No route found by OSRM');
                    setPositions([]); // Fallback to straight line
                }
            } catch (error) {
                console.error("Routing Error:", error);
                setPositions([]); // Fallback
            }
        };

        if (driverLocation && destination && driverLocation[0] !== 0) {
            console.log('[LiveMap] Fetching route from', driverLocation, 'to', destination);
            fetchRoute();
        }
    }, [driverLocation, destination]);

    if (positions.length > 0) {
        return (
            <>
                {/* Main Route Line */}
                <Polyline positions={positions} color="#C00029" weight={5} opacity={0.8} />
                {/* Shadow/Stroke for visibility */}
                <Polyline positions={positions} color="white" weight={8} opacity={0.4} className="blur-sm" />
            </>
        );
    }

    // Fallback Straight Dotted Line
    return <Polyline positions={[driverLocation, destination]} color="#C00029" dashArray="10, 10" opacity={0.5} weight={4} />;
}
