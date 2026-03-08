import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Rider icon
const riderIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995503.png",
  iconSize: [35, 35],
});

// Client icon
const clientIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function DeliveryMap({ riderId, clientLocation }) {

  const [riderLoc, setRiderLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const animationRef = useRef(null);

  /*
  ==============================
  SMOOTH LOCATION UPDATE
  ==============================
  */

  const animateMarker = (start, end) => {

    const duration = 2500;
    const startTime = performance.now();

    const animate = (time) => {

      const progress = Math.min((time - startTime) / duration, 1);

      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;

      setRiderLoc({ lat, lng });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }

    };

    animationRef.current = requestAnimationFrame(animate);

  };

  /*
  ==============================
  FETCH RIDER LOCATION
  ==============================
  */

  useEffect(() => {

    if (!riderId) return;

    const fetchLocation = async () => {

      try {

        const res = await axios.get(`${API_URL}/api/rider/${riderId}/location`);

        if (!res.data?.location) return;

        const loc = res.data.location;

        const newLoc = {
          lat: loc.lat ?? loc.coords?.lat,
          lng: loc.lng ?? loc.coords?.lng,
        };

        if (!riderLoc) {
          setRiderLoc(newLoc);
        } else {
          animateMarker(riderLoc, newLoc);
        }

      } catch (err) {
        console.error("Failed to fetch rider location", err);
      }

    };

    fetchLocation();

    const interval = setInterval(fetchLocation, 3000);

    return () => {
      clearInterval(interval);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

  }, [riderId]);

  /*
  ==============================
  FETCH ROUTE
  ==============================
  */

  useEffect(() => {

    const fetchRoute = async () => {

      if (!riderLoc || !clientLocation) return;

      try {

        const url = `https://router.project-osrm.org/route/v1/driving/${riderLoc.lng},${riderLoc.lat};${clientLocation.lng},${clientLocation.lat}?overview=full&geometries=geojson`;

        const res = await axios.get(url);

        if (res.data?.routes?.length > 0) {

          const coords = res.data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

          setRouteCoords(coords);

        }

      } catch (err) {
        console.error("Route fetch error", err);
      }

    };

    fetchRoute();

  }, [riderLoc, clientLocation]);

  if (!clientLocation) {
    return <p>No client location available</p>;
  }

  const center = riderLoc
    ? [riderLoc.lat, riderLoc.lng]
    : [clientLocation.lat, clientLocation.lng];

  return (
    <div className="h-[500px] w-full">

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rider */}
        {riderLoc && (
          <Marker position={[riderLoc.lat, riderLoc.lng]} icon={riderIcon}>
            <Popup>Rider</Popup>
          </Marker>
        )}

        {/* Client */}
        <Marker position={[clientLocation.lat, clientLocation.lng]} icon={clientIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>

        {/* Route */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "blue", weight: 4 }}
          />
        )}

      </MapContainer>

    </div>
  );
}