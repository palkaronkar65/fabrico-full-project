// client/src/components/PincodeForm.jsx
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import React from 'react';

const PincodeForm = ({onSaved}) => {
  const [form, setForm] = useState({ pincode: '', city: '', taluka: '', district: '', state: '' });

const handleSubmit = async e => {
  e.preventDefault();
  try {
    // Changed endpoint from /check to root endpoint
    await axios.post(`${import.meta.env.VITE_API_URL}/api/pincodes`, form);
    toast.success('Pincode saved');
    setForm({ pincode: '', city: '', taluka: '', district: '', state: '' });
    onSaved();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error saving pincode');
  }
};

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {['pincode','city','taluka','district','state'].map((field, i) => (
        <div key={i}>
          <label className="block text-sm font-medium mb-1">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type="text"
            name={field}
            value={form[field]}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      ))}
      <div className="md:col-span-5 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Pincode
        </button>
      </div>
    </form>
  );
};

export default PincodeForm;
