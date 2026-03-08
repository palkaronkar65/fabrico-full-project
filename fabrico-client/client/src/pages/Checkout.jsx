import React, { useState, useEffect } from 'react'; // Added useEffect import
import { useLocation, useNavigate } from 'react-router-dom';
import DeliveryAddress from '../components/checkout/DeliveryAddress';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentOptions from '../components/checkout/PaymentOptions';


const Checkout = () => {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { product, cartItems } = location.state || {};
  const currentProduct = product || (cartItems && cartItems[0]?.productId);

useEffect(() => {
  if (cartItems && cartItems.length > 0) {
    setSelectedVariant(cartItems[0].variantIndex || 0);
    setQuantity(cartItems[0].quantity || 1);
  }
}, [cartItems]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => step > 1 ? setStep(step - 1) : navigate(-1);

  const handleAddressSubmit = (addressData) => {
    setAddress(addressData);
    nextStep();
  };

  const handleOrderSubmit = (variant, qty) => {
    setSelectedVariant(variant);
    setQuantity(qty);
    nextStep();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between mb-8 border-b pb-4">
        <div className={`step ${step === 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-title">Delivery Address</span>
        </div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-title">Order Summary</span>
        </div>
        <div className={`step ${step === 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-title">Payment</span>
        </div>
      </div>

      {step === 1 && (
        <DeliveryAddress 
          onSubmit={handleAddressSubmit} 
          onCancel={prevStep}
        />
      )}

{step === 2 && currentProduct && (
  <OrderSummary
    product={currentProduct}
    initialVariant={selectedVariant}
    initialQuantity={quantity}
    onSubmit={handleOrderSubmit}
    onBack={prevStep}
  />
)}

      {step === 3 && currentProduct && address && (
        <PaymentOptions
          product={currentProduct}
          address={address}
          variantIndex={selectedVariant}
          quantity={quantity}
          onBack={prevStep}
        />
      )}
    </div>
  );
};

export default Checkout;