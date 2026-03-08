// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import UpdateCredentials from "../components/UpdateCredentials";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import AnalyticsCard from "../components/AnalyticsCard";
import PincodeForm from "../components/PincodeForm";
import PincodeList from "../components/PincodeList";
import Orders from "../components/Orders";
import Riders from "../components/Riders";
import Reviews from "../components/Reviews";
import {
  RefreshIcon
} from "@heroicons/react/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    categories: {},
  });
  const [pincodes, setPincodes] = useState([]);

  // NEW: selected product for editing in-place
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Rider management state
  const [riders, setRiders] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [editingRiderId, setEditingRiderId] = useState(null);

  // refresh key for Reviews (small refresh button)
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);

  useEffect(() => {
    if (activeTab === "dashboard") {
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/pincodes`)
        .then((res) => setPincodes(res.data))
        .catch(console.error);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/riders`);
      setRiders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRider = async (e) => {
    e.preventDefault();
    try {
      if (editingRiderId) {
        // Edit existing rider
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/riders/${editingRiderId}`, {
          username,
          password,
          name,
        });
        setRiders(prev => prev.map(r => (r._id === editingRiderId ? res.data : r)));
        setEditingRiderId(null); // Reset editing state
      } else {
        // Add new rider
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/riders`, {
          username,
          password,
          name,
        });
        setRiders(prev => [...prev, res.data]);
      }

      // Reset fields after add or edit
      setUsername("");
      setPassword("");
      setName("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRider = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/riders/${id}`);
      setRiders(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRider = (rider) => {
    setEditingRiderId(rider._id);
    setUsername(rider.username);
    setPassword(rider.password);
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products/stats`
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({
        totalProducts: 0,
        outOfStock: 0,
        categories: {},
        recentActivity: [],
      });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
      localStorage.removeItem("admin");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // NEW: called when ProductList Edit button clicked
  const handleEditProduct = (product) => {
    setActiveTab("products"); // ensure we are on products tab
    setSelectedProduct(product);
    // scroll to form
    setTimeout(() => {
      const el = document.querySelector("#product-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  // NEW: called after save to clear selectedProduct (passed to ProductForm)
  const handleProductSaved = () => {
    setSelectedProduct(null);
  };

  // small refresh handler used on Reviews tab
  const handleRefreshReviews = () => {
    // bump key to cause Reviews to re-mount / refresh
    setReviewsRefreshKey((k) => k + 1);
  };

  // icon set (simple inline SVGs) - keeps visual consistent and avoids extra dependencies
  const ICONS = {
    dashboard: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
      </svg>
    ),
    products: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9-4 9 4v8l-9 4-9-4V7z" />
      </svg>
    ),
    orders: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m6 6V7M3 7h18M5 7v10a1 1 0 001 1h12a1 1 0 001-1V7" />
      </svg>
    ),
    reviews: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-3-4 3V5a2 2 0 012-2h6a2 2 0 012 2z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09c.66 0 1.22-.4 1.51-1a1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 115.14 2.9l.06.06c.44.44 1.08.58 1.64.4.9-.27 1.83-.27 2.73 0 .56.18 1.2.04 1.64-.4l.06-.06A2 2 0 1113.6 4.6l-.06.06c-.44.44-.58 1.08-.4 1.64.27.9.27 1.83 0 2.73-.18.56-.04 1.2.4 1.64l.06.06A2 2 0 1116.9 18.86l-.06-.06c-.44-.44-1.08-.58-1.64-.4-.9.27-1.83.27-2.73 0-.56-.18-1.2-.04-1.64.4l-.06.06a2 2 0 11-2.83-2.83l.06-.06c.44-.44.58-1.08.4-1.64C6.13 8.83 6.13 7.9 6.4 7a1.65 1.65 0 00-.4-1.64L5.94 4.3A2 2 0 117.76 2.3l.06.06c.44.44 1.08.58 1.64.4.9-.27 1.83-.27 2.73 0 .56.18 1.2.04 1.64-.4l.06-.06A2 2 0 0116.9 4.6l-.06.06c-.44.44-.58 1.08-.4 1.64.27.9.27 1.83 0 2.73-.18.56-.04 1.2.4 1.64l.06.06A2 2 0 1119.4 15z" />
      </svg>
    ),
    logout: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8" />
      </svg>
    ),
    refreshSmall: (
      <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8a8 8 0 11-8-8" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen  flex">
      {/* ====== Desktop Sidebar ====== */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-indigo-700 text-white z-20">
        <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-600">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { tab: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
            { tab: "products", label: "Products", icon: ICONS.products },
            { tab: "orders", label: "Orders", icon: ICONS.orders },
            { tab: "reviews", label: "Reviews", icon: ICONS.reviews },
            { tab: "settings", label: "Settings", icon: ICONS.settings },
          ].map(({ tab, label, icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center w-full p-3 rounded-lg transition ${
                activeTab === tab ? "bg-indigo-600" : "hover:bg-indigo-600"
              }`}
            >
              <span className="flex-none">{icon}</span>
              <span className="flex-1 text-left">{label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg bg-indigo-800 hover:bg-indigo-900 transition"
          >
            <span className="flex-none">{ICONS.logout}</span>
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </div>

      {/* ====== Mobile Header ====== */}
      <header className="md:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-700"
          >
            {/* Hamburger */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* ====== Mobile Sidebar (Top Dropdown) ====== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="absolute top-0 left-0 right-0 bg-indigo-700 text-white rounded-b-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                {/* Close Icon */}
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-2">
              {[
                { tab: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
                { tab: "products", label: "Products", icon: ICONS.products },
                { tab: "orders", label: "Orders", icon: ICONS.orders },
                { tab: "reviews", label: "Reviews", icon: ICONS.reviews },
                { tab: "settings", label: "Settings", icon: ICONS.settings },
              ].map(({ tab, label, icon }) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    activeTab === tab ? "bg-indigo-600" : "hover:bg-indigo-600"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="flex-none">{icon}</span>
                    <span className="flex-1 text-left">{label}</span>
                  </div>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left p-3 rounded-lg bg-indigo-800 hover:bg-indigo-900 transition"
              >
                <div className="flex items-center">
                  <span className="flex-none">{ICONS.logout}</span>
                  <span className="flex-1 text-left">Logout</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* ====== Main Content ====== */}
      <main className="flex-1 md:ml-64 p-4 md:p-6 mt-14 md:mt-0 h-screen overflow-y-auto">
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow p-6">
            <Orders />
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white rounded-xl shadow p-6">
            {/* Reviews header with small refresh */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Reviews</h2>
              <button
                onClick={handleRefreshReviews}
                title="Refresh reviews"
             className="px-3 py-2 bg-gray-100 rounded flex items-center gap-2 text-sm md:text-base">
            <RefreshIcon className="w-4 h-4" /> <span className="hidden md:inline">Refresh</span>
          </button>
            </div>

            {/* Reviews component remounted when reviewsRefreshKey changes */}
            <div key={reviewsRefreshKey}>
              <Reviews />
            </div>
          </div>
        )}

        {/* Pincode Management */}
        {activeTab === "pincodes" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Pincode Management</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <PincodeForm
                onSaved={() =>
                  axios
                    .get(`${import.meta.env.VITE_API_URL}/api/pincodes`)
                    .then((r) => setPincodes(r.data))
                }
              />
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <PincodeList
                pincodes={pincodes}
                onDeleted={(id) => setPincodes((p) => p.filter((x) => x._id !== id))}
              />
            </div>
          </div>
        )}

        {/* Dashboard */}
        {/* Dashboard — Option 3 */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnalyticsCard
                title="Total Products"
                value={stats.totalProducts}
                icon="📦"
                trend="up"
                color="blue"
              />
              <AnalyticsCard
                title="Categories"
                value={Object.keys(stats.categories).length}
                icon="🏷️"
                trend="neutral"
                color="green"
              />
              <AnalyticsCard
                title="Out of Stock"
                value={stats.outOfStock}
                icon="⚠️"
                trend="down"
                color="red"
              />
            </div>

            {/* Split: Pincode left 60%, Recent right 40% */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Pincode Management — left 3/5 */}
              <div className="lg:col-span-3 bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Pincode Management</h3>
                <PincodeForm
                  onSaved={() =>
                    axios
                      .get(`${import.meta.env.VITE_API_URL}/api/pincodes`)
                      .then((res) => setPincodes(res.data))
                  }
                />
                <div className="mt-6 max-h-96 overflow-y-auto">
                  <PincodeList
                    pincodes={pincodes}
                    onDeleted={(id) => setPincodes((p) => p.filter((x) => x._id !== id))}
                  />
                </div>
              </div>

              {/* Recent Activity — right 2/5 */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {stats.recentActivity?.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition"
                      >
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <span className="text-blue-600">📝</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{activity.name}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-gray-600">Colors: {activity.colors}</p>
                            <p className="text-sm text-gray-600">Stock: {activity.stock}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}




        {/* Products */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
              <button
                onClick={() => {
                  // clear selected product to add new
                  setSelectedProduct(null);
                  setTimeout(() => {
                    const el = document.querySelector("#product-form");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 80);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Product
              </button>
            </div>

            {/* NEW: responsive two-column layout on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form column — fixed max height + independent scrollbar */}
              <div
                className="bg-white rounded-xl shadow p-6"
                id="product-form"
                style={{ maxHeight: 'calc(100vh - 6.5rem)', overflow: 'auto' }}
              >
                <ProductForm selectedProduct={selectedProduct} onSaved={handleProductSaved} />
              </div>

              {/* List column — fixed max height + independent scrollbar */}
              <div
                className="bg-white rounded-xl shadow p-6"
                style={{ maxHeight: 'calc(100vh - 6.5rem)', overflow: 'auto' }}
              >
                <h3 className="text-xl font-semibold mb-4">All Products</h3>
                <ProductList onEdit={handleEditProduct} />
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <UpdateCredentials />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}