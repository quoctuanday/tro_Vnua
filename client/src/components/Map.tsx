'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Props {
    longitude: number;
    latitude: number;
}

function SetViewOnLocationChange({ latitude, longitude }: Props) {
    const map = useMap();
    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom(), {
            animate: true,
        });
    }, [latitude, longitude, map]);

    return null;
}

export default function CustomerMap({ latitude, longitude }: Props) {
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
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={13}
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
            <Marker position={[latitude, longitude]} icon={locationIcon}>
                <Popup>Vị trí cần tìm ở đây.</Popup>
            </Marker>
            <SetViewOnLocationChange
                latitude={latitude}
                longitude={longitude}
            />
        </MapContainer>
    );
}
