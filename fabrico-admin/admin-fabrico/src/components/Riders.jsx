import React, { useState, useEffect } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/riders`; // adjust backend URL


export default function Riders() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRider, setNewRider] = useState({ username: "", password: "", name: "" });
  const [editing, setEditing] = useState(null);
  const [locations, setLocations] = useState({}); // { riderId: {lat,lng,updatedAt} }

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setRiders(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const fetchLocation = async (id) => {
    try {
      const res = await axios.get(`${API}/${id}/location`);
      setLocations((prev) => ({
        ...prev,
        [id]: res.data.location,
      }));
    } catch (err) {
      console.error("Location fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, newRider);
      setNewRider({ username: "", password: "", name: "" });
      fetchRiders();
    } catch (err) {
      alert("Failed to add rider");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API}/${id}`, {
        name: editing.name,
        password: editing.password,
      });
      setEditing(null);
      fetchRiders();
    } catch (err) {
      alert("Failed to update rider");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rider?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchRiders();
    } catch (err) {
      alert("Failed to delete rider");
    }
  };

  if (loading) return <div className="p-6">Loading riders...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Riders Management</h1>

      {/* Add new rider */}
      <form onSubmit={handleAdd} className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Username"
          value={newRider.username}
          onChange={(e) => setNewRider({ ...newRider, username: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newRider.password}
          onChange={(e) => setNewRider({ ...newRider, password: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={newRider.name}
          onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
        >
          Add Rider
        </button>
      </form>

      {/* Rider list */}
      <div className="space-y-3">
        {riders.map((r) => (
          <div key={r._id} className="border rounded p-3">
            {editing?._id === r._id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="border p-1 rounded w-full"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  className="border p-1 rounded w-full"
                />
                <div className="space-x-2">
                  <button
                    onClick={() => handleUpdate(r._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{r.name}</div>
                  <div className="text-sm text-gray-600">Username: {r.username}</div>
                  {locations[r._id] ? (
                    <div className="text-xs text-gray-500 mt-1">
                      📍 {locations[r._id].lat}, {locations[r._id].lng} <br />
                      ⏰ {new Date(locations[r._id].updatedAt).toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1">No location</div>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setEditing({ ...r, password: "" })}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => fetchLocation(r._id)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                  >
                    Show Location
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
