import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const DeliveryAddress = ({ onSubmit, onCancel }) => {
  const [locationLoading, setLocationLoading] = useState(false);
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city:'',
    taluka: '',
    district: '',
    state: 'Maharashtra',
    landmark: '',
    alternatePhone: '',
    addressType: 'Home',
    location: null,
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [pincodeValid, setPincodeValid] = useState(false);
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser?._id) {
        try {
          const response = await axios.get(
            `${API_URL}/api/address/${currentUser._id}/addresses`
          );
          setAddresses(response.data || []);
          if (response.data.length === 0) {
            setShowForm(true);
            setFormData(prev => ({
              ...prev,
              name: currentUser?.name || '',
              mobile: currentUser?.phone || '',
              isDefault: true
            }));
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          toast.error('Failed to load addresses');
        }
      }
    };
    fetchAddresses();
  }, [currentUser]);

  const handleUseCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              type: 'Point',
              coordinates: [
                position.coords.longitude,
                position.coords.latitude
              ]
            }
          }));
          toast.success('Location captured');
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get location. Enter manually.');
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation not supported');
      setLocationLoading(false);
    }
  };

const checkPincodeValidity = async (pincode) => {
  try {
    setIsCheckingPincode(true);
    const response = await axios.get(
      `${API_URL}/api/pincodes/check/${pincode}`,
      {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status !== 200) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
    
    if (!response.data || typeof response.data.valid !== 'boolean') {
      throw new Error('Invalid response format');
    }
    
    return response.data.valid;
  } catch (error) {
    console.error('Pincode validation error:', error);
    
    let errorMessage = 'Error validating pincode';
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || 'Server error';
    } else if (error.request) {
      // Request was made but no response
      errorMessage = 'No response from server';
    }
    
    toast.error(errorMessage);
    return false;
  } finally {
    setIsCheckingPincode(false);
  }
};

    const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data?.[0]?.Status === 'Success') {
        const postOffices = response.data[0].PostOffice;
        if (postOffices.length > 0) {
          const firstOffice = postOffices[0];
          return {
            taluka: firstOffice.Block || firstOffice.Taluka || firstOffice.District,
            district: firstOffice.District,
            state: firstOffice.State
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching pincode details:', error);
      toast.error('Failed to fetch pincode details');
      return null;
    }
  };

  const handleChange = async (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  if (name === 'pincode' && value.length === 6) {
    const trimmedPincode = value.trim();
    try {
      setIsCheckingPincode(true);

      const response = await axios.get(`${API_URL}/api/pincodes/check/${trimmedPincode}`, {
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

if (response.data.valid) {
   setPincodeValid(true);
  setFormData(prev => ({
    ...prev,
    city: response.data.city,
    taluka: response.data.taluka,
    district: response.data.district,
    state: response.data.state
  }));


  toast.success('Pincode is serviceable');
} else {
  setPincodeValid(false);
  toast.error(response.data.message || 'Delivery not available at this pincode');
}

    } catch (error) {
      console.error('Error validating pincode:', error);
      toast.error('Failed to validate pincode');
      setPincodeValid(false);
    } finally {
      setIsCheckingPincode(false);
    }
  } else if (name === 'pincode') {
    setPincodeValid(false); // Reset if incomplete
  }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location) {
      toast.error('Please capture your location');
      return;
    }
    
    if (!pincodeValid) {
      toast.error('Please enter a valid pincode where delivery is available');
      return;
    }

    setLoading(true);
    try {
      const addressData = { ...formData };
      if (!addressData._id) delete addressData._id;

      let response;
      if (addressData._id) {
        response = await axios.put(
          `${API_URL}/api/address/${currentUser._id}/addresses/${addressData._id}`,
          addressData
        );
      } else {
        if (addresses.length >= 3) {
          throw new Error('Address limit reached (max 3)');
        }
        response = await axios.post(
         `${API_URL}/api/address/${currentUser._id}/addresses`,
          addressData
        );
      }
      onSubmit(response.data);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      _id: address._id,
      name: address.name || '',
      mobile: address.mobile || '',
      pincode: address.pincode || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      taluka: address.taluka || '',
      district: address.district || '',
      state: address.state || 'Maharashtra',
      landmark: address.landmark || '',
      alternatePhone: address.alternatePhone || '',
      addressType: address.addressType || 'Home',
      location: address.location || null,
      isDefault: address.isDefault || false
    });
    setPincodeValid(true);
    setShowForm(true);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.put(
        `${API_URL}/api/address/${currentUser._id}/addresses/${addressId}/default`
      );
      const response = await axios.get(
       `${API_URL}/api/address/${currentUser._id}/addresses`
      );
      setAddresses(response.data);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const handleRemoveAddress = async (addressId) => {
    try {
      await axios.delete(
       `${API_URL}/api/address/${currentUser._id}/addresses/${addressId}`
      );
      const updatedAddresses = addresses.filter(addr => addr._id !== addressId);
      setAddresses(updatedAddresses);
      toast.success('Address removed');
    } catch (error) {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Delivery Address</h2>

      {!showForm ? (
        <>
          {addresses.length > 0 ? (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Saved Addresses</h3>
              {addresses.map(address => (
                <div
                  key={address._id}
                  className={`border rounded p-4 mb-3 ${
                    address.isDefault ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{address.name}</p>
                        {address.isDefault && (
                          <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p>{address.mobile}</p>
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.taluka}, {address.district}, {address.state} - {address.pincode}</p>
                      {address.landmark && <p>Landmark: {address.landmark}</p>}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveAddress(address._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => onSubmit(address)}
                      >
                        Deliver Here
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-6 text-center py-8">
              <p className="text-gray-600 mb-4">No saved addresses found</p>
            </div>
          )}

          {addresses.length < 3 && (
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded font-medium"
              onClick={() => {
                setFormData({
                  name: currentUser?.name || '',
                  mobile: currentUser?.phone || '',
                  pincode: '',
                  addressLine1: '',
                  addressLine2: '',
                  taluka: '',
                  district: '',
                  state: 'Maharashtra',
                  landmark: '',
                  alternatePhone: '',
                  addressType: 'Home',
                  location: null,
                  isDefault: addresses.length === 0
                });
                setPincodeValid(false);
                setShowForm(true);
              }}
            >
              + Add New Address
            </button>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number*</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData(prev => ({ ...prev, mobile: value }));
                }}
                className="w-full p-2 border rounded"
                pattern="[0-9]{10}"
                title="10-digit mobile number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1*</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pincode*</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                pattern="[0-9]{6}"
                required
              />
              {formData.pincode?.length === 6 && !pincodeValid && (
                <p className="text-red-500 text-sm mt-1">Delivery not available at this pincode</p>
              )}
              {pincodeValid && (
                <p className="text-green-500 text-sm mt-1">Delivery available at this pincode</p>
              )}
            </div>

             <div>
    <label className="block text-sm font-medium mb-1">City*</label>
    <input
      type="text"
      name="city"
      value={formData.city || ''}
      onChange={handleChange}
      className="w-full p-2 border rounded"
      required
    />
  </div>

            <div>
              <label className="block text-sm font-medium mb-1">Taluka*</label>
              <input
                type="text"
                name="taluka"
                value={formData.taluka || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District*</label>
              <input
                type="text"
                name="district"
                value={formData.district || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State*</label>
            <input
              type="text"
              name="state"
              value={formData.state || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex space-x-4">
            <label className={`flex items-center p-2 border rounded cursor-pointer ${
              formData.addressType === 'Home' ? 'border-blue-500 bg-blue-50' : ''
            }`}>
              <input
                type="radio"
                name="addressType"
                value="Home"
                checked={formData.addressType === 'Home'}
                onChange={handleChange}
                className="mr-2"
                required
              />
              Home
            </label>
            <label className={`flex items-center p-2 border rounded cursor-pointer ${
              formData.addressType === 'Work' ? 'border-blue-500 bg-blue-50' : ''
            }`}>
              <input
                type="radio"
                name="addressType"
                value="Work"
                checked={formData.addressType === 'Work'}
                onChange={handleChange}
                className="mr-2"
              />
              Work
            </label>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="flex items-center text-blue-600"
              disabled={locationLoading}
            >
              <FaMapMarkerAlt className="mr-1" />
              {locationLoading ? 'Fetching...' : 'Use My Current Location'}
            </button>
            {formData.location ? (
              <span className="ml-2 text-sm text-green-600">Location captured</span>
            ) : (
              <span className="ml-2 text-sm text-red-500">Location required</span>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading || !formData.location || !pincodeValid}
            >
              {loading ? 'Saving...' : 'Save & Deliver Here'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DeliveryAddress;