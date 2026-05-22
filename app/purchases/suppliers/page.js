'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading suppliers...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Suppliers</h1>
        <Link href="/purchases/suppliers/new" className="btn-primary">
          + Add Supplier
        </Link>
      </div>
      
      {suppliers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏭</div>
          <div className="empty-state-title">No suppliers yet</div>
          <div className="empty-state-text">Add your first supplier</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.email || '-'}</td>
                    <td>{supplier.phone || '-'}</td>
                    <td>{supplier.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}