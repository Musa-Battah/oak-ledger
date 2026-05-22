'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBillPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    tax_rate: 0,
    items: [{ product_name: '', quantity: 1, unit_price: 0 }]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/purchases/suppliers');
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_name: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0;
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax_rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/purchases/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: formData.items.filter(item => item.product_name)
        })
      });
      
      if (res.ok) {
        router.push('/purchases/bills');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create bill');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div>
      <h1>Create Purchase Bill</h1>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Supplier</label>
          <select
            value={formData.supplier_id}
            onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Bill Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              required
            />
          </div>
        </div>
        
        <h3>Bill Items</h3>
        <div className="table-container">
          <table className="journal-table">
            <thead>
              <tr>
                <th>Product/Service</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => updateItem(idx, 'product_name', e.target.value)}
                      placeholder="Item description"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </td>
                  <td>{formatNaira(item.quantity * item.unit_price)}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(idx)} className="btn-danger" disabled={formData.items.length === 1}>
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button type="button" onClick={addItem} className="btn-secondary" style={{ marginTop: '10px' }}>
          + Add Item
        </button>
        
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Tax Rate (%)</label>
          <input
            type="number"
            value={formData.tax_rate}
            onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
            step="0.1"
            min="0"
          />
        </div>
        
        <div style={{ textAlign: 'right', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div>Subtotal: {formatNaira(calculateSubtotal())}</div>
          <div>Tax ({formData.tax_rate}%): {formatNaira(calculateTax())}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
            Total: {formatNaira(calculateTotal())}
          </div>
        </div>
        
        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '20px' }}>
          {submitting ? 'Creating Bill...' : 'Create Bill'}
        </button>
      </form>
    </div>
  );
}