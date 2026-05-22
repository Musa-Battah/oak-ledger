'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SalesOverview() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/sales/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error:', err);
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Sales Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{stats.totalInvoices}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatNaira(stats.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Customers</div>
          <div className="stat-value">{stats.customers}</div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link href="/sales/invoices/new" className="action-card">
          <h3>➕ New Invoice</h3>
          <p>Create sales invoice</p>
        </Link>
        <Link href="/sales/customers/new" className="action-card">
          <h3>👤 Add Customer</h3>
          <p>Register new customer</p>
        </Link>
      </div>
    </div>
  );
}