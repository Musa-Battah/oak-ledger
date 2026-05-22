'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/sales/invoices');
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error:', err);
      setInvoices([]);
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

  if (loading) return <div className="loading">Loading invoices...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Sales Invoices</h1>
        <Link href="/sales/invoices/new" className="btn-primary">
          + New Invoice
        </Link>
      </div>
      
      {invoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No invoices yet</div>
          <div className="empty-state-text">Create your first sales invoice</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                    <td>{inv.customer_name || '-'}</td>
                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                    <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td>{formatNaira(inv.total)}</td>
                    <td><span className="status-badge">Sent</span></td>
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