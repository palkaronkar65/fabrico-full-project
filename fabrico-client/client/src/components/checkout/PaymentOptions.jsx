import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useState } from "react";

const PaymentOptions = ({ product, address, variantIndex, quantity, onBack }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  if (!product || !address) return null;

  const variant = product.variants?.[variantIndex] || {};
  const totalPrice = product.price * quantity;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (!paymentMethod) throw new Error("Please select a payment method");

      // Common order data
      const orderData = {
        userId: currentUser._id,
        items: [{ productId: product._id, variantIndex, quantity }],
        shippingAddress: address,
        paymentMethod,
      };

      if (paymentMethod === "COD") {
        // Normal flow → just place order
        const response = await axios.post(`${API_URL}/api/orders`, orderData);
        if (response.data.success) {
          toast.success("Order placed successfully with COD!");
          navigate("/order-success", {
            state: {
              orderId: response.data.orderId,
              address,
              product,
              variantIndex,
              quantity,
              totalAmount: totalPrice,
            },
          });
        }
      }

      if (paymentMethod === "UPI") {
        // Step 1: Create Razorpay order from backend
        const { data } = await axios.post(`${API_URL}/api/payment/create-order`, {
          amount: totalPrice,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });

        if (!data.success) throw new Error("Failed to create Razorpay order");

        // Step 2: Configure Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 👈 frontend env
          amount: data.order.amount,
          currency: "INR",
          name: "My Store",
          description: "Order Payment",
          order_id: data.order.id,
          handler: async function (response) {
            try {
              // Step 3: Place order after successful payment
              const res = await axios.post(`${API_URL}/api/orders`, {
                ...orderData,
                paymentStatus: "Paid",
                razorpayPaymentId: response.razorpay_payment_id,
              });

              if (res.data.success) {
                toast.success("Payment successful, order placed!");
                navigate("/order-success", {
                  state: {
                    orderId: res.data.orderId,
                    address,
                    product,
                    variantIndex,
                    quantity,
                    totalAmount: totalPrice,
                  },
                });
              }
            } catch (err) {
              toast.error("Order placement failed after payment");
            }
          },
          prefill: {
            name: address.name,
            email: currentUser?.email || "test@example.com",
            contact: address.mobile,
          },
          theme: { color: "#2563eb" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.error || error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Payment Options</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Delivery Address + Order Details */}
        <div className="lg:col-span-2">
          {/* Delivery Address */}
          <div className="border rounded p-4 mb-6">
            <h3 className="font-medium mb-2">Delivery Address</h3>
            <p>{address.name}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} - {address.pincode}</p>
            <p>Mobile: {address.mobile}</p>
            {address.alternatePhone && <p>Alternate: {address.alternatePhone}</p>}
          </div>

          {/* Order Details */}
          <div className="border rounded p-4 mb-6">
            <h3 className="font-medium mb-2">Order Details</h3>
            <div className="flex items-center">
              {variant.images?.[0] ? (
                <img src={variant.images[0]} alt={product.name} className="w-16 h-16 mr-4 rounded object-cover" />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
              )}
              <div>
                <p className="font-medium">{product.name}</p>
                <p>Color: {variant.color}</p>
                <p>Quantity: {quantity}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <p>Total Amount:</p>
              <p className="font-semibold">₹{totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Right side: Payment */}
        <div>
          <div className="border rounded p-4">
            <h3 className="font-medium mb-3">Select Payment Method</h3>
            <div className="space-y-3">
              {product.codAvailable ? (
                <label className="flex items-center p-3 border rounded cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium">Cash on Delivery (COD)</span>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </label>
              ) : (
                <div className="p-3 text-sm text-gray-500">COD not available</div>
              )}

              <label className="flex items-center p-3 border rounded cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={() => setPaymentMethod("UPI")}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">UPI</span>
                  <p className="text-sm text-gray-500">Pay instantly using UPI</p>
                </div>
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={!paymentMethod || isProcessing}
              className={`w-full mt-6 py-3 rounded font-medium ${
                !paymentMethod || isProcessing
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>

      <button onClick={onBack} className="mt-4 px-4 py-2 border rounded hover:bg-gray-100">
        Back
      </button>
    </div>
  );
};

export default PaymentOptions;
