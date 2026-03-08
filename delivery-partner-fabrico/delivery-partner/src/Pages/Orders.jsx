import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function getCurrentRiderFromStorage() {
  const keys = ["rider", "currentRider", "currentUser", "user", "authUser"];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      const id =
        parsed._id ||
        parsed.id ||
        parsed.userId ||
        parsed.riderId;

      const name =
        parsed.name ||
        parsed.fullName ||
        parsed.riderName ||
        parsed.username;

      if (id && name) return { id: String(id), name };
    } catch {
      if (key === "rider") return { id: raw, name: "Rider" };
    }
  }

  return null;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState("");
  const [processingOrderIds, setProcessingOrderIds] = useState(new Set());
  const [currentRider, setCurrentRider] = useState(null);

  useEffect(() => {
    const rider = getCurrentRiderFromStorage();
    setCurrentRider(rider);
  }, []);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API}/orders`);

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.orders || [];

        const packedOrders = data.filter(
          (order) => order.status === "Packed / Processing"
        );

        setOrders(packedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Fetch Pincodes
  useEffect(() => {
    const fetchPincodes = async () => {
      try {
        const res = await axios.get(`${API}/pincodes`);

        const list = Array.isArray(res.data)
          ? res.data
          : res.data.data || res.data.pincodes || [];

        setPincodes(list);
      } catch (err) {
        console.error("Failed to fetch pincodes:", err);
      }
    };

    fetchPincodes();
  }, []);

  // Filter Orders
  const filteredOrders = selectedPincode
    ? orders.filter((order) => {
        const orderPincode =
          (order.address?.split("-").pop() || "").trim();

        return orderPincode === selectedPincode;
      })
    : orders;

  // Toggle Bucket
  const toggleBucket = async (orderId) => {
    if (!currentRider) {
      alert("Please login as rider.");
      return;
    }

    setProcessingOrderIds((prev) => new Set(prev).add(orderId));

    try {
      const res = await axios.post(
        `${API}/orders/bucket/${orderId}/toggle`,
        {
          riderId: currentRider.id,
          riderName: currentRider.name,
        }
      );

      const returned = res.data?.order || res.data || res.data.data;

      setOrders((prev) =>
        prev.map((o) => {
          if (String(o._id) !== String(orderId)) return o;

          const newValues = {};

          if (returned.inBucket !== undefined)
            newValues.inBucket = returned.inBucket;

          if (returned.assignedTo !== undefined)
            newValues.assignedTo = returned.assignedTo;

          return { ...o, ...newValues };
        })
      );
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message;

      alert(msg);
      console.error("Toggle bucket error:", err);
    } finally {
      setProcessingOrderIds((prev) => {
        const copy = new Set(prev);
        copy.delete(orderId);
        return copy;
      });
    }
  };

  if (loading) return <p className="p-6">Loading orders...</p>;

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-4">
        Packed / Processing Orders
      </h1>

      {/* Pincode Filter */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">
          Filter by Pincode:
        </label>

        <select
          value={selectedPincode}
          onChange={(e) => setSelectedPincode(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">All Pincodes</option>

          {pincodes.map((p) => (
            <option key={p._id || p.pincode} value={p.pincode}>
              {p.pincode} - {p.city}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <ul className="space-y-4">
          {filteredOrders.map((order) => {
            const isInBucket = !!order.inBucket;

            const assignedRiderId =
              order.assignedTo?.riderId ||
              order.assignedTo?.riderId?._id;

            const sameRider =
              currentRider &&
              assignedRiderId &&
              String(assignedRiderId) === String(currentRider.id);

            const otherRider = isInBucket && !sameRider;

            const processing = processingOrderIds.has(order._id);

            const coords =
            order.shippingAddress?.location?.coordinates ||
            order.location?.coordinates ||
            null;

            return (
              <li
                key={order._id}
                className="border p-4 rounded bg-white shadow-sm"
              >
                <p><strong>Order ID:</strong> {order._id}</p>

                <p><strong>Customer:</strong> {order.customerName}</p>

                <p><strong>Address:</strong> {order.address}</p>

                <p><strong>Status:</strong> {order.status}</p>

                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </p>

                <p>
                  <strong>Payment Method:</strong> {order.paymentMethod}
                </p>

                <p>
                  <strong>In Bucket:</strong>{" "}
                  {isInBucket ? "Yes" : "No"}
                </p>

                <p>
                  <strong>Assigned To:</strong>{" "}
                  {order.assignedTo?.riderName || "Not Assigned"}
                </p>

                <p>
                  <strong>Total Amount:</strong> ₹{order.totalAmount}
                </p>

                <p>
                  <strong>Return Status:</strong>{" "}
                  {order.returnStatus || "N/A"}
                </p>

                {/* 📍 Coordinates */}
                {coords && (
                    <p className="text-sm text-gray-600">
                      📍 Coordinates: {coords[1]}, {coords[0]}
                    </p>
                  )}

                {/* Buttons */}
                <div className="mt-3 flex items-center gap-2">

                  {otherRider && (
                    <button
                      className="px-4 py-1 bg-gray-400 text-white rounded"
                      disabled
                    >
                      Order in bucket of {order.assignedTo?.riderName}
                    </button>
                  )}

                  {sameRider && (
                    <>
                      <button
                        className="px-4 py-1 bg-green-500 text-white rounded"
                        disabled
                      >
                        In Your Bucket
                      </button>

                      <button
                        className="px-4 py-1 bg-red-500 text-white rounded"
                        onClick={() => toggleBucket(order._id)}
                        disabled={processing}
                      >
                        {processing
                          ? "Removing..."
                          : "Remove from Bucket"}
                      </button>
                    </>
                  )}

                  {!isInBucket && (
                    <button
                      className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => toggleBucket(order._id)}
                      disabled={!currentRider || processing}
                    >
                      {processing
                        ? "Adding..."
                        : "Add to Bucket"}
                    </button>
                  )}

                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}