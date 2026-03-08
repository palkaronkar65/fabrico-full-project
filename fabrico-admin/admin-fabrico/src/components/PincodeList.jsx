// client/src/components/PincodeList.jsx
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import React from "react";

const PincodeList = ({ pincodes, onDeleted }) => {

    const handleDelete = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/pincodes/${id}`);
    toast.success('Pincode deleted');
    onDeleted(id);
  } catch {
    toast.error('Failed to delete pincode');
  }
};

  return (
    <table className="w-full table-auto">
      <thead>
        <tr className="bg-gray-100">
          {['Pincode','City','Taluka','District','State','Actions'].map(h => (
            <th key={h} className="px-4 py-2 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pincodes.map(pc => (
          <tr key={pc._id} className="border-b">
            <td className="px-4 py-2">{pc.pincode}</td>
            <td className="px-4 py-2">{pc.city}</td>
            <td className="px-4 py-2">{pc.taluka}</td>
            <td className="px-4 py-2">{pc.district}</td>
            <td className="px-4 py-2">{pc.state}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => handleDelete(pc._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PincodeList;
