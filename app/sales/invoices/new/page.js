'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Typeahead from '@/components/Typeahead';

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_rate: 7.5,
    notes: '',
    items: [{ product_id: '', product_name: '', description: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/sales/customers'),
        fetch('/api/sales/products')
      ]);
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (name) => {
    const res = await fetch('/api/sales/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: '', phone: '', address: '' })
    });
    if (res.ok) {
      const newCustomer = await res.json();
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    }
    return null;
  };

  const handleAddProduct = async (name) => {
    const res = await fetch('/api/sales/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: '', price: 0, sku: '' })
    });
    if (res.ok) {
      const newProduct = await res.json();
      setProducts([...products, newProduct]);
      return newProduct;
    }
    return null;
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', product_name: '', description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    
    if (field === 'product') {
      updatedItems[index].product_id = value.id;
      updatedItems[index].product_name = value.name;
      updatedItems[index].unit_price = value.price || 0;
    } else if (field === 'quantity') {
      updatedItems[index].quantity = parseInt(value) || 0;
    } else if (field === 'unit_price') {
      updatedItems[index].unit_price = parseFloat(value) || 0;
    } else if (field === 'description') {
      updatedItems[index].description = value;
    }
    
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
    
    if (!selectedCustomer) {
      alert('Please select a customer');
      setSubmitting(false);
      return;
    }
    
    const validItems = formData.items.filter(item => item.product_name && item.quantity > 0 && item.unit_price > 0);
    
    if (validItems.length === 0) {
      alert('Please add at least one valid item');
      setSubmitting(false);
      return;
    }
    
    try {
      const res = await fetch('/api/sales/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          date: formData.date,
          due_date: formData.due_date,
          tax_rate: formData.tax_rate,
          notes: formData.notes,
          items: validItems.map(item => ({
            product_name: item.product_name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`Invoice ${data.invoice.invoice_number} created successfully!`);
        router.push('/sales/invoices');
      } else {
        alert(data.error || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Network error. Please try again.');
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h1>Create New Invoice</h1>
      
      <form onSubmit={handleSubmit} className="card">
        {/* Customer Section */}
        <div className="form-section">
          <h2 className="form-section-title">Customer Information</h2>
          <Typeahead
            items={customers}
            onSelect={setSelectedCustomer}
            onAddNew={handleAddCustomer}
            placeholder="Search or add new customer..."
            displayKey="name"
            valueKey="id"
          />
          {selectedCustomer && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--success)' }}>
              ✓ Selected: {selectedCustomer.name}
            </div>
          )}
        </div>
        
        {/* Invoice Details */}
        <div className="form-section">
          <h2 className="form-section-title">Invoice Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Invoice Date</label>
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
        </div>
        
        {/* Items Section */}
        <div className="form-section">
          <h2 className="form-section-title">Invoice Items</h2>
          
          <div className="table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Product/Service</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '20%' }}>Unit Price (₦)</th>
                  <th style={{ width: '20%' }}>Total (₦)</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <Typeahead
                        items={products}
                        onSelect={(product) => updateItem(idx, 'product', product)}
                        onAddNew={handleAddProduct}
                        placeholder="Search or add new product..."
                        displayKey="name"
                        valueKey="id"
                        value={item.product_name}
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        style={{ width: '100%', marginTop: '8px', fontSize: '12px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        min="1"
                        step="1"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="amount-positive">
                      {formatNaira(item.quantity * item.unit_price)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        disabled={formData.items.length === 1}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button type="button" onClick={addItem} className="btn-secondary" style={{ marginTop: '12px' }}>
            + Add Item
          </button>
        </div>
        
        {/* Tax and Totals */}
        <div className="form-section">
          <div className="form-group" style={{ maxWidth: '300px', marginLeft: 'auto' }}>
            <label>Tax Rate (%)</label>
            <input
              type="number"
              value={formData.tax_rate}
              onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
              step="0.1"
              min="0"
            />
          </div>
          
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <div className="totals-line">
              <span>Subtotal:</span>
              <span>{formatNaira(calculateSubtotal())}</span>
            </div>
            <div className="totals-line">
              <span>Tax ({formData.tax_rate}%):</span>
              <span>{formatNaira(calculateTax())}</span>
            </div>
            <div className="totals-line grand-total">
              <span>Total:</span>
              <span>{formatNaira(calculateTotal())}</span>
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="form-section">
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
              placeholder="Thank you for your business! Payment is due within 30 days."
              style={{ width: '100%' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}