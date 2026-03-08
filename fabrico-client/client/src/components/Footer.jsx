import { FaInstagram, FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const CONTACT_URL = `${import.meta.env.VITE_API_URL}/contact`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(CONTACT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to send");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => {
      setStatus("");
      }, 3000)
    } catch (err) {
      console.error(err);
      setStatus("error");
    }

    setLoading(false);
  };

  return (
    <footer className="bg-gradient-to-r from-[#8CE4FF]/40 to-[#FEEE91]/40 border-t mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-wide text-gray-900">
            Fabrico
          </h2>
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">
            Elevating your wardrobe with premium digital try-on experience.
          </p>

          <div className="flex gap-3 mt-4">
            <a href="https://instagram.com" target="_blank" className="p-2 rounded-full bg-white shadow hover:bg-gray-900 hover:text-white transition">
              <FaInstagram size={16} />
            </a>
            <a href="https://facebook.com" target="_blank" className="p-2 rounded-full bg-white shadow hover:bg-gray-900 hover:text-white transition">
              <FaFacebook size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" className="p-2 rounded-full bg-white shadow hover:bg-gray-900 hover:text-white transition">
              <FaTwitter size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" className="p-2 rounded-full bg-white shadow hover:bg-gray-900 hover:text-white transition">
              <FaLinkedin size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Quick Links</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li><Link to="/" onClick={scrollToTop} className="hover:text-gray-900 transition">Home</Link></li>
            <li><Link to="/cart" onClick={scrollToTop} className="hover:text-gray-900 transition">Cart</Link></li>
            <li><Link to="/your-orders" onClick={scrollToTop} className="hover:text-gray-900 transition">Orders</Link></li>
            <li><Link to="/login" onClick={scrollToTop} className="hover:text-gray-900 transition">Sign In</Link></li>
            <li><Link to="/register" onClick={scrollToTop} className="hover:text-gray-900 transition">Create Account</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Contact Info</h3>

          <div className="space-y-3 text-gray-700 text-sm">

            <div className="bg-white/70 p-2.5 rounded-lg shadow border">
              <p className="font-semibold text-gray-900">📍 Location</p>
              <p>Thane, Maharashtra, India</p>
            </div>

            <div className="bg-white/70 p-2.5 rounded-lg shadow border">
              <p className="font-semibold text-gray-900">📧 Email</p>
              <p>palkaronkar65@gmail.com</p>
            </div>

            <div className="bg-white/70 p-2.5 rounded-lg shadow border">
              <p className="font-semibold text-gray-900">📞 Phone</p>
              <p>+91 7820875231</p>
            </div>

          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Send a Message</h3>

          {status === "success" && (
            <p className="mb-2 p-2 bg-green-100 text-green-700 rounded text-xs">
              Message sent successfully!
            </p>
          )}
          {status === "error" && (
            <p className="mb-2 p-2 bg-red-100 text-red-700 rounded text-xs">
              Failed to send. Try again.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-white shadow-sm text-sm"
            />

            <input
              type="email"
              required
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-white shadow-sm text-sm"
            />

            <textarea
              rows="3"
              required
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-white shadow-sm text-sm"
            ></textarea>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition text-sm"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="text-center text-gray-600 text-xs py-4 border-t bg-white/40 backdrop-blur-sm">
        © {new Date().getFullYear()} Fabrico — All Rights Reserved.
      </div>
    </footer>
  );
}
