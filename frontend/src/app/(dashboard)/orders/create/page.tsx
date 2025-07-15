'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreatePOPage() {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [items, setItems] = useState([{ item_id: '', quantity: 1, unit_cost: 0 }]);

  useEffect(() => {
    axios.get('/api/vendors/').then(res => setVendors(res.data));
  }, []);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { item_id: '', quantity: 1, unit_cost: 0 }]);

  const submitPO = async () => {
    try {
      const poRes = await axios.post('/api/purchase_orders/', {
        vendor: vendorId,
        status,
      });

      const poId = poRes.data.id;

      for (const item of items) {
        await axios.post('/api/purchase_order_items/', {
          purchase_order: poId,
          ...item,
        });
      }

      alert('Purchase Order created!');
    } catch (error) {
      console.error(error);
      alert('Error creating PO');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Purchase Order</h1>

      <label className="block mb-2">Vendor</label>
<select
  value={vendorId}
  onChange={(e) => setVendorId(e.target.value)}
  className="border p-2 mb-4 w-full"
>
  <option value="">Select a vendor</option>
  {Array.isArray(vendors) && vendors.map((vendor: any) => (
    <option key={vendor.vendor_id} value={vendor.vendor_id}>
      {vendor.company_name}
    </option>
  ))}
</select>

      <label className="block mb-2">Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2 mb-4 w-full"
      >
        <option value="DRAFT">Draft</option>
        <option value="APPROVED">Approved</option>
        <option value="SUBMITTED">Submitted</option>
      </select>

      <h2 className="font-semibold mt-6 mb-2">Items</h2>
      {items.map((item, index) => (
        <div key={index} className="mb-4 space-x-2">
          <input
            type="text"
            placeholder="Item ID"
            value={item.item_id}
            onChange={(e) => handleItemChange(index, 'item_id', e.target.value)}
            className="border p-1"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            className="border p-1"
          />
          <input
            type="number"
            placeholder="Unit Cost"
            value={item.unit_cost}
            onChange={(e) => handleItemChange(index, 'unit_cost', e.target.value)}
            className="border p-1"
          />
        </div>
      ))}

      <button onClick={addItem} className="text-blue-500 mb-4">
        + Add Item
      </button>
      <br />
      <button
        onClick={submitPO}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Purchase Order
      </button>
    </div>
  );
}
