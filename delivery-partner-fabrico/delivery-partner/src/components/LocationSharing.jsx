// src/components/LocationSharing.jsx

import { useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const SOCKET_URL = API.replace("/api", "");

const socket = io(SOCKET_URL);

export default function LocationSharing({ user, onSharingChange }) {

  const watchRef = useRef(null);
  const lastSent = useRef(0);
  const [sharing, setSharing] = useState(false);

  const startSharing = () => {

    if (!user?.id) {
      alert("User not logged in");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const now = Date.now();

        if (now - lastSent.current < 5000) return;

        lastSent.current = now;

        try {

          socket.emit("rider-location", {
            riderId: user.id,
            lat,
            lng,
          });

          // fallback HTTP
          await axios.post(`${API}/rider/${user.id}/location`, {
            lat,
            lng,
          });

          console.log("📍 location sent", lat, lng);

        } catch (err) {
          console.error("Location send error", err);
        }

      },
      (err) => {
        console.error("GPS error", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    setSharing(true);
    onSharingChange(true);
  };

  const stopSharing = () => {

    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
    }

    setSharing(false);
    onSharingChange(false);
  };

  return (
    <div className="flex gap-3 mt-4">

      {!sharing ? (
        <button
          onClick={startSharing}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Start Location Sharing
        </button>
      ) : (
        <button
          onClick={stopSharing}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Stop Location Sharing
        </button>
      )}

    </div>
  );
}