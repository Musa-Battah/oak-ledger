'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PurchaseBillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/purchases/bills');
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading bills...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Purchase Bills</h1>
        <Link href="/purchases/bills/new" className="btn-primary">
          + New Bill
        </Link>
      </div>
      
      {bills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No bills yet</div>
          <div className="empty-state-text">Create your first purchase bill</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td style={{ fontFamily: 'monospace' }}>{bill.bill_number}</td>
                    <td>{bill.supplier_name || '-'}</td>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                    <td>{formatNaira(bill.total)}</td>
                    <td><span className="status-badge">Received</span></td>
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