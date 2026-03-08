// Orders.jsx (responsive with Tailwind CSS)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  PencilIcon,
  SaveIcon,
  FilterIcon,
  RefreshIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/outline";

const API = `${import.meta.env.VITE_API_URL}/api`;

   
const STATUS_OPTIONS = [
  "Order Placed",
  "Packed / Processing",
  "Shipped / Dispatched",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];
const PAYMENT_OPTIONS = ["Pending", "Paid", "Failed"];
const RETURN_OPTIONS = [
  "",
  "Return Requested",
  "Return Approved / Pickup Scheduled",
  "Return Picked Up",
  "Return in Transit",
  "Return Completed",
  "Refund Initiated",
  "Refund Completed",
];

function formatDate(dt) {
  if (!dt) return "-";
  try {
    return format(new Date(dt), "dd MMM yyyy, hh:mm a");
  } catch {
    return String(dt);
  }
}
function toDateTimeLocal(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAddress, setExpandedAddress] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editing, setEditing] = useState({ orderId: null, field: null, value: "" });
  const [showFilters, setShowFilters] = useState(false);

  // fetch orders
  const fetchOrders = async (opts = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (opts.from || fromDate) params.from = opts.from || fromDate;
      if (opts.to || toDate) params.to = opts.to || toDate;
      const res = await axios.get(`${API}/orders`, { params });
      const data = Array.isArray(res.data) ? res.data : res.data.data || res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      alert("Failed to fetch orders. See console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const refresh = () => fetchOrders({ from: fromDate, to: toDate });

  // Generic PUT update
  const updateOrder = async (id, payload) => {
    try {
      const res = await axios.put(`${API}/orders/${id}`, payload);
      const updated = res.data?.order || res.data;
      if (updated) {
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...updated } : o)));
        return updated;
      } else {
        setOrders((prev) => prev.map((o) => (o._1 === id ? { ...o, ...payload } : o)));
        return payload;
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update order. See console.");
      return null;
    }
  };

  // delivery-route status update (robust)
  const updateStatusViaDeliveryRoute = async (id, status, riderName = null) => {
    try {
      const payload = { status, riderName };
      const res = await axios.post(`${API}/delivery/orders/${id}/status`, payload);
      const updated = res.data?.order || res.data;
      if (updated) {
        if (!updated.assignedTo) updated.assignedTo = {};
        setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...updated } : o)));
        return updated;
      }
      return true;
    } catch (err) {
      console.error("Delivery-route status update failed:", err);
      alert("Failed to update status via delivery route. See console.");
      return null;
    }
  };

  const saveStatus = (orderId, value) => updateOrder(orderId, { orderStatus: value });
  const savePaymentStatus = (orderId, value) => updateOrder(orderId, { paymentStatus: value });
  const saveEstimatedDelivery = (orderId, value) => {
    const iso = value ? new Date(value).toISOString() : null;
    updateOrder(orderId, { estimatedDelivery: iso });
  };

  const toggleOutForDelivery = async (order) => {
    const displayStatus = order.orderStatus || order.status;
    const newStatus = displayStatus === "Out for Delivery" ? "Packed / Processing" : "Out for Delivery";
    const riderName = order.assignedTo?.riderName || "Admin";
    const updated = await updateStatusViaDeliveryRoute(order._id, newStatus, riderName);
    if (!updated) {
      // fallback: try updating via generic PUT
      await updateOrder(order._id, { orderStatus: newStatus });
    }
  };

  const markDelivered = async (order) => {
    const riderName = order.assignedTo?.riderName || "Admin";
    const res = await updateStatusViaDeliveryRoute(order._id, "Delivered", riderName);
    if (res) {
      const updated = typeof res === "object" ? res : null;
      if (!updated) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === order._id
              ? {
                  ...o,
                  orderStatus: "Delivered",
                  inBucket: false,
                  assignedTo: {
                    ...(o.assignedTo || {}),
                    completed: true,
                    deliveredAt: new Date().toISOString(),
                  },
                }
              : o
          )
        );
      }
      alert("Delivery marked as Delivered.");
    }
  };

  // update return status: first try POST /orders/:id/return-status, if 404 fallback to PUT /orders/:id
  const updateReturnStatus = async (orderId, status) => {
    try {
      const res = await axios.post(`${API}/orders/${orderId}/return-status`, { returnStatus: status });
      const updated = res.data?.order || res.data;
      if (updated) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o)));
        return updated;
      } else {
        throw new Error("No updated order in response");
      }
    } catch (err) {
      console.warn("POST /return-status failed, trying PUT /orders/:id as fallback", err?.message || err);
      try {
        const res2 = await axios.put(`${API}/orders/${orderId}`, { returnStatus: status });
        const updated2 = res2.data?.order || res2.data;
        if (updated2) {
          setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, ...updated2 } : o)));
          return updated2;
        } else {
          setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, returnStatus: status } : o)));
          return { returnStatus: status };
        }
      } catch (err2) {
        console.error("Failed to update return status via fallback PUT:", err2);
        alert("Failed to update return status. See console.");
        return null;
      }
    }
  };

  const acceptCancellation = async (order) => {
    if (!window.confirm("Accept cancellation? This will set orderStatus to 'Cancelled'.")) return;
    const updated = await updateOrder(order._id, { orderStatus: "Cancelled", cancellationRequested: false });
    if (updated) setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, inBucket: false } : o)));
  };
  const rejectCancellation = async (order) => {
    if (!window.confirm("Reject cancellation request?")) return;
    await updateOrder(order._id, { cancellationRequested: false });
  };

  // filter logic
  const filtered = orders.filter((o) => {
    const term = searchTerm.trim().toLowerCase();
    const displayName = (o.customerName || o.user?.name || "").toLowerCase();
    const matchesSearch =
      !term ||
      (o._id && String(o._id).toLowerCase().includes(term)) ||
      displayName.includes(term) ||
      (o.user?.mobile && o.user.mobile.includes(term));
    const displayStatus = o.orderStatus || o.status;
    const matchesStatus = statusFilter === "All" || displayStatus === statusFilter;
    const matchesPayment = paymentFilter === "All" || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) return <div className="p-6 text-center">Loading orders...</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Order Management (Admin)</h1>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="px-3 py-2 bg-gray-100 rounded flex items-center gap-2 text-sm md:text-base">
            <RefreshIcon className="w-4 h-4" /> <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Filters</h2>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="md:hidden flex items-center gap-1 text-blue-600"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'} 
            {showFilters ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </button>
        </div>
        
        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              placeholder="Search by ID / name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-full md:flex-grow md:min-w-[220px]"
            />
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5 text-gray-600" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border px-2 py-2 rounded w-full md:w-auto">
                  <option>All</option>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border px-2 py-2 rounded w-full md:w-auto">
                <option>All</option>
                {PAYMENT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:flex md:items-center gap-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="text-sm">From</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-2 py-2 rounded" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="text-sm">To</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-2 py-2 rounded" />
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button onClick={() => fetchOrders({ from: fromDate, to: toDate })} className="px-3 py-2 bg-blue-600 text-white rounded flex-1 md:flex-none">Apply</button>
                <button onClick={() => { setFromDate(""); setToDate(""); fetchOrders(); }} className="px-3 py-2 bg-gray-200 rounded flex-1 md:flex-none">Clear</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders table - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Items</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-left">Payment</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Placed</th>
              <th className="p-2 text-left">Address</th>
              <th className="p-2 text-left">Assigned</th>
              <th className="p-2 text-left">Return</th>
              <th className="p-2 text-left">Cancel</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((order) => {
              const orderId = order._id;
              const currentEditing = editing.orderId === orderId ? editing : null;
              const displayStatus = order.orderStatus || order.status;
              return (
                <React.Fragment key={orderId}>
                  <tr className="border-b hover:bg-gray-50 align-top">
                    <td className="p-2 font-mono text-sm">#{String(orderId).slice(-6).toUpperCase()}</td>
                    <td className="p-2 text-sm">
                      <div className="font-medium">{order.customerName || order.user?.name || "N/A"}</div>
                    </td>
                    <td className="p-2 text-sm">
                      {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((it, i) => (
                        <div key={i} className="text-xs"> {it.product?.name || "Item"} × {it.quantity}</div>
                      )) : <div className="text-xs">—</div>}
                    </td>
                    <td className="p-2 text-right">₹{order.totalAmount}</td>

                    <td className="p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <select value={order.paymentStatus || "Pending"} onChange={(e) => savePaymentStatus(orderId, e.target.value)} className="border text-xs px-1">
                          {PAYMENT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                        </select>
                        <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                      </div>
                      <div className="mt-1 text-xs">
                        <label className="text-gray-500 mr-1">Estimated:</label>
                        {order.estimatedDelivery ? <span className="text-xs">{formatDate(order.estimatedDelivery)}</span> : <span className="text-xs text-gray-400">—</span>}
                      </div>
                      <div className="mt-1">
                        {currentEditing && currentEditing.field === "estimatedDelivery" ? (
                          <>
                            <input type="datetime-local" value={currentEditing.value} onChange={(e) => setEditing((s) => ({ ...s, value: e.target.value }))} className="border text-xs px-1 py-0.5 rounded" />
                            <button onClick={() => saveEstimatedDelivery(orderId, editing.value)} className="ml-2 px-2 py-0.5 bg-green-600 text-white rounded text-xs"><SaveIcon className="w-4 h-4 inline" /></button>
                          </>
                        ) : (
                          <button onClick={() => setEditing({ orderId, field: "estimatedDelivery", value: toDateTimeLocal(order.estimatedDelivery) })} className="text-xs text-blue-600 underline">Edit Est</button>
                        )}
                      </div>
                    </td>

                    <td className="p-2 text-sm">
                      {currentEditing && currentEditing.field === "orderStatus" ? (
                        <div className="flex items-center gap-1">
                          <select value={currentEditing.value} onChange={(e) => setEditing({ orderId, field: "orderStatus", value: e.target.value })} className="border text-xs px-1">
                            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          <button onClick={() => saveStatus(orderId, editing.value)} className="ml-1 px-2 py-0.5 bg-green-600 text-white rounded"><SaveIcon className="w-4 h-4 inline" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100">{displayStatus}</span>
                          <button onClick={() => setEditing({ orderId, field: "orderStatus", value: displayStatus })} title="Edit status"><PencilIcon className="w-4 h-4 text-gray-600" /></button>
                        </div>
                      )}
                    </td>

                    <td className="p-2 text-xs">{formatDate(order.createdAt)}</td>

                    <td className="p-2 text-sm">
                      <button onClick={() => setExpandedAddress(expandedAddress === orderId ? null : orderId)} className="text-blue-600 underline text-xs">
                        {order.address?.city || order.shippingAddress?.city || order.shippingAddress?.pincode || "View"}
                      </button>
                    </td>

                    <td className="p-2 text-sm">
                      <div className="text-xs">Rider: {order.assignedTo?.riderName || "Not Assigned"}</div>
                      <div className="text-xs">Completed: {order.assignedTo?.completed ? "Yes" : "No"}</div>
                    </td>

                    {/* RETURN: compact dropdown */}
                    <td className="p-2 text-sm">
                      <div className="text-xs mb-1">{order.returnStatus || "N/A"}</div>
                      <select
                        className="border px-2 py-1 text-xs rounded"
                        value={order.returnStatus || ""}
                        onChange={(e) => updateReturnStatus(orderId, e.target.value || null)}
                      >
                        <option value="">-- set return status --</option>
                        {RETURN_OPTIONS.filter(Boolean).map((rs) => (
                          <option key={rs} value={rs}>
                            {rs}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2 text-sm">
                      {order.cancellationRequested ? (
                        <>
                          <div className="text-xs text-red-600">Cancellation Requested</div>
                          <div className="text-xs mb-1">{order.cancellationReason || "Reason not provided"}</div>
                          <div className="flex gap-2">
                            <button onClick={() => acceptCancellation(order)} className="px-2 py-0.5 bg-red-600 text-white rounded text-xs">Accept</button>
                            <button onClick={() => rejectCancellation(order)} className="px-2 py-0.5 bg-gray-300 rounded text-xs">Reject</button>
                          </div>
                        </>
                      ) : (<div className="text-xs">—</div>)}
                    </td>
                  </tr>

                  {expandedAddress === orderId && (
                    <tr className="bg-gray-50">
                      <td colSpan="11" className="p-3 text-sm text-gray-700">
                        <strong>Full Address:</strong>
                        <div className="mt-1">
                          {order.shippingAddress?.name && <>{order.shippingAddress.name}<br/></>}
                          {order.shippingAddress?.mobile && <>Mobile: {order.shippingAddress.mobile}<br/></>}
                          {order.shippingAddress?.addressLine1 && <>{order.shippingAddress.addressLine1}<br/></>}
                          {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2}<br/></>}
                          {order.shippingAddress?.landmark && <>Landmark: {order.shippingAddress.landmark}<br/></>}
                          {order.shippingAddress?.city && <>City: {order.shippingAddress.city}, {order.shippingAddress.taluka}<br/></>}
                          {order.shippingAddress?.district && <>District: {order.shippingAddress.district}<br/></>}
                          {order.shippingAddress?.pincode && <>Pincode: {order.shippingAddress.pincode}<br/></>}
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><strong>Delivered:</strong> {formatDate(order.deliveredAt)}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - visible only on mobile */}
      <div className="md:hidden space-y-4">
        {filtered.map((order) => {
          const orderId = order._id;
          const currentEditing = editing.orderId === orderId ? editing : null;
          const displayStatus = order.orderStatus || order.status;
          const isExpanded = expandedOrder === orderId;
          
          return (
            <div key={orderId} className="border rounded-lg overflow-hidden bg-white shadow">
              {/* Order Summary */}
              <div 
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">#{String(orderId).slice(-6).toUpperCase()}</div>
                  <div className="text-sm mt-1">{order.customerName || order.user?.name || "N/A"}</div>
                  <div className="text-xs text-gray-500">{order.user?.mobile || "-"}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{order.totalAmount}</div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                    displayStatus === "Delivered" ? "bg-green-100 text-green-800" :
                    displayStatus === "Cancelled" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {displayStatus}
                  </div>
                </div>
                <div className="ml-2">
                  {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 border-t">
                  {/* Items */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Items</h3>
                    {Array.isArray(order.items) && order.items.length > 0 ? order.items.map((it, i) => (
                      <div key={i} className="text-xs">• {it.product?.name || "Item"} × {it.quantity}</div>
                    )) : <div className="text-xs">—</div>}
                  </div>
                  
                  {/* Payment */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Payment</h3>
                    <div className="flex items-center gap-2">
                      <select value={order.paymentStatus || "Pending"} onChange={(e) => savePaymentStatus(orderId, e.target.value)} className="border text-xs px-2 py-1 rounded">
                        {PAYMENT_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                    </div>
                    <div className="mt-1 text-xs">
                      <span className="text-gray-500">Est: </span>
                      {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : "—"}
                    </div>
                    <div className="mt-1">
                      {currentEditing && currentEditing.field === "estimatedDelivery" ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input 
                            type="datetime-local" 
                            value={currentEditing.value} 
                            onChange={(e) => setEditing((s) => ({ ...s, value: e.target.value }))} 
                            className="border text-xs px-2 py-1 rounded flex-1" 
                          />
                          <button onClick={() => saveEstimatedDelivery(orderId, editing.value)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                            <SaveIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setEditing({ orderId, field: "estimatedDelivery", value: toDateTimeLocal(order.estimatedDelivery) })} 
                          className="text-xs text-blue-600 underline mt-1"
                        >
                          Edit Estimated Delivery
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Status</h3>
                    {currentEditing && currentEditing.field === "orderStatus" ? (
                      <div className="flex items-center gap-2">
                        <select 
                          value={currentEditing.value} 
                          onChange={(e) => setEditing({ orderId, field: "orderStatus", value: e.target.value })} 
                          className="border text-xs px-2 py-1 rounded flex-1"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => saveStatus(orderId, editing.value)} className="px-2 py-1 bg-green-600 text-white rounded">
                          <SaveIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100">{displayStatus}</span>
                        <button onClick={() => setEditing({ orderId, field: "orderStatus", value: displayStatus })} title="Edit status">
                          <PencilIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Placed */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Order Placed</h3>
                    <div className="text-xs">{formatDate(order.createdAt)}</div>
                  </div>
                  
                  {/* Address */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Address</h3>
                    <button 
                      onClick={() => setExpandedAddress(expandedAddress === orderId ? null : orderId)} 
                      className="text-blue-600 underline text-xs"
                    >
                      {expandedAddress === orderId ? "Hide Address" : "View Full Address"}
                    </button>
                    {expandedAddress === orderId && (
                      <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2 rounded">
                        {order.shippingAddress?.name && <div>{order.shippingAddress.name}</div>}
                        {order.shippingAddress?.mobile && <div>Mobile: {order.shippingAddress.mobile}</div>}
                        {order.shippingAddress?.addressLine1 && <div>{order.shippingAddress.addressLine1}</div>}
                        {order.shippingAddress?.addressLine2 && <div>{order.shippingAddress.addressLine2}</div>}
                        {order.shippingAddress?.landmark && <div>Landmark: {order.shippingAddress.landmark}</div>}
                        {order.shippingAddress?.city && <div>City: {order.shippingAddress.city}, {order.shippingAddress.taluka}</div>}
                        {order.shippingAddress?.district && <div>District: {order.shippingAddress.district}</div>}
                        {order.shippingAddress?.pincode && <div>Pincode: {order.shippingAddress.pincode}</div>}
                      </div>
                    )}
                  </div>
                  
                  {/* Assigned */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Assigned</h3>
                    <div className="text-xs">Rider: {order.assignedTo?.riderName || "Not Assigned"}</div>
                    <div className="text-xs">AssignedAt: {order.assignedTo?.assignedAt ? formatDate(order.assignedTo.assignedAt) : "-"}</div>
                    <div className="text-xs">DeliveredAt: {order.assignedTo?.deliveredAt ? formatDate(order.assignedTo.deliveredAt) : "-"}</div>
                    <div className="text-xs">Completed: {order.assignedTo?.completed ? "Yes" : "No"}</div>
                  </div>
                  
                  {/* Return Status */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Return Status</h3>
                    <div className="text-xs mb-1">{order.returnStatus || "N/A"}</div>
                    <select
                      className="border px-2 py-1 text-xs rounded w-full"
                      value={order.returnStatus || ""}
                      onChange={(e) => updateReturnStatus(orderId, e.target.value || null)}
                    >
                      <option value="">-- set return status --</option>
                      {RETURN_OPTIONS.filter(Boolean).map((rs) => (
                        <option key={rs} value={rs}>
                          {rs}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Cancellation */}
                  <div className="mb-3">
                    <h3 className="font-medium text-sm mb-1">Cancellation</h3>
                    {order.cancellationRequested ? (
                      <>
                        <div className="text-xs text-red-600">Cancellation Requested</div>
                        <div className="text-xs mb-2">{order.cancellationReason || "Reason not provided"}</div>
                        <div className="flex gap-2">
                          <button onClick={() => acceptCancellation(order)} className="px-3 py-1 bg-red-600 text-white rounded text-xs flex-1">Accept</button>
                          <button onClick={() => rejectCancellation(order)} className="px-3 py-1 bg-gray-300 rounded text-xs flex-1">Reject</button>
                        </div>
                      </>
                    ) : (<div className="text-xs">—</div>)}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {displayStatus === "Out for Delivery" && (
                      <button 
                        onClick={() => markDelivered(order)} 
                        className="px-3 py-2 bg-green-600 text-white rounded text-xs flex-1"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {(displayStatus === "Packed / Processing" || displayStatus === "Shipped / Dispatched") && (
                      <button 
                        onClick={() => toggleOutForDelivery(order)} 
                        className="px-3 py-2 bg-blue-600 text-white rounded text-xs flex-1"
                      >
                        Out for Delivery
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}