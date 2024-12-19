'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

type Coordinates = {
    latitude: number;
    longitude: number;
} | null;
interface Props {
    longitude: number;
    latitude: number;
    setCoord: React.Dispatch<React.SetStateAction<Coordinates>>;
}
interface Propss {
    longitude: number;
    latitude: number;
}

function SetViewOnLocationChange({ latitude, longitude }: Propss) {
    const map = useMap();
    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom(), {
            animate: true,
        });
    }, [latitude, longitude, map]);

    return null;
}

const CustomerMap: React.FC<Props> = ({ latitude, longitude, setCoord }) => {
    const [position, setPosition] = useState<[number, number]>([
        latitude,
        longitude,
    ]);

    const isInitialized = useRef(false);

    useEffect(() => {
        isInitialized.current = true;

        return () => {
            isInitialized.current = false;
        };
    }, []);
    if (!isInitialized) return null;
    const locationIcon = L.icon({
        iconUrl: '/images/location.svg',
        iconSize: [20, 40],
        iconAnchor: [12, 12],
        popupAnchor: [0, 0],
    });

    const handleMarkerDragEnd = (event: L.DragEndEvent) => {
        const marker = event.target as L.Marker;
        const newLatLng = marker.getLatLng();
        setPosition([newLatLng.lat, newLatLng.lng]);
        const newPosition = {
            latitude: newLatLng.lat,
            longitude: newLatLng.lng,
        };
        console.log(setCoord);
        if (setCoord && typeof setCoord === 'function') {
            setCoord(newPosition);
        }
    };

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={30}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            easeLinearity={0.35}
            className="w-full h-[400px]"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                draggable={true}
                position={position}
                icon={locationIcon}
                eventHandlers={{
                    dragend: handleMarkerDragEnd,
                }}
            >
                <Popup>[{position}]</Popup>
            </Marker>
            <SetViewOnLocationChange
                latitude={latitude}
                longitude={longitude}
            />
        </MapContainer>
    );
};

export default CustomerMap;
